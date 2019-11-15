# Ravisher
A good looking search tool for Rarbg that directly adds to qBittorrent.

## Features
*This list will be updated as features are added*

- [x] Filtered Rarbg search
- [x] Add directly to qBittorrent
- [x] Torrent name parsing
- [ ] Highlight optimal torrent
- [ ] "Desperate mode" (remove high quality filter)

## Installation

1. Clone this repo
2. Run `npm i` to install the packages
3. Read [this pull request](https://github.com/vonthar/node-qbittorrent-api/pull/1) to fix the qBittorrent package
4. Add an `auth.json` file in the `server/` folder (see below)
5. Run with `npm start` or `node server/server.js`

## Usage

After running with `npm start`, navigate to `http://host:8282` in your browser, replacing `host` with the IP of the machine running Ravisher. Enter the username and password specified in your auth file.

## Common problems

Sometimes you will see a "No results found" error message for new or popular content. Wait a few seconds and try to search again.

### auth.json
Replace the values in this file with the correct values for your setup.
```json
{
	"hostname": "http://your.qbittorrent.url",
	"username": "admin",
	"password": "adminadmin"
}
```