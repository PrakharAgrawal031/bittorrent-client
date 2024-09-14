const dgram = require('dgram');
const {Buffer} = require('buffer');
const urlParse = require('url');
const torrentParser = require('./torrent-parser.js');

module.exports.getpeers = (torrent, callback) => {
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    try {
        udpSend(socket,buildConnReq, url);
    } catch (error) {
        console.error("Error sending connection request: " + error.message)
    }

    socket.on('message', response => {
        if(resType(response)==='connect'){
            const connResponse = parseConnResponse(response); 
            const announceRequest = buildAnnounceRequest(connResponse.connectionId);
            udpSend(socket, announceRequest, url);
        } else if(resType(response)==='announce'){
            const announceResponse = parseAnnounceResponse(response);
            callback(announceResponse.peers);
        }
    });
};

function udpSend(socket, message, rawUrl, callback=()=>{}){
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.host, callback)
}

function resType(response){
    //..
}

function buildConnReq(){
    //..
}

function parseConnResp(){
    //..
}

function buildAnnounceReq(){
    //..
}

function parseAnnounceResp(){
    //..
}


