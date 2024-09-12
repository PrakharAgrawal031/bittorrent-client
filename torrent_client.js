const fs = require('fs');

(async () => {

    const parsetorrent = await import('parse-torrent');
    function parsetorrentfile(filename){
        const torrentBuffer = fs.readFileSync(filename);
        const torrent = parsetorrent(torrentBuffer);
    
        const announce = torrent.announce[0];
        const info = torrent.info;
        const pieceLength = info.pieceLength;
        const piece = info.pieces.toString('hex');
        const fileName = info.name;
        const fileLength = info.length;
        console.log("content in announce: ")
        console.log(announce);
        console.log("content in info: ")
        console.log(info);
        return {
            announce,
            info,
            pieceLength,
            piece,
            fileName,
            fileLength
        };
    }
    
    parsetorrentfile('gta5.torrent');
    
})

