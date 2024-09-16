'use strict';

const torrentParser = require('./torrent-parser.js');

module.exports = class {
    constructor(size){
        this.requested = new Array(size).fill(false);
        this.recieved = new Array(size).fill(false);
    }

    addRequested(pieceIndex){
        this.requested[pieceIndex] = true;
    }

    addRecieved(pieceIndex){
        this.recieved[pieceIndex] = true;
    }

    needed(pieceIndex){
        if(this.requested.every(i => i===true)){
            this.requested = this.recieved.subarray();
        }

        return !this.recieved[pieceIndex];
    }

    isDone(){
        return this.recieved.every(i => i===true);
    }
};
