const dgram = require("dgram");
const { Buffer } = require("buffer");
const urlParse = require("url");
const crypto = require("crypto");
const torrentParser = require("../archive/torrent-parser.js");
const util = require("./util.js");

module.exports.getpeers = (torrent, callback) => {
  const socket = dgram.createSocket("udp4");
  const url = torrent.announce.toString("utf8");

  try {
    udpSend(socket, buildConnReq, url);
  } catch (error) {
    console.error("Error sending connection request: " + error.message);
  }

  socket.on("message", (response) => {
    if (resType(response) === "connect") {
      const connResponse = parseConnResp(response);
      const announceRequest = buildAnnounceReq(connResponse.connectionId);
      udpSend(socket, announceRequest, url);
    } else if (resType(response) === "announce") {
      const announceResponse = parseAnnounceResp(response);
      callback(announceResponse.peers);
    }
  });
};

function udpSend(socket, message, rawUrl, callback = () => {}) {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function resType(response) {
  //..
}

function buildConnReq() {
  const buf = Buffer.alloc(16);

  buf.writeUInt32BE(0x417, 0);
  buf.writeUInt32BE(0x27101980, 4);

  buf.writeUInt32BE(0, 8);
  crypto.randomBytes(4).copy(buf, 12);

  return buf;
}

function parseConnResp(response) {
  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    connectionId: response.slice(8),
  };
}

function buildAnnounceReq(connectionId, torrent, port = 6881) {
  const buf = Buffer.allocUnsafe(98);
  // connection id
  connectionId.copy(buf, 0);
  // action
  buf.writeUInt32BE(1, 8);
  // transaction id
  crypto.randomBytes(4).copy(buf, 12);
  // info hash
  torrentParser.infoHash(torrent).copy(buf, 16);
  // peerId
  util.genId().copy(buf, 36);
  // downloaded
  Buffer.alloc(8).copy(buf, 56);
  // left
  torrentParser.size(torrent).copy(buf, 64);
  // uploaded
  Buffer.alloc(8).copy(buf, 72);
  // event
  buf.writeUInt32BE(0, 80);
  // ip address
  buf.writeUInt32BE(0, 80);
  // key
  crypto.randomBytes(4).copy(buf, 88);
  // num want
  buf.writeInt32BE(-1, 92);
  // port
  buf.writeUInt16BE(port, 96);

  return buf;
}

function parseAnnounceResp(response) {
  function group(iterable, groupSize){
    let group = []
    for(let i = 0; i<iterable.length; i+=groupSize){
      group.push(iterable.slice(i, i+groupSize))
    }
    return group;
  }

  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    leechers: response.readUInt32BE(8),
    seeders: response.readUInt32BE(12),
    peers: group(response.slice(20), 6).map(address => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      }
    })
  }
}
