const Client = require('./client.js');

class ClientManager {
    constructor() {
        this.clients = new Map(); // Internal Map to store client data
    }

    /**
     * Adds a new client to the Map.
     * @param {string} id - A unique string identifier for the client.
     * @param {object} data - The object containing the socket and role to add
     */
    addSocket(id, data) {

        // create a new Client object if one doesn't exist for this id.
        if (!this.clients.has(id)) {
            const cli = new Client(id);
            this.clients.set(id, cli);
        }
        const cli = getClient(id);
        const { role, socket } = data;

        // add the socket to the object depending on the role passed in.
        if (role === 'extension') {
            cli.addExtSocket(socket);
        } else if (role === 'app') {
            cli.addLocalSocket(socket);
        }

    }

    /**
     * Removes a client from the Map by its ID.
     * @param {string} id - The unique client ID.
     * @throws {Error} If the client ID does not exist.
     */
    removeClient(id) {
        if (!this.clients.has(id)) {
            throw new Error(`Client ID "${id}" does not exist.`);
        }
        this.clients.delete(id);
    }

    /**
     * Gets a client's data by its ID.
     * @param {string} id - The unique client ID.
     * @returns {object|undefined} The client data or undefined if not found.
     */
    getClient(id) {
        return this.clients.get(id);
    }

    /**
     * Checks if a client exists by its ID.
     * @param {string} id - The unique client ID.
     * @returns {boolean} True if the client exists, false otherwise.
     */
    hasClient(id) {
        return this.clients.has(id);
    }
}

module.exports = ClientManager;