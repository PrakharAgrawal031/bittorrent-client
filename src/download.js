'use strict';

const net = require('net');
const { Buffer } = require('buffer');
const tracker = require('./tracker.js');

module.exports = torrent => {
    tracker.getpeers(torrent, peers =>{
        peers.forEach(download);
    });
};

function download(peer){
    const socket = net.Socket();
    socket.on('error', console.log())
    socket.connect(peer.port, peer.ip, ()=>{
        //TODO: write a message for socket here
    });

    socket.on('data', data =>{
        //TODO: handle response
    })

}