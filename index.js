'use strict';

const download = require('./src/download.js')
const torrentParser = require('./src/torrent-parser.js')

let filename = process.argv[2];

if(!filename){
    console.error('Provide a torrent file path as argument');
    process.exit(1);
}

let torrent;
try {
    torrent = torrentParser.open(filename);
} catch (error) {
    console.error('Error opening torrent file: ', error);
    process.exit(1);
}

download.main(torrent, torrent.info.name);
