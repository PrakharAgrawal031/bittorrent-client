'use strict';

const torrentParser = require('./torrent-parser.js');

module.exports = class {
    constructor(size){

        function buildPieceArray(){
            const nPieces = Math.ceil(torrent.info.pieces.length /20);
            const arr = new Array(nPieces).fill(null);
            return arr.map((_,i)=> new Array(torrentParser.blocksPerPiece(torrent, i)).fill(false))
        }

        this.requested = new Array(size).fill(false);
        this.recieved = new Array(size).fill(false);
    }

    addRequested(pieceBlock){
        const blockIndex = pieceBlock.begin / torrentParser.BLOCK_LENGTH;
        this.requested[pieceBlock.index][blockIndex]=true;
    }

    addRecieved(pieceBlock){
        const blockIndex = pieceBlock.begin / torrentParser.BLOCK_LENGTH;
        this.recieved[pieceBlock.index][blockIndex]=true;
    }

    needed(pieceBlock){
        if(this.requested.every(blocks => blocks.every(i => i))){
            this.requested = this.recieved.map(blocks => blocks.subarray());
        }
        const blockIndex = pieceBlock.begin / torrentParser.BLOCK_LENGTH;
        return !this.requested[pieceBlock.index][blockIndex];
    }

    isDone(){
        return this.received.every(blocks => blocks.every(i => i));
    }

    printPercentDone() {
        const downloaded = this.recieved.reduce((totalBlocks, blocks) => {
            return blocks.filter(i => i).length + totalBlocks;
        }, 0);

        const total = this.requested.reduce((totalBlocks, blocks) => {
            return blocks.length + totalBlocks;
        }, 0);

        const percent = Math.floor(downloaded / total * 100);

        process.stdout.write('progress' + percent + '%\r');
      }
};
