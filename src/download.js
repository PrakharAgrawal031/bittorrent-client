"use strict";
const fs = require("fs");
const message = require("./message.js");
const Pieces = require("./pieces.js");
const Queue = require("./queue.js");
const net = require("net");
const Buffer = require("buffer").Buffer;
const tracker = require("./tracker.js");

const main = (torrent, path) => {
    tracker.getpeers(torrent, peers => {
        const pieces = new Pieces(torrent);
        const file = fs.openSync(path, 'w');
        peers.forEach(peer => handlePeer(peer, torrent, pieces, file));
    });
}

// function download(peer, torrent) {
//   const socket = net.Socket();
//   socket.on("error", console.log());
//   socket.connect(peer.port, peer.ip, () => {
//     //TODO: write a message for socket here
//   });

//   socket.on("data", (data) => {
//     //TODO: handle response
//   });
// }

//Using handlePeer instead of download
function handlePeer( peer, torrent, pieces, file){
    const socket = new net.Socket()
    socket.on('error', err => {
        console.log(`Error connecting to peer ${peer.ip}:${peer.port} - ${err.message}`);
        socket.end();
    });

    socket.connect(peer.port, peer.ip, () => {
        console.log(`Connected to peer ${peer.ip}:${peer.port}`)
        socket.write(message.buildHandshake(torrent));
    });

    const queue = new Queue(torrent);
    onWholeMssg(socket, peer.ip, message => mssgHandler(message, socket, pieces, queue, torrent, file));
};

function onWholeMssg(socket, peer_ip, callback) {
  let savedBuffer = Buffer.alloc(0);
  let handshake = true;

  socket.on("data", (recvBuffer) => {
    const mssgLength = () =>
      handshake
        ? savedBuffer.readUInt8(0) + 49
        : savedBuffer.readUInt32BE(0) + 4;
    savedBuffer = Buffer.concat([savedBuffer, recvBuffer]);

    while (savedBuffer.length >= 4 && savedBuffer.length >= mssgLength()) {
      callback(savedBuffer.subarray(0, mssgLength()));
      savedBuffer = savedBuffer.subarray(mssgLength());
      handshake = false;
    }
  });

  socket.on("end", () => {
    console.log(`Peer ${peer_ip} disconnected`);
  });
}

function mssgHandler(message, socket, pieces, queue, torrent, file) {
  if (isHandshake(message)) {
    socket.write(message.buildInterested());
  } else {
    const m = message.parse(message);
    switch (m.id) {
      case 0:
        chokeHandler(socket);
        break;
      case 1:
        unchokeHandler(socket, pieces, queue);
        break;
      case 4:
        haveHandler(socket, pieces, queue, m.payload);
        break;
      case 5:
        bitfieldHandler(socket, pieces, queue, m.payload);
        break;
      case 7:
        pieceHandler(socket, pieces, queue, torrent, file, m.payload);
        break;
      default:
        console.log(`Unhandled message type: ${m.id}`);
    }
  }
}

function isHandshake(message) {
  return (
    message.length === message.readUInt8(0) + 49 &&
    message.toString("utf8", 1, 20) === "BitTorrent Protocol"
  );
}
