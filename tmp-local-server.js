
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ port: 5050 });
    wss.on('connection', (ws) => {
      ws.on('message', (msg) => {
        console.log('Received:', msg.toString());
        ws.send('Echo: ' + msg.toString());
      });
    });
    console.log('✅ Local WS server running on ws://localhost:5050');
  