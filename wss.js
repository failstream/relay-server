const WebSocket = require('ws');
const ClientManager = require('./client-manager.js');
const Client = require('./client.js');

let clientManager = new ClientManager();
let wss = null;

function initWsServer(port) {
    if (wss) {
        console.log('attempting to init ws server when already initialized.');
        return;
    }

    wss = new WebSocket.Server({ port: port }, () => {
        console.log(`WebSocket server started on ws://localhost:${port}`);
    });

    wss.on('connection', (ws, req) => {
        const INITIAL_TIMEOUT_LENGTH = 10000;
        const TIMEOUT_LENGTH = 300000;
        let timeout = INITIAL_TIMEOUT_LENGTH;

        let registered = false;
        let registrationTimeout = setDisconnectTimeout(ws, timeout);

        // Handle incoming messages.
        ws.on('message', (message) => {
            clearTimeout(registrationTimeout);
            try {
                const data = validateMessage(message);
                const response = handleMessage(ws, data);
                if (!registered) {
                    if (data.type !== TYPE.REGISTER) {
                        const err = new Error(`Client has not sent registration message.`);
                        err.type = 'registration';
                        err.code = 402;
                        throw err;
                    }
                    registered = true;
                    timeout = TIMEOUT_LENGTH;
                }
                ws.send(JSON.stringify(response));
            } catch (error) {
                ws.send(JSON.stringify(error));
            }
            registrationTimeout = setDisconnectTimeout(ws, timeout);

        });

        // Handle connection close
        ws.on('close', () => {
            console.log(`Connection with unique variable ${broadcaster_id} closed`);
        });
    });
}

function setDisconnectTimeout(ws, length) {
    return setTimeout(() => {
        console.log('Connection timed out due to inactivity. Disconnecting...');
        ws.close();
    }, length);
}

function registerClient(ws, role, broadcaster_id) {
    const err = new Error();
    err.type = 'registration';
    err.code = 403;
    try {
        const cli = clientManager.getClient(broadcaster_id);
        if (role === ROLE.EXTENSION) {
            cli.addExtSocket(ws);
        } else if (role === ROLE.APP) {
            cli.addLocalSocket(ws);
        } else {
            err.message = `Cannot register server role`;
            throw err;
        }
        return { success: 'Ok.', action: 'Socket registered.' };
    } catch (error) {
        throw error;
    }
}

function relayMessage(broadcaster_id, target, data) {
    const err = new Error();
    err.type = 'relay';
    err.code = 403;
    try {
        const cli = clientManager.getClient(broadcaster_id);
        let targetSocket;
        if (target === ROLE.APP) {
            if (!cli.localSocketValid()) {
                err.message = `app for broadcaster ${broadcaster_id} is not connected.`;
                throw err;
            }
            targetSocket = cli.getLocalSocket();
        } else if (target === ROLE.EXTENSION) {
            if (!cli.extSocketValid()) {
                err.message = `ext for broadcaster ${broadcaster_id} is not connected.`;
                throw err;
            }
            targetSocket = cli.getExtSocket();
        } else {
            err.message = `invalid target ${target} for relay message`;
            throw err;
        }

        targetSocket.send(JSON.stringify(data));
        return { success: 'Ok.', action: 'Message relayed.' };
    } catch (error) {
        throw error;
    }
}

function handleMessage(ws, data) {
    const { role, type, broadcaster_id, target } = data;
    try {
        switch (type) {
            case TYPE.REGISTER:
                return registerClient(ws, role, broadcaster_id);
            case TYPE.RELAY:
                return relayMessage(broadcaster_id, target, data);
            case TYPE.ERROR:
                console.log('error message not implemented yet');
                break;
            case TYPE.MESSAGE:
                console.log('type message not yet implemented.');
                break;
        }
    } catch (error) {
        throw error;
    }

}


// -------------------- Message validation objects and functions:


const TYPE = Object.freeze({
    REGISTER: 'register',
    MESSAGE: 'message',
    RELAY: 'relay',
    ERROR: 'error',
});

const ROLE = Object.freeze({
    EXTENSION: 'extension',
    APP: 'app',
    SERVER: 'server',
});

/**
 * Validates a message to ensure it conforms with valid messaging protocol
 * @param {string} message - JSON string of message that was sent over websocket  
 * @returns - parsed JSON object that has been validated
 */
function validateMessage(message) {
    const err = new Error();
    err.type = 'validation';
    err.code = 403;
    try {
        const data = JSON.parse(message);

        if (!data.type || !isValidEnumValue(data.type, TYPE)) {
            err.message = `Invalid or missing message type`;
            throw err;
        }

        if (!data.role || !isValidEnumValue(data.role, ROLE)) {
            err.message = `Invalid or missing message role`;
            throw err;
        }

        if (!data.target || !isValidEnumValue(data.target, ROLE)) {
            err.message = `Invalid or missing message target`;
            throw err;
        }

        if (!data.broadcaster_id) {
            err.message = `Missing broadcaster_id`;
            throw err;
        }

        if (!clientManager.hasClient(data.broadcaster_id)) {
            err.message = `Invalid broadcaster_id`;
            throw err;
        }

        if (data.type === TYPE.MESSAGE && !data.payload) {
            err.message = `Message has no payload`;
            throw err;
        }

        return data;

    } catch (error) {
        throw error;
    }

}

function isValidEnumValue(value, enumObject) {
    return Object.values(enumObject).includes(value);
}


module.exports = {
    initWsServer,
    setClientManagerWSS,
};