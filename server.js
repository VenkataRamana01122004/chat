const WebSocket = require('ws');

const rooms = {};

const wss = new WebSocket.Server({ port: 2004 });

wss.on('connection', function connection(ws, req) {
    let roomCode = req.url.slice(1); // Extract room code from URL
    if (!roomCode) {
        return;
    }

    if (!rooms[roomCode]) {
        rooms[roomCode] = { clients: new Set(), messages: [] };
    }

    ws.on('message', function incoming(message) {
        if (!ws.userName) {
            ws.userName = message;
            const entryMessage = `${ws.userName} has joined the chat.`;
            rooms[roomCode].messages.push(entryMessage);

            rooms[roomCode].clients.forEach(function each(client) {
                client.send(entryMessage);
            });

            rooms[roomCode].messages.forEach(function each(msg) {
                ws.send(msg);
            });

        } else {
            const fullMessage = `${ws.userName}: ${message}`;
            rooms[roomCode].messages.push(fullMessage);

            rooms[roomCode].clients.forEach(function each(client) {
                client.send(fullMessage);
            });
        }
    });

    ws.on('close', function close() {
        rooms[roomCode].clients.delete(ws);
        const exitMessage = `${ws.userName} has left the chat.`;
        rooms[roomCode].messages.push(exitMessage);

        rooms[roomCode].clients.forEach(function each(client) {
            client.send(exitMessage);
        });

        if (rooms[roomCode].clients.size === 0) {
            delete rooms[roomCode];
        }
    });

    rooms[roomCode].clients.add(ws);
});
