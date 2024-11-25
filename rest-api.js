const express = require('express');
const app = express();
const PORT = 3000;

let clientManager = null;
let server;

// Middleware to parse JSON bodies
app.use(express.json());

// Default handler for undefined routes
app.use((req, res) => {
    res.status(404).send('Route not found');
});


// POST command: Trigger a button
app.post('/trigger', async (req, res) => {
    const { broadcaster, button_id } = req.body; // Extract data from request body
    if (!broadcaster || !button_id) {
        return res.status(400).send('broadcaster and button id are required.');
    }
    // check for broadcaster id on wss map.

    res.status(201).json({ message: 'Ok.' });
});

// POST command: Update user settings
app.post('/extTrigger', (req, res) => {
    const { broadcaster, trigger_name } = req.body;

    if (!clientManager.hasClient(broadcaster)) {
        return res.status(401).send(`broadcaster with id ${id} has not connected.`);
    }


    // Simulate updating user settings
    res.json({ message: `Settings for user ID ${userId} updated`, settings });
});

function startServer(port = PORT) {
    return new Promise((resolve, reject) => {
        if (!emitter) {
            reject('Emitter has not been initialized.');
        }
        server = app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
            resolve(); // Resolve the promise when the server starts
        });
        server.on('error', reject); // Reject if an error occurs
    });
}


function stopServer() {
    return new Promise((resolve, reject) => {
        if (server) {
            server.close((err) => {
                if (err) {
                    console.error('Error stopping server:', err);
                    reject(err);
                } else {
                    console.log('Server has been stopped');
                    resolve(); // Resolve the promise when the server stops
                }
            });
        } else {
            console.log('No server is currently running');
            resolve(); // Resolve immediately if no server instance exists
        }
    });
}

function setClientManagerREST(newClientManager) {
    clientManager = newClientManager;
}

module.exports = {
    startServer,
    stopServer,
    setClientManagerREST,
}