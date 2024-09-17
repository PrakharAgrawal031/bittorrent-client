'use strict';

const torrentParser = require('./torrent-parser.js');

module.exports = class {
    constructor(torrent){
        this._torrent = torrent;
        this._queue = [];
        this.chocked = true;
    }

    queue(pieceIndex){
        const nBlocks = torrentParser.blocksPerPiece(this._torrent, pieceIndex);

        const length_all = torrentParser.blockLen(this._torrent, pieceIndex, 0); //length of all blocks except the last
        const length_last = torrentParser.blockLen(this._torrent, pieceIndex, nBlocks - 1); //length of the last block

        for(let i = 0; i < nBlocks; i++){
            const pieceBlock = {
                index: pieceIndex,
                begin: i * torrentParser.BLOCK_LENGTH,
                length: (i==nBlocks-1)?length_last: length_all
            };
            this._queue.push(pieceBlock);
        }
    }

    dequeue() {return this._queue.shift();}
    peek() {return this._queue[0];}
    length() {return this._queue.length;}
};