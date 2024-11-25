/**
 * Client holds all necessary data for communication between extension
 * and local application.
*/

const WebSocket = require('ws');

class Client {
    constructor(id) {
        this.broadcaster_id = id;
        this.localApp = { socket: null };
        this.extApp = { socket: null };
    }

    getLocalSocket() {
        return this.localApp.socket;
    }

    getExtSocket() {
        return this.extApp.socket;
    }

    /**
     * @param {object} socket - websocket object that is connected to the local app
     */
    addLocalSocket(socket) {
        this.localApp.socket = socket;
    }

    /**
     * @param {object} socket - websocket object that is connected to the extension
     */
    addExtSocket(socket) {
        this.extApp.socket = socket;
    }

    localSocketValid() {
        if (this.localApp.socket && this.localApp.socket.readyState === WebSocket.OPEN) {
            return true;
        }
        return false;
    }

    extSocketValid() {
        if (this.extApp.socket && this.extApp.socket.readyState === WebSocket.OPEN) {
            return true;
        }
        return false;
    }

}

module.exports = Client;