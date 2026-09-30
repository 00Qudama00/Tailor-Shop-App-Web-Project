// Runs a local MongoDB for development, so MongoDB does not need to be installed.
// Data is saved in backend/data.
const net = require('net');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 27017;

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1');
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

async function start() {
  if (await portInUse(PORT)) {
    console.log(`MongoDB is already running on port ${PORT}`);
    return;
  }

  const dbPath = path.join(__dirname, 'data');
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

  console.log('Starting MongoDB (the first time it downloads MongoDB, please wait)...');
  const server = await MongoMemoryServer.create({
    instance: { port: PORT, dbPath, storageEngine: 'wiredTiger' },
  });
  console.log(`MongoDB running at ${server.getUri()}`);

  async function stop() {
    await server.stop({ doCleanup: false });
    process.exit(0);
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

start().catch((err) => {
  console.error('MongoDB could not start:', err.message);
  process.exit(1);
});
