"use strict";

const fs = require("fs");
const bencode = require("bencode");
const crypto = require("crypto");
// const BigInt = require('bigint');
module.exports.open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

function bigIntToBuffer(value, size = 8) {
  const buffer = Buffer.alloc(size);

  for (let i = size - 1; i >= 0; i--) {
    buffer[i] = Number(value & 0xffn); // Get the least significant byte
    value >>= 8n; // Shift the value right by 8 bits
  }

  return buffer;
}

module.exports.size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
    : torrent.info.length;

  return bigIntToBuffer(BigInt(size), 8); // Pass 8 as the fixed buffer size
};

module.exports.infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash("sha1").update(info).digest();
};
