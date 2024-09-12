const fs = require('fs');
const bencode = require('bencode'); 

function parsetorrentfile(filename) {
    try {
        const torrentBuffer = fs.readFileSync(filename);
        const torrent = bencode.decode(torrentBuffer);

        const announce = torrent.announce ? torrent.announce.toString() : "No announce URL available";
        const info = torrent.info || {};
        const pieceLength = info.piece_length || "No piece length available";
        const piece = info.pieces ? info.pieces.toString('hex') : "No pieces available";
        const fileName = info.name ? info.name.toString() : "No file name available";
        const fileLength = info.length || "No file length available";

        // Output the extracted information
        console.log("Content in announce: ");
        console.log(announce);
        console.log("Content in info: ");
        console.log(info);

        return {
            announce,
            info,
            pieceLength,
            piece,
            fileName,
            fileLength
        };
    } catch (error) {
        console.error("Error reading or parsing the torrent file:", error);
    }
}


const result = parsetorrentfile('gta5.torrent');
console.log("Parsed torrent result:");
console.log(result); 
