/**
 * plugin-uploader.js
 * Created by rex0220
 * 
 * このスクリプトは、Kintoneにプラグインファイルをアップロードおよび更新するためのツールです。
 * 以下の機能を提供します：
 * - 環境変数やコマンドライン引数、または環境変数ファイルからKintoneのドメイン、ユーザー名、パスワードを取得。
 * - プラグインファイルのアップロードおよび更新。
 * - プラグインIDの保存および読み込み。
 * - オプションでプラグインファイルの変更を監視し、自動アップロード。
 */

const axios = require('axios');
const fs = require('fs');
const { FormData } = require('formdata-node');
const { fileFromPath } = require('formdata-node/file-from-path');
const path = require('path');
const yargs = require('yargs');
const kleur = require('kleur');
const dotenv = require('dotenv');

// プラグインIDファイルパス
const pluginIdPath = 'pluginId.txt';

// 実行時パラメータを取得します
const argv = yargs
    .option('envfile', {
        alias: 'e',
        description: 'Path to the environment variable file',
        type: 'string'
    })
    .option('domain', {
        alias: 'd',
        description: 'kintone domain',
        type: 'string'
    })
    .option('username', {
        alias: 'u',
        description: 'kintone username',
        type: 'string'
    })
    .option('password', {
        alias: 'p',
        description: 'kintone password',
        type: 'string'
    })
    .option('file', {
        alias: 'f',
        description: 'The path of the plugin file.',
        type: 'string',
        demandOption: true
    })
    .option('watch', {
        alias: 'w',
        description: 'Watch the plugin file.',
        type: 'boolean',
        default: false
    })
    .option('waittime', {
        alias: 't',
        description: 'waittime[ms].',
        type: 'number',
        default: 0
    })
    .option('id', {
        alias: 'i',
        description: 'plugin ID.',
        type: 'string',
        default: ''
    })
    .help()
    .alias('help', 'h')
    .argv;

// 環境変数ファイルの読み込み
if (argv.envfile) {
    const envFilePath = path.resolve(argv.envfile);
    const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

// 環境変数を取得します
const envDomain = process.env.KINTONE_DOMAIN;
const envUsername = process.env.KINTONE_USERNAME;
const envPassword = process.env.KINTONE_PASSWORD;

// パラメータを変数に格納します
const subdomain = argv.domain || envDomain;
const username = argv.username || envUsername;
const password = argv.password || envPassword;
const pluginFilePath = argv.file;
const watchMode = argv.watch;
const waitTime = argv.waittime;
const pPluginId = argv.id;

// 環境変数またはコマンドライン引数が不足している場合のチェック
if (!subdomain || !username || !password || !pluginFilePath) {
    console.error(kleur.red('Domain, username, password, and file are required.'));
    process.exit(1);
}

// プラグインIDの書き込み
function writePluginID(content) {
    try {
        fs.writeFileSync(pluginIdPath, content, 'utf8');
    } catch (error) {
        console.error(kleur.red('Could not write pluginId file:'), error.message);
        return '';
    }
}

// プラグインIDをロード
function loadPluginID() {
    try {
        const rawData = fs.readFileSync(pluginIdPath, 'utf8');
        return rawData;
    } catch (error) {
        console.error(kleur.red('Could not load pluginId file:'), error.message);
        return '';
    }
}

// プラグインをアップロードする非同期関数
async function uploadPlugin() {
    try {
        // プラグインファイルを読み込み、FormDataオブジェクトを作成します
        const form = new FormData();
        form.append('file', await fileFromPath(pluginFilePath));

        // KintoneのファイルアップロードAPIエンドポイント
        const fileUploadUrl = `https://${subdomain}/k/v1/file.json`;

        // ヘッダーに基本認証とFormDataのヘッダーを設定します
        const fileUploadHeaders = {
            'X-Cybozu-Authorization': Buffer.from(`${username}:${password}`).toString('base64'),
            ...form.headers
        };

        const pluginId = pPluginId || loadPluginID();

        // ファイルをアップロードしてfileKeyを取得します
        console.log('Uploading file...');
        const fileUploadResponse = await axios.post(fileUploadUrl, form, { headers: fileUploadHeaders });
        const fileKey = fileUploadResponse.data.fileKey;
        console.log('File uploaded successfully. fileKey:', fileKey);

        // Kintoneのプラグイン読み込みAPIエンドポイント
        const pluginUploadUrl = `https://${subdomain}/k/v1/plugin.json`;

        // ヘッダーに基本認証を設定します
        const pluginUploadHeaders = {
            'X-Cybozu-Authorization': Buffer.from(`${username}:${password}`).toString('base64'),
            'Content-Type': 'application/json'
        };

        // プラグイン読み込みリクエストのペイロード
        const payload = { fileKey: fileKey };

        if (pluginId) {
            // プラグインの更新
            try {
                payload.id = pluginId;
                const respUpload = await axios.put(pluginUploadUrl, payload, { headers: pluginUploadHeaders });
                console.log('Plugin updated successfully.', respUpload.data);
                return;
            } catch (error) {
                console.error(kleur.red('Error updating plugin:'), error.response ? error.response.data : error.message);
                // 未インストールの場合、インストール処理へ
            }
        }

        // プラグインのインストール
        const respUpload = await axios.post(pluginUploadUrl, payload, { headers: pluginUploadHeaders });
        console.log('Plugin added successfully.', respUpload.data);
        if (!pPluginId) writePluginID(respUpload.data.id);
    } catch (error) {
        console.error(kleur.red('Error uploading plugin:'), error.response ? error.response.data : error.message);
    }
}

// ファイルの変更を監視する関数
function watchFile(file) {
    fs.watchFile(file, (curr, prev) => {
        // プラグインをアップロード
        uploadPlugin();
    });
}

// 待ち時間
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// プラグインをアップロード
async function main() {
    if (waitTime > 0) {
        await delay(waitTime);
    }

    await uploadPlugin();
    if (watchMode) {
        watchFile(pluginFilePath);
    }
}

main();
