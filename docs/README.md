# kintone Plugin Uploader

## Description

This script is a tool for uploading and updating kintone plugin files. It provides the following features:
- Retrieves kintone domain, username, and password from environment variables, command-line arguments, or an environment variable file.
- Uploads and updates plugin files.
- Saves and loads plugin IDs.
- Optionally watches for changes to the plugin file and automatically uploads it.

## Usage

### Installation

1. Clone the repository:
    git clone https://github.com/rex0220/kintone-plugin-uploader.git
    cd kintone-plugin-uploader

2. Install dependencies:
    npm install

### Running the Script

    node plugin-uploader.js --file <path_to_plugin_file> [options]

### Options

- `--envfile`, `-e`: Path to the environment variable file.
- `--domain`, `-d`: kintone domain.
- `--username`, `-u`: kintone username.
- `--password`, `-p`: kintone password.
- `--file`, `-f`: The path of the plugin file. (Required)
- `--watch`, `-w`: Watch the plugin file for changes. (Default: false)
- `--waittime`, `-t`: Wait time in milliseconds before uploading. (Default: 0)
- `--id`, `-i`: Plugin ID. (Default: '')

### Environment Variable File

If you want to use an environment variable file, create a `.env` file with the following format:

    KINTONE_DOMAIN=your_domain
    KINTONE_USERNAME=your_username
    KINTONE_PASSWORD=your_password

### Example

    node plugin-uploader.js --file ./my-plugin.zip --domain mydomain --username myuser --password mypass

### Author

Created by rex0220

## License

This project is licensed under the MIT License.
