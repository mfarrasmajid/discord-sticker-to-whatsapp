const {DisconnectReason, useMultiFileAuthState} = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");

var sock;

async function connectionLogic(){
    const {state, saveCreds} = await useMultiFileAuthState("auth_info_baileys");
    sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr} = update || {};

        if (qr){
            console.log(qr);
        }

        if (connection === "close"){
            const shouldReconnect = 
                lastDisconnect?.error?.output?.statusCode !== 
            DisconnectReason.loggedOut;

            if (shouldReconnect) {
                connectionLogic();
            }
        }
    })

    sock.ev.on("creds.update", saveCreds);
}

connectionLogic();


const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.listen(
    port, () => {
        console.log(`Service is running on port ${port}`);
    }
);

const sendMessage = async (req, res) => {
    try {
        let send_message = await sock.sendMessage(req.body.phone + '@c.us', {
            text: req.body.message
        })
        res.status(200).json({
            'status' : 'ok',
            'message_id' : send_message.key.id
        })
    } catch(err) {
        res.status(400).json({
            'status' : 'ERROR',
            'messages' : err.message
        })
    }
}

app.post('/send/message', sendMessage);
