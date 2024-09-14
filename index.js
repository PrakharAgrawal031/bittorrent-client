'use strict';
const fs = require('fs');
const bencode = require('bencode');
const tracker = require('./src/tracker.js');

const torrent = bencode.decode(fs.readFileSync('./bit1.torrent'));

tracker.getpeers(torrent, peers=>{
    console.log('list of peers: ', peers);
})
