import { screenSharingOn } from './cropper.js';

class Sender {
    peer;
    peerId;
    connection;
    connectionStatusLabel;
    twilioRoom;
    logger;
    useTwilio = false;
    useLogger = false;

    constructor(withLogs) {
        this.peer = new Peer();
        this.connectionStatusLabel = document.querySelector('#connection-status > span');
        this.useLogger = !!withLogs;
    }

    connect(id) {
        this.useTwilio = false;
        this.connection = this.peer.connect(id, { reliable: true });

        this.connection.on('open', () => {
            this.updateConnectionStatus(1);
            this.peerId = id;
        });

        // Firefox does not support this event yet
        this.connection.on('close', () => this.updateConnectionStatus(2));

        this.connection.on('error', () => this.updateConnectionStatus(3));
    }

    async twilioConnect(token, room) {
        this.useTwilio = true;

        if (this.useLogger) {
            this.initLogger();
        }

        try {
            this.twilioRoom = await Twilio.Video.connect(token, {
                name: room,
                automaticSubscription: true,
                tracks: [],
                video: { height: 720, frameRate: 24, width: 1280 },
                bandwidthProfile: {
                    video: {
                        mode: 'grid',
                        trackSwitchOffMode: 'detected',
                        maxSubscriptionBitrate: 0,
                        contentPreferencesMode: 'manual'
                    }
                },
                maxAudioBitrate: 16000,
                preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
                networkQuality: { local: 1, remote: 1 }
            });

            this.updateConnectionStatus(1);
            this.twilioRoom.on('participantConnected', (p) => console.log(`Connected: ${p}`));
            this.twilioRoom.once('disconnected', (p) => this.updateConnectionStatus(2));
        } catch (error) {
            this.updateConnectionStatus(3);
        }

    }

    startSharing(stream) {
        if (this.useTwilio) {
            const track = new Twilio.Video.LocalVideoTrack(stream.getTracks()[0], { name: 'Screensharing' });
            this.twilioRoom.localParticipant.publishTrack(track);
            return;
        }

        // get stream from Canvas here
        if (!this.peerId) {
            console.log('Peer id is absent');
            return;
        }

        this.peer.call(this.peerId, stream);
    }

    updateConnectionStatus(status) {
        switch (status) {
            case 1:
                this.connectionStatusLabel.innerHTML = 'Connected';
                break;
            case 2:
                this.connectionStatusLabel.innerHTML = 'Closed';
                break;
            case 3:
                this.connectionStatusLabel.innerHTML = 'Error';
                break;
            default:
                this.connectionStatusLabel.innerHTML = ''
        }
    }

    initLogger() {
        const logger = Twilio.Video.Logger.getLogger('twilio-video');
        const that = this;
        const originalFactory = logger.methodFactory;
        logger.methodFactory = function (methodName, logLevel, loggerName) {
            const method = originalFactory(methodName, logLevel, loggerName);
            return function (datetime, logLevel, component, message, data) {
                const prefix = '[IQVIA Canvas Screensharing app]';
                const msg = `${prefix} ${datetime}, ${logLevel}, ${component}, ${message}, ${JSON.stringify(data)}`
                that.postLog(msg);
                method(prefix, datetime, logLevel, component, message, data);
            };
        };
        logger.setLevel('debug');
    }

    postLog(message) {
        fetch(`${location.origin}/log`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'text/plain'
            },
            referrerPolicy: 'no-referrer',
            body: message // body data type must match "Content-Type" header
        });
    }
}




(function (Sender, screenSharingOn) {
    const connectionIdEl = document.getElementById('input-id');
    const twilioTokenEl = document.getElementById('twilio-token');
    const twilioRoomEl = document.getElementById('twilio-room');
    const twilioConnectBtn = document.getElementById('twilio-connect');
    const connectBtn = document.getElementById('start-connection');
    const shareBtn = document.getElementById('start-sharing');
    const useTwilio = document.getElementById('twilio');

    const gatherLogs = true;

    const sender = new Sender(gatherLogs);


    useTwilio.checked = true;
    toggleApproach(useTwilio.checked);

    connectBtn.addEventListener('click', () => {
        const id = connectionIdEl.value;

        if (!id) {
            alert('Connection id is empty');
            return;
        }

        sender.connect(id);
    });

    twilioConnectBtn.addEventListener('click', () => {
        const token = twilioTokenEl.value;
        const room = twilioRoomEl.value;

        if (!token) {
            alert('Token is empty');
            return;
        }

        if (!room) {
            alert('Room name is empty');
            return;
        }

        sender.twilioConnect(token, room);
    })

    useTwilio.addEventListener('change', (event) => {
        toggleApproach(event.target.checked);
    })

    shareBtn.addEventListener('click', () => {
        screenSharingOn((s) => onOutputStreamReceived(s));
    });

    function onOutputStreamReceived(stream) {
        sender.startSharing(stream);
    }

    function toggleApproach(useTwilio) {
        const peerJSControls = document.getElementById('peerjs-ctrls');
        const twilioControls = document.getElementById('twilio-ctrls');

        if (useTwilio) {
            peerJSControls.classList.add('hidden');
            twilioControls.classList.remove('hidden');
        } else {
            peerJSControls.classList.remove('hidden');
            twilioControls.classList.add('hidden');
        }
    }

})(Sender, screenSharingOn);
