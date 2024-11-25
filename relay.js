const { initWsServer } = require('./wss.js');

const WSPORT = 8080;

initWsServer(WSPORT);