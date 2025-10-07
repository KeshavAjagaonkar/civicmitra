let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
}

function getSocketIO() {
  return ioInstance;
}

module.exports = { setSocketIO, getSocketIO };


