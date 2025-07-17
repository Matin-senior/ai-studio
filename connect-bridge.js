// 📦 نصب نیازها قبل از اجرا:
// npm install express ws axios node-fetch localtunnel portfinder dgram simple-peer node-forge

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fetch = require('node-fetch');
const localtunnel = require('localtunnel');
const portfinder = require('portfinder');
const os = require('os');
const dgram = require('dgram');
const SimplePeer = require('simple-peer');
const forge = require('node-forge');
const wrtc = require('wrtc');

const RSA = forge.pki.rsa;
const { publicKey, privateKey } = RSA.generateKeyPair(2048);

const log = (...args) => console.log('[SuperConnect]', ...args);

// ================= Broadcast Discovery (UDP) =================
function startUDPBroadcast(port) {
  const socket = dgram.createSocket('udp4');
  const msg = Buffer.from(`DISCOVER_AI_SERVER:${port}`);

  socket.on('listening', () => {
    socket.setBroadcast(true);
    log('🔊 UDP Broadcast initialized on port 41234');
    setInterval(() => {
      socket.send(msg, 0, msg.length, 41234, '255.255.255.255');
    }, 3000);
  });

  socket.on('error', err => {
    log('UDP socket error:', err);
    socket.close();
  });

  socket.bind(() => {});
}

// ================= Peer Connection via WebRTC ================
let peers = [];
function setupWebRTCSignaling(wss) {
  wss.on('connection', socket => {
    let peer;
    try {
      peer = new SimplePeer({ initiator: true, trickle: false, wrtc });
    } catch (e) {
      log('❌ SimplePeer error:', e);
      return;
    }
    peer.on('signal', data => {
      try {
        socket.send(JSON.stringify({ type: 'signal', data }));
      } catch (e) {
        log('❌ WebRTC signal send error:', e);
      }
    });
    socket.on('message', msg => {
      try {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'signal') peer.signal(parsed.data);
      } catch (e) {
        log('❌ WebRTC message parse error:', e);
      }
    });
    peer.on('connect', () => log('📡 WebRTC peer connected'));
    peer.on('data', data => log('📥 WebRTC data:', data.toString()));
    peer.on('close', () => {
      log('🔌 WebRTC peer disconnected');
      peers = peers.filter(p => p !== peer);
    });
    peer.on('error', err => log('❌ WebRTC peer error:', err));
    peers.push(peer);
  });
}

// ================= File Server & AI Server ===================
async function startServer() {
  const app = express();
  const server = http.createServer(app);
  let wss;
  if (!server._wss) {
    wss = new WebSocket.Server({ server });
    server._wss = wss;
  } else {
    wss = server._wss;
  }

  const port = await portfinder.getPortPromise();
  app.use(express.json());
  // CORS for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.get('/', (_, res) => res.send('AI Hub Online ✅'));
  app.get('/ip', (_, res) => res.send(getLocalIP()));

  app.post('/secure-message', (req, res) => {
    try {
      const { encrypted } = req.body;
      const decrypted = privateKey.decrypt(forge.util.decode64(encrypted));
      log('🔐 Decrypted message:', decrypted);
      res.send('OK');
    } catch (e) {
      log('❌ Secure message decrypt error:', e);
      res.status(400).send('Decrypt error');
    }
  });

  wss.on('connection', socket => {
    log('⚡ WebSocket client connected');
    socket.on('message', msg => {
      try {
        log('🧾 Message:', msg.toString());
      } catch (e) {
        log('❌ WS message error:', e);
      }
    });
    socket.send('🧠 Connected to AI Core');
    socket.on('close', () => log('🔌 WebSocket client disconnected'));
    socket.on('error', err => log('❌ WebSocket error:', err));
  });

  setupWebRTCSignaling(wss); // فقط wss را پاس بده
  startUDPBroadcast(port);

  server.listen(port, async () => {
    log(`🧠 AI Core running on http://localhost:${port}`);
    log(`🌐 LAN Access via ws://${getLocalIP()}:${port}`);

    if (!process.env.NO_TUNNEL) {
      try {
        const tunnel = await localtunnel({ port });
        log(`🌍 Public Tunnel: ${tunnel.url}`);
        tunnel.on('close', () => log('🔒 Tunnel closed'));
        tunnel.on('error', (err) => {
          log('❌ Tunnel connection error:', err);
        });
      } catch (e) {
        log('❌ Tunnel error:', e);
      }
    } else {
      log('🚫 Tunnel disabled by NO_TUNNEL env');
    }
  });

  // Fallback AI model selection logic
  const models = ['ollama', 'llama.cpp', 'transformer.js'];
  let selectedModel = 'none';
  for (const m of models) {
    if (checkModelAvailable(m)) {
      selectedModel = m;
      break;
    }
  }
  log(`💡 Selected AI Model: ${selectedModel}`);

  // Graceful shutdown
  process.on('SIGINT', () => {
    log('🛑 Shutting down...');
    try { server.close(); } catch {}
    try { wss.close(); } catch {}
    peers.forEach(p => { try { p.destroy(); } catch {} });
    process.exit(0);
  });
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) return config.address;
    }
  }
  return '127.0.0.1';
}

function checkModelAvailable(name) {
  try {
    require.resolve(name);
    return true;
  } catch {
    return false;
  }
}

startServer().catch(err => console.error('❌ Failed to start server:', err));
