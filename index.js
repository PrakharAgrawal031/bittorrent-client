'use strict';
const fs = require('fs');
const bencode = require('bencode');
const tracker = require('./src/tracker.js');
const torrentParser = require('./src/torrent-parser.js')
const torrent = torrentParser.open('./bit3.torrent')

tracker.getpeers(torrent, peers=>{
    console.log('list of peers: ', peers);
})
