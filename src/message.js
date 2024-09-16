"use strict";

const { Buffer } = require("buffer");
const torrentParser = require("./torrent-parser.js");
const util = require("./util.js");

//Hanshake is the first message sent by client. size = 49+length(pstr) bytes.
//handshake: <pstrlen><pstr><reserved><info_hash><peer_id>

const buildHandshake = (torrent) => {
  const buffer = Buffer.alloc(68);

  buffer.writeUInt8(19, 0); //pstrlen
  buffer.write("BitTorrent protocol", 1); //pstr as per BitTorrent Specifications wiki
  buffer.writeUint32BE(0, 20); //reserved 4bytes +
  buffer.writeUint32BE(0, 24); //reserved 4bytes
  torrentParser.infoHash(torrent).copy(buffer, 28); //infoHash
  util.genId().copy(buffer, 48); //peerID
  return buffer;
};

// All other messages will take form of <length prefix><messageID><payload>
//Length prefix = 4bytes
//Message ID = single decimal byte
//Payload = Depends on message

const buildKeepAlive = () => Buffer.alloc(4); //sent repeatedly in a certain time interval(generally 2 mins) to keep connection alive.

const buildChoke = () => {
  //fixed length, no payload.
  //Choke: <len=0001><id=0>
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(0, 4); //ID
  return buffer;
};

const buildUnchoke = () => {
  //fixed length, no payload.
  //Unchoke: <len=0001><id=1>
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(1, 4); //ID
  return buffer;
};

const buildInterested = () => {
  //fixed length, no payload.
  //Interested: <len=0001><id=2>
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(2, 4); //ID
  return buffer;
};

const buildUninterested = () => {
  //fixed length, no payload.
  //Uninterested: <len=0001><id=3>
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(3, 4); //ID
  return buffer;
};

const buildHave = (payload) => {
  //fixed length, payload = 0based index of recently downloaded piece and verified using hash.
  //Have: <len=0005><id=4><piece index>
  const buffer = Buffer.alloc(9);
  buffer.writeUInt32BE(5, 0);
  buffer.writeUInt8(4, 4); //ID
  buffer.writeUInt32BE(payload, 5); //piece index
  return buffer;
};

const buildBitfield = (bitfield) => {
  // Variable length. Sent immediately after hanshake. Optional.
  //Bitfield: <len=0001+x><id=5><bitfield>
  const buffer = Buffer.alloc(bitfield.length + 5);
  buffer.writeUInt32BE(bitfield.length + 1, 0);
  buffer.writeUInt8(5, 4); //ID
  bitfield.copy(buffer, 5); //bitfield
  return buffer;
};

const buildRequest = (payload) => {
  // fixed length. Used to request a block. Contents of payload: index, begin, length
  //Request: <len=0013><id=6><index><begin><length>
  const buffer = Buffer.alloc(17);
  buffer.writeUInt32BE(13, 0);
  buffer.writeUInt8(6, 4); //ID
  buffer.writeUInt32BE(payload.index, 5); //index
  buffer.writeUInt32BE(payload.begin, 9); //begin
  buffer.writeUInt32BE(payload.length, 13); //length
  return buffer;
};

const buildPiece = (payload) => {
  // Variable length. Sent after a request. Contents of payload: index, begin, block
  //Piece: <len=0009+x><id=7><index><begin><block>
  const buffer = Buffer.alloc(payload.block.length + 13);
  buffer.writeUInt32BE(payload.block.length + 9, 0);
  buffer.writeUInt8(7, 4); //ID
  buffer.writeUInt32BE(payload.index, 5); //index
  buffer.writeUInt32BE(payload.begin, 9); //begin
  payload.block.copy(buffer, 13); //block
  return buffer;
};

const buildCancel = (payload) => {
  // fixed length. Used to cancel a block request. Contents of payload: index, begin, length
  //Cancel: <len=0013><id=8><index><begin><length>
  const buffer = Buffer.alloc(17);
  buffer.writeUInt32BE(13, 0);
  buffer.writeUInt8(8, 4); //ID
  buffer.writeUInt32BE(payload.index, 5); //index
  buffer.writeUInt32BE(payload.begin, 9); //begin
  buffer.writeUInt32BE(payload.length, 13); //length
  return buffer;
};

const buildPort = (payload) => {
  // fixed length. Sent after handshake to announce the port number.
  //Port: <len=0003><id=9><port>
  const buffer = Buffer.alloc(7);
  buffer.writeUInt32BE(3, 0);
  buffer.writeUInt8(9, 4); //ID
  buffer.writeUInt16BE(payload, 5); //port
  return buffer;
};

const parse = (message) => {
  const id = message.length > 4 ? message.readInt8(4) : null;
  let payload = message.length > 5 ? message.subarray(5) : null;
  if (id === 6 || id === 7 || id === 0) {
    const rest = payload.subarray(8);
    payload = {
      index: rest.readInt32BE(0),
      begin: rest.readInt32BE(4),
    };
    payload[id === 7 ? "block" : "length"] = rest;
  }

  return {
    size: message.readInt32BE(0),
    id: id,
    payload: payload,
  };
};

module.exports = {
  buildHandshake,
  buildKeepAlive,
  buildChoke,
  buildUnchoke,
  buildInterested,
  buildUninterested,
  buildHave,
  buildBitfield,
  buildRequest,
  buildPiece,
  buildCancel,
  buildPort,
  parse,
};
