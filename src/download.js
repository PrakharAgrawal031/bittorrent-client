'use strict';

const net = require('net');
const Buffer = require('buffer').Buffer;
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

function onWholeMssg(socket, peer_ip, callback){
    let savedBuffer = Buffer.alloc(0)
    let handshake = true;

    socket.on('data', recvBuffer =>{
        const mssgLength = () => handshake ? savedBuffer.readUInt8(0) + 49 : savedBuffer.readUInt32BE(0) + 4;
        savedBuffer = Buffer.concat([savedBuffer, recvBuffer]);

        while(savedBuffer.length >= 4 && savedBuffer.length >= mssgLength()){
            callback(savedBuffer.subarray(0, mssgLength()));
            savedBuffer = savedBuffer.subarray(mssgLength());
            handshake = false;
        }
    });

    socket.on('end', ()=>{
        console.log(`Peer ${peer_ip} disconnected`);
    });
}