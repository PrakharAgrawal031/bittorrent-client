"use strict";

const fs = require("fs");
const bencode = require("bencode");
const crypto = require("crypto");
const BigNumber = require("bignumber.js");
const open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

// function bigIntToBuffer(value, size = 8) {
//   const buffer = Buffer.alloc(size);

//   for (let i = size - 1; i >= 0; i--) {
//     buffer[i] = Number(value & 0xffn); // Get the least significant byte
//     value >>= 8n; // Shift the value right by 8 bits
//   }

//   return buffer;
// }

//Used bignumber.js instead of above code

const size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files
        .map((file) => new BigNumber(file.length))
        .reduce((a, b) => a.plus(b), new BigNumber(0))
    : new BigNumber(torrent.info.length);

  const sizeBuffer = Buffer.alloc(8);
  sizeBuffer.writeBigUInt64BE(BigInt(size.toFixed()))

  return sizeBuffer;
};

const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash("sha1").update(info).digest();
};

module.exports = {
  open,
  size,
  infoHash,
};
