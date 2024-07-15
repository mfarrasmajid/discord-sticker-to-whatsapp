# WHATSAPP API by SHADALKANE

This app is Javascript and Node based app using `@whiskeysockets/baileys` library, by using **Linked Device** function in WhatsApp to send messages from linked device to custom number.

All you need to do is:
1. Install dependencies
Use node install
```
node install
```
2.  Run node index.js
```
node index.js
```
3. If your node runs in localhost, then use postman to send POST request, on `http://localhost:3000/send/message` with this raw json payload:
```
{
  "message" : "<YOUR MESSAGE HERE>",
  "phone" : "62<YOUR NUMBER HERE STARTS WITH COUNTRY CODE>"
}
```
4. Enjoy the message with your Linked Device as sender
