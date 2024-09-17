"use strict";
const fs = require("fs");
const message = require('./message.js')
const Pieces = require("./pieces.js");
const Queue = require("./queue.js");
const net = require("net");
const Buffer = require("buffer").Buffer;
const tracker = require("./tracker.js");

const main = (torrent, path) => {
  tracker.getpeers(torrent, (peers) => {
    const pieces = new Pieces(torrent);
    const file = fs.openSync(path, "w");
    peers.forEach((peer) => handlePeer(peer, torrent, pieces, file));
  });
};

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
function handlePeer(peer, torrent, pieces, file) {
  const socket = new net.Socket();
  socket.on("error", (err) => {
    console.log(
      `Error connecting to peer ${peer.ip}:${peer.port} - ${err.message}`
    );
    socket.end();
  });

  socket.connect(peer.port, peer.ip, () => {
    console.log(`Connected to peer ${peer.ip}:${peer.port}`);
    socket.write(message.buildHandshake(torrent));
  });

  const queue = new Queue(torrent);
  onWholeMssg(socket, peer.ip, (message) =>
    mssgHandler(message, socket, pieces, queue, torrent, file)
  );
}

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

function mssgHandler(mssg, socket, pieces, queue, torrent, file) {
  if (isHandshake(mssg)) {
    socket.write(message.buildInterested());
  } else {
    const m = message.parse(mssg);
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

function chokeHandler(socket) {
  socket.end();
}

function unchokeHandler(socket, pieces, queue) {
  queue.choked = false;
  requestPiece(socket, pieces, queue);
}

function haveHandler(socket, pieces, queue, payload) {
  const pieceIndex = payload.readUInt32BE(0);
  const queueEmpty = queue.length === 0;
  queue.queue(pieceIndex);
  if (queueEmpty) requestPiece(socket, pieces, queue);
}

function bitfieldHandler(socket, pieces, queue, payload) {
  const queueEmpty = queue.length === 0;
  payload.forEach((byte, i) => {
    for (let j = 0; j < 8; j++) {
      if (byte % 2) queue.queue(i * 8 + 7 - j);
      byte = Math.floor(byte / 2);
    }
  });
  if (queueEmpty) requestPiece(socket, pieces, queue);
}

function pieceHandler(socket, pieces, queue, torrent, file, payload) {
  pieces.printPercentDone();
  pieces.addRecieve(pieceResponse);

  const offset =
    pieceResponse.index * torrent.info[" piece length "] + pieceResponse.begin;
  fs.writeFile(
    file,
    pieceResponse.block,
    0,
    pieceResponse.block.length,
    offset,
    (err) => {
      if (err) console.log("Error writing to file:", err);
    }
  );

  if (pieces.isDone()) {
    console.log("Download Complete");
    socket.end();
    try {
      fs.closeSync(file);
    } catch (e) {
      console.error(`Error closing file `, err);
    }
  } else {
    requestPiece(socket, pieces, queue);
  }
}

function requestPiece(socket, pieces, queue) {
  if (queue.choked) return null;

  while (queue.length()) {
    const pieceBlock = queue.deque();
    if (pieces.needed(pieceBlock)) {
      socket.write(message.buildRequest(pieceBlock));
      pieces.addRequested(pieceBlock);
      break;
    }
  }
}

module.exports = {
  main
}
