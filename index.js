const {DisconnectReason, useMultiFileAuthState} = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const {
  Sticker,
  createSticker,
  StickerTypes,
} = require("wa-sticker-formatter");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

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
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});
const upload = multer({ storage: storage });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.listen(
    port, () => {
        console.log(`Service is running on port ${port}`);
    }
);

const sendMessage = async (req, res) => {
    try {
        const stickerFile = await fs.readFileSync(req.file.path);
        const stickerBuffer = Buffer.from(stickerFile);
        const sticker = new Sticker(stickerBuffer, {
          pack: "ShadAlkane", // The pack name
          author: "ShadAlkane", // The author name
          quality: 50, // The quality of the output file
          type: StickerTypes.CROPPED,
        });
        const stickerMedia = await sticker.toBuffer();
        options = {
          sticker: stickerMedia,
          fileName: req.file.originalname,
          isAnimated: true,
        };
        let send_message = await sock.sendMessage(
          req.body.phone + "@c.us",
          { ...options }
        );
        res.status(200).json({
            'status' : 'ok',
            'message_id' : send_message.key.id
        })
    } catch(err) {
        console.log(err);
        res.status(400).json({
            'status' : 'ERROR',
            'messages' : err.message
        })
    }
}

app.post('/send/message', upload.single('file'), sendMessage);
