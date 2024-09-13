'use strict';
const fs = require('fs');
const bencode = require('bencode');

/**
 * Open and parse a torrent file.
 * @param {string} filePath - Path to the torrent file.
 * @returns {object} Parsed torrent data.
 */

function open(filePath){
    const fileBuffer = fs.readFileSync(filePath);
    const torrentData = bencode.decode(fileBuffer);

    if(!torrentData.info || !torrentData.info.name){
        throw new Error('Invalid torrent file: Missing "info" or "info.name"');
    }

    return {
        info: torrentData.info,
        announce: torrentData.announce,
        name: torrentData.info.name,
        length: torrentData.info.length,
        files: torrentData.info.files || []
    }
}

module.exports = {
    open
};

