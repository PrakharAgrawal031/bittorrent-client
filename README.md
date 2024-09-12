# Node.js BitTorrent Client

This is a BitTorrent client implemented in Node.js. The client can parse `.torrent` files, communicate with trackers, and connect to peers for downloading files.

## Features
- Parses `.torrent` files.
- Communicates with HTTP trackers to fetch peers.
- Manages peer connections (handshakes).
- Downloads file pieces from peers.

## Requirements

- Node.js (v14 or later)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/node-bittorrent-client.git
    cd node-bittorrent-client
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

## Usage

1. Place the `.torrent` file you want to download in the project directory or provide its full path in the code.
2. Run the client:

    ```bash
    node torrent_client.js
    ```

3. Example code for parsing and fetching peers:

    ```javascript
    const torrentParser = require('./torrent_parser');  // Adjust the path as needed
    const trackerCommunicator = require('./tracker_communicator');  // Adjust the path as needed

    const torrentFile = 'example.torrent';  // Replace with your .torrent file path
    const torrentInfo = torrentParser.parseTorrent(torrentFile);
    trackerCommunicator.getPeersFromTracker(torrentInfo);
    ```

## Roadmap
- [ ] Implement peer handshaking.
- [ ] Manage piece requests and downloads.
- [ ] File assembly and verification.
- [ ] Improve error handling and performance.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have suggestions or improvements.

## License

This project is licensed under the MIT License.
