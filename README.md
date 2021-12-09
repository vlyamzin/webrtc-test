# Demo app for testing screensharing with a crop mechanism via WebRTC

The main idea of this app is to test how the cropped stream is shared from the host to the receiver by using Peer.js and Twilio Video JS SDK. 

The app has 4 main 'blocks'.

- Server - hosts static and writes Twilio Video JS SDK Logs into the `log.txt` file
- Host with custom screen cropper - index.html
- Peer.js Receiver - receiver.html
- Twilio Receiver - twilio_receiver.html

## Start application locally

Install dependencies
```
npm install
```

Run local Express server by command
``` 
npm start
```

Open host page from `http://localhost:8765`. Open receiver from `http://localhost:8765/receiver.html` OR `http://localhost:8765/twilio_receiver.html` (depends on the service that you want to use).

## Use Twilio Video JS SDK

Before testing, make sure that you have both (host and participant) tokens to join the [Twilio Room](https://www.twilio.com/docs/video/tutorials/understanding-video-rooms). More information about access tokens are here [Creating Access Tokens](https://www.twilio.com/docs/chat/create-tokens) or here [Generate an Access Token for Twilio Chat, Video, and Voice using Twilio Functions](https://www.twilio.com/blog/generate-access-token-twilio-chat-video-voice-using-twilio-functions).

Open Twilio Receiver page and paste a token into the input field. Press connect and wait until the room name appears.

Open Host page. Select `Use Twilio` checkbox and paste participant token and room name. After connecting successfully, proceed to the __Screenshare__ section of this readme.

## Use Peer.js

Open Receiver page and copy connection id. Go back to Host page, unselect `Use Twilio` checkbox, paste the id and wait for connection status.

## Screenshare

Click `Start sharing` button and choose what to share from the dialog. After selection, the grey canvas will be substituted by the stream of your screen. This stream will be sent to the Receiver. Click the `Start presentation` button. After that, the stream will start publishing to the Receiver.

### Update 1

Cropping is temporarily disabled. Stream is being published from the canvas as is.

### Update 2

Gather Twilio Video JS SDK Logs and encode a stream in a WebWorker before sending it to Twilio Video JS SDK

