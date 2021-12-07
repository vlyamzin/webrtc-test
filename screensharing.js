// screensharing component goes here


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
        this.connectionStatusLabel = document.getElementById('status');
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
            // preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
            networkQuality: { local: 1, remote: 1 }
        });

        this.twilioRoom.on('participantConnected', (p) => console.log(`Connected: ${p}`));
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
        const chunks = [];
        const originalFactory = logger.methodFactory;
        logger.methodFactory = function (methodName, logLevel, loggerName) {
            const method = originalFactory(methodName, logLevel, loggerName);
            return function (datetime, logLevel, component, message, data) {
                const prefix = '[IQVIA Canvas Screensharing app]';
                method(prefix, datetime, logLevel, component, message, data);
            };
        };
        logger.setLevel('debug');
    }
}


let isTopBarClosed;
const screenSharingStateEnum = {
    0: 'OFF',
    1: 'INPROG',
    2: 'MANUALLY_PAUSED',
    3: 'TAB_IS_HIDDEN',
    'OFF': 0,
    'INPROG': 1,
    'MANUALLY_PAUSED': 2,
    'TAB_IS_HIDDEN': 3
}

class SharePresentationClass {
    // USE
    BACKDROP_COLOR = '#00000073';
    CROP_X = 0;             // x coordinate of crop canvas
    CROP_Y = 0;             // y coordinate of crop canvas
    CROP_W = 640;           // default width of sharing area
    CROP_H = 480;           // default height of sharing area
    START_X = 0;            // x coordinate of top-left corner of sharing area
    START_Y = 0;            // y coordinate of top-left corner of sharing area
    END_X = 0;              // x coordinate of bottom-right corner of sharing area
    END_Y = 0;              // y coordinate of bottom-right corner of sharing area

    drawing = false;        // area selection flag
    resizing = false;       // area resizing flag
    capturing = false;      // screen capturing flag
    stream;                 // MediaStream instance
    screenTrack;            // Twillio stream track instance
    audioTrack;             // Twillio audio stream track instance

    areaSelectionStart;     // event handler - checks area selection start
    areaSelectionEnd;       // event handler - checks area selection end
    areaSelectionMouseMove; // event handler - checks mouse move
    offset                  // CLM web-player offset from the top-left corner of the window
    offsetRequestResolver;  // handler to resolve the 'ClmContentOffset' message from CLM web-player
    dragMarkersContainer;   // DOM element, container for drag markers
    dragPoint;              // selected drag marker
    backdropCanvas;         // Canvas DOM element for area selection backdrop
    backdropCtx;            // Context of the Canvas DOM element
    userAgent;              // Browser user agent
    displaySurface;         // What to share
    mediaElement;           // Video element for sharing

    init({ currentRoom, screenSharingStopCallback }) {
        // request for web-player offset
        // playerInstance.send('getContentOffset', {}, {requestId: -1});
        // this.currentRoom = currentRoom;
        this.screenSharingStopCallback = screenSharingStopCallback;
        this.userAgent = this.getUserAgent();
        // new Promise((resolve) => {
        //     this.offsetRequestResolver = resolve;
        // }).then((offset) => {
        //     this.offset = offset;
        //     this.screenCropApproach();
        // })
        this.offset = {
            contentTop: 0,
            contentLeft: 0,
            contentWidth: 1024,
            contentHeight: 768
        }
        this.screenCropApproach();
    }

    stopCapturing() {
        this.capturing = false;
        screenSharingState.push(screenSharingStateEnum.OFF);
        if (this.stream) {
            this.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        if (this.screenTrack) {
            //   this.currentRoom.localParticipant.unpublishTrack(this.screenTrack);
            this.screenTrack.stop();
            this.screenTrack = null;
        }
        if (this.audioTrack) {
            //   this.currentRoom.localParticipant.unpublishTrack(this.audioTrack);
            this.audioTrack.stop();
            this.audioTrack = null;
        }
    }

    isCapturing() {
        return this.capturing;
    }

    // returns the distance between the browser top-left corner and the top-left corner of the main monitor
    getScreenOffset() {
        return {
            // includes the browser's tab bar
            top: window.screenY + (window.outerHeight - window.innerHeight),
            left: window.screenX < 0 ? 0 : window.screenX
        }
    }

    setDefaultAreaSize() {
        const { top: contentTop, left: contentLeft, width: contentWidth, height: contentHeight } = this.offset;
        const { top: screenOffsetTop, left: screenOffsetLeft } = this.getScreenOffset();
        const fromTop = screenOffsetTop + contentTop;
        const fromLeft = screenOffsetLeft + contentLeft;
        const realStreamHeight = this.stream ? this.stream.getVideoTracks()[0].getSettings().height : contentHeight;
        this.START_X = contentLeft;
        this.START_Y = contentTop;
        this.CROP_Y = (!this.displaySurface || this.displaySurface === 'monitor') ? fromTop : this.displaySurface === 'browser' ? 0 : contentTop + (window.outerHeight - window.innerHeight);
        this.CROP_X = (!this.displaySurface || this.displaySurface === 'monitor') ? fromLeft : contentLeft;
        this.CROP_W = contentWidth;
        this.CROP_H = this.displaySurface === 'browser' ? realStreamHeight : contentHeight;
        this.END_X = this.CROP_W + this.START_X;
        this.END_Y = this.CROP_H + this.START_Y;
        if (this.userAgent === 'Firefox') {
            this.CROP_Y = this.CROP_Y - 7
        }
        console.log(this)
    }

    correctionDPI(number) {
        if (this.userAgent === 'Firefox' || this.userAgent === 'Safari') {
            return Math.round(number * window.devicePixelRatio)
        }
        return number
    }

    drawBackDrop(status) {
        if (!status) {
            const backdrop = document.getElementById('backdrop-wrapper');
            backdrop && document.body.removeChild(backdrop);
            this.backdropCtx = null;
            return
        }
        const backdropWrapper = document.createElement('div');
        backdropWrapper.setAttribute('id', 'backdrop-wrapper');
        document.body.appendChild(backdropWrapper);

        this.backdropCanvas = document.createElement('canvas');
        this.backdropCanvas.width = backdropWrapper.clientWidth;
        this.backdropCanvas.height = backdropWrapper.clientHeight;

        this.dragMarkersContainer = document.createElement('div');
        this.dragMarkersContainer.setAttribute('id', 'drag-markers-container');

        backdropWrapper.appendChild(this.backdropCanvas);
        backdropWrapper.appendChild(this.dragMarkersContainer);
        this.backdropCtx = this.backdropCanvas.getContext('2d');
        this.backdropCtx.fillStyle = this.BACKDROP_COLOR;
        this.backdropCtx.fillRect(0, 0, this.backdropCanvas.width, this.backdropCanvas.height);
        this.drawArea();
        this.drawResizeMarkers(this.backdropCtx);
    }

    initScreenShareEvent() {
        // RemotePlatformHelper.hideElementById('btnGetShareArea');
        // RemotePlatformHelper.showElementById('btnCancelShareArea');
        // document.querySelector('.navigation').style.display = "none";
        const { top: screenOffsetTop, left: screenOffsetLeft } = this.getScreenOffset();
        const displaySurface = this.stream && this.stream.getVideoTracks()[0].getSettings().displaySurface;

        this.drawBackDrop(true);

        // screen-sharing area selection start
        this.areaSelectionStart = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // prevent area selection if a user initiated area resizing or clicks on buttons in the previewer
            if (e.target.classList.contains('screenshare-control') || this.resizing) {
                return;
            }

            // RemotePlatformHelper.hideElementById('sharingScreen');
            document.querySelectorAll('.draggable').forEach(el => el.remove());
            this.drawing = true;
            this.START_X = e.clientX;
            this.START_Y = e.clientY;
        }

        // screen-sharing area selection end
        this.areaSelectionEnd = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // prevent area selection if a user clicks on buttons in the previewer
            if (e.target.classList.contains('screenshare-control')) {
                return;
            }

            if (this.resizing) {
                this.resizing = false;

                this.swapCoordinates();
                this.drawResizeMarkers(this.backdropCtx);
            }

            if (this.drawing) {
                this.drawing = false;

                // if user did not move the mouse
                if (e.clientX === this.START_X && e.clientY === this.START_Y) {
                    return;
                }

                this.swapCoordinates()
                this.drawResizeMarkers(this.backdropCtx);
            }

            // correct coordinates based on screen-sharing type (the whole screen of browser/tab only)
            // 'monitor' is the whole screen
            // it might be a chance when displaySurface prop is not defined. It happens only in Firefox (version < 93)
            // as it does not support MediaTrackSettings.displaySurface
            if (!displaySurface || displaySurface === 'monitor' || displaySurface === 'window') {
                this.CROP_X = this.START_X + screenOffsetLeft;
                this.CROP_Y = this.START_Y + screenOffsetTop;
            } else {
                this.CROP_X = this.START_X;
                this.CROP_Y = this.START_Y;
            }
            if (this.userAgent === 'Chrome') {
                this.CROP_Y = this.CROP_Y + 7 // magic manipulation
            }
            this.CROP_Y = this.CROP_Y - 7 // magic manipulation
            // RemotePlatformHelper.showElementById('sharingScreen');
        }

        // screen-sharing area selection
        this.areaSelectionMouseMove = e => {
            e.preventDefault();
            e.stopPropagation();

            if (this.resizing) {
                this.areaResize(e);
                this.drawArea();
                return;
            }

            if (!this.drawing) { return; }

            // calculate the rectangle width/height based
            // on starting vs current mouse position
            this.CROP_W = e.clientX - this.START_X;
            this.CROP_H = e.clientY - this.START_Y;
            this.END_X = e.clientX;
            this.END_Y = e.clientY;

            this.drawArea();
        };

        this.areaSelectionStart = this.areaSelectionStart.bind(this);
        this.areaSelectionEnd = this.areaSelectionEnd.bind(this);
        this.areaSelectionMouseMove = this.areaSelectionMouseMove.bind(this);

        document.addEventListener('mousedown', this.areaSelectionStart);
        document.addEventListener('mouseup', this.areaSelectionEnd);
        document.addEventListener("mousemove", this.areaSelectionMouseMove);
    }

    drawArea() {
        this.backdropCtx.clearRect(0, 0, this.backdropCanvas.width, this.backdropCanvas.height);
        this.backdropCtx.fillStyle = this.BACKDROP_COLOR;
        this.backdropCtx.fillRect(0, 0, this.backdropCanvas.width, this.backdropCanvas.height);

        this.backdropCtx.globalCompositeOperation = 'destination-out';

        // cut area from backdrop
        this.backdropCtx.fillStyle = 'red';
        this.backdropCtx.fillRect(this.START_X, this.START_Y, this.CROP_W, this.CROP_H);

        this.backdropCtx.globalCompositeOperation = 'source-over';

        // draw selected area border
        this.backdropCtx.strokeStyle = 'rgb(163, 9, 9)';
        this.backdropCtx.setLineDash([6]);
        this.backdropCtx.lineWidth = '3';
        this.backdropCtx.strokeRect(this.START_X, this.START_Y, this.CROP_W, this.CROP_H);
    }

    // swap coordinates in case drawing/resizing moved in opposite direction
    swapCoordinates() {
        if (this.END_X < this.START_X) {
            const c = this.START_X;
            this.START_X = this.END_X;
            this.END_X = c;
            this.CROP_W = this.END_X - this.START_X;
        }
        if (this.END_Y < this.START_Y) {
            const c = this.START_Y;
            this.START_Y = this.END_Y;
            this.END_Y = c;
            this.CROP_H = this.END_Y - this.START_Y;
        }
    }

    drawResizeMarkers(ctx) {
        const size = 8;
        const offset = size / 2;
        ctx.fillStyle = 'rgb(180, 9, 9)';

        const points = {
            topLeft: {
                type: 0,
                values: [this.START_X - offset, this.START_Y - offset]
            },
            topCenter: {
                type: 1,
                values: [this.START_X + ((this.CROP_W / 2) - offset), this.START_Y - offset]
            },
            topRight: {
                type: 0,
                values: [this.END_X - offset, this.START_Y - offset]
            },
            rightCenter: {
                type: 1,
                values: [this.END_X - offset, this.START_Y + ((this.CROP_H / 2) - offset)]
            },
            bottomRight: {
                type: 0,
                values: [this.END_X - offset, this.END_Y - offset]
            },
            bottomCenter: {
                type: 1,
                values: [this.START_X + ((this.CROP_W / 2) - offset), this.END_Y - offset]
            },
            bottomLeft: {
                type: 0,
                values: [this.START_X - offset, this.END_Y - offset]
            },
            leftCenter: {
                type: 1,
                values: [this.START_X - offset, this.START_Y + ((this.CROP_H / 2) - offset)]
            }
        }

        for (let [key, point] of Object.entries(points)) {
            ctx.fillRect(point.values[0], point.values[1], size, size);

            const el = document.createElement('div');
            el.classList.add('draggable');
            el.setAttribute('side', key);
            point.type > 0 ? el.classList.add('side') : el.classList.add('corner');
            el.style.top = point.values[1] - offset + 'px';
            el.style.left = point.values[0] - offset + 'px';
            this.dragMarkersContainer.appendChild(el);
        }
        document.querySelectorAll('.draggable').forEach(el => {
            el.addEventListener('mousedown', this.areaResizeStart.bind(this));
        });
    }

    // screen-sharing area resize start
    areaResizeStart(e) {
        e.preventDefault();
        e.stopPropagation();

        // RemotePlatformHelper.hideElementById('sharingScreen');
        this.resizing = true;
        this.dragPoint = e.target;
        document.querySelectorAll('.draggable').forEach(el => {
            el.removeEventListener('mousedown', this.areaResizeStart);
            el.remove();
        });
    }

    // screen-sharing area resize
    areaResize(e) {
        const pointSide = this.dragPoint.getAttribute('side');

        switch (pointSide) {
            case 'topLeft': {
                const deltaX = e.clientX - this.START_X;
                const deltaY = e.clientY - this.START_Y;
                this.CROP_W = this.CROP_W - deltaX;
                this.CROP_H = this.CROP_H - deltaY;
                this.START_X = e.clientX;
                this.START_Y = e.clientY;
                break;
            }
            case 'topCenter': {
                const deltaY = e.clientY - this.START_Y;
                this.CROP_H = this.CROP_H - deltaY;
                this.START_Y = e.clientY;
                break;
            }
            case 'topRight': {
                const deltaX = e.clientX - this.END_X;
                const deltaY = e.clientY - this.START_Y;
                this.CROP_W = this.CROP_W + deltaX;
                this.CROP_H = this.CROP_H - deltaY;
                this.END_X = e.clientX;
                this.START_Y = e.clientY;
                break;
            }
            case 'rightCenter': {
                const deltaX = e.clientX - this.END_X;
                this.CROP_W = this.CROP_W + deltaX;
                this.END_X = e.clientX;
                break;
            }
            case 'bottomRight': {
                const deltaX = e.clientX - this.END_X;
                const deltaY = e.clientY - this.END_Y;
                this.CROP_W = this.CROP_W + deltaX;
                this.CROP_H = this.CROP_H + deltaY;
                this.END_X = e.clientX;
                this.END_Y = e.clientY;
                break;
            }
            case 'bottomCenter': {
                const deltaY = e.clientY - this.END_Y;
                this.CROP_H = this.CROP_H + deltaY;
                this.END_Y = e.clientY;
                break;
            }
            case 'bottomLeft': {
                const deltaX = e.clientX - this.START_X;
                const deltaY = e.clientY - this.END_Y;
                this.CROP_W = this.CROP_W - deltaX;
                this.CROP_H = this.CROP_H + deltaY;
                this.START_X = e.clientX;
                this.END_Y = e.clientY;
                break;
            }
            case 'leftCenter': {
                const deltaX = e.clientX - this.START_X;
                this.CROP_W = this.CROP_W - deltaX;
                this.START_X = e.clientX;
                break;
            }
        }
    }

    // screen-sharing area resize end
    areaResizeEnd() {
        this.resizing = false;
        this.dragPoint = null
        this.drawArea();
        this.drawResizeMarkers(this.backdropCtx);
        // RemotePlatformHelper.showElementById('sharingScreen');
    }

    removeScreenShareEvent() {
        if (this.areaSelectionStart) {
            document.removeEventListener('mousedown', this.areaSelectionStart, false);
            this.areaSelectionStart = null;
        }

        if (this.areaSelectionEnd) {
            document.removeEventListener('mouseup', this.areaSelectionEnd, false);
            this.areaSelectionEnd = null;
        }

        if (this.areaSelectionMouseMove) {
            document.removeEventListener('mousemove', this.areaSelectionMouseMove, false);
            this.areaSelectionMouseMove = null;
        }
    }

    addElementsForSharing() {
        if (document.getElementById('sharingContainer')) return;

        const sharingContainer = document.createElement('div');
        sharingContainer.setAttribute('id', 'sharingContainer');
        sharingContainer.style.display = 'none';
        setTimeout(() => {
            sharingContainer.style.display = null;
        }, 500)
        // const sharingScreen = document.createElement('canvas');
        // sharingScreen.setAttribute('id', 'sharingScreen');
        const sharingStream = document.createElement('video');
        sharingStream.setAttribute('id', 'sharingStream');
        sharingStream.muted = true;
        const btnContainer = document.createElement('div');
        btnContainer.setAttribute('id', 'btnContainer');

        const shareArea = {
            id: 'btnGetShareArea',
            text: 'Select Area',
            primary: false,
            callback: this.initScreenShareEvent.bind(this)
        };
        const cancelArea = {
            id: 'btnCancelShareArea',
            text: 'Cancel',
            primary: false,
            callback: this.cancelAreaSelection.bind(this),
            visible: false
        }
        const shareStart = {
            id: 'btnStartSharing',
            text: 'Start presentation',
            primary: true,
            callback: this.startSharing.bind(this)
        };

        // sharingContainer.appendChild(sharingScreen);
        sharingContainer.appendChild(sharingStream);
        sharingContainer.appendChild(btnContainer);

        [cancelArea, shareArea, shareStart].forEach(btnSettings => {
            let btn = createButton(btnSettings);
            btnContainer.appendChild(btn);
        });
        document.body.appendChild(sharingContainer);

        function createButton({ id, text, primary, visible, callback }) {
            const btn = document.createElement('button');
            btn.setAttribute('id', id);
            btn.classList.add('slds-button', 'slds-button--neutral', 'uiButton', 'screenshare-control');
            primary && btn.classList.add('uiButton--brand');
            btn.innerText = text;
            btn.onclick = () => {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }

            if (visible === false) {
                btn.classList.add('display-none');
            }

            return btn;
        }
    }

    removeElementsForSharing() {
        const sharingContainer = document.getElementById('sharingContainer');
        sharingContainer && document.body.removeChild(sharingContainer);
    }

    hideElementsForSharing() {
        const sharingContainer = document.getElementById('sharingContainer');
        if (sharingContainer) {
            sharingContainer.style.display = 'none'
        }
    }

    toggleSharingButton(status) {
        if (status) {
            // RemotePlatformHelper.hideElementById("noscreenShareBtn");
            // RemotePlatformHelper.showElementById("screenShareBtn");
        } else {
            // RemotePlatformHelper.hideElementById("screenShareBtn");
            // RemotePlatformHelper.showElementById("noscreenShareBtn");
        }
    }

    cancelAreaSelection() {
        // RemotePlatformHelper.hideElementById('btnCancelShareArea');
        // RemotePlatformHelper.showElementById('btnGetShareArea');
        // document.querySelector('.navigation').style.display = "block";
        this.drawBackDrop(false);
        this.setDefaultAreaSize();
        this.removeScreenShareEvent();
    }

    startSharing() {
        screenSharingPause(false, true);
        // document.querySelector('.navigation').style.display = "block";
        this.toggleSharingButton(true);
        this.hideElementsForSharing();
        this.removeScreenShareEvent();
        this.drawBackDrop(false);
        this.shareCroppedStream();
        if (!isTopBarClosed || elementsOnPage.has('PresentationPanelIsOn')) {
            screenSharingPause(true);
        }


    }

    getScreenStream() {
        return navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });
    }

    screenCropApproach() {
        this.getScreenStream().then(stream => {
            console.log('stream', stream)
            let inited = false;
            this.capturing = true;
            this.stream = stream;
            this.displaySurface = this.stream && this.stream.getVideoTracks()[0].getSettings().displaySurface;
            const delay = this.displaySurface === 'browser' ? 500 : 0; // need to init tab sharing for Chrome
            setTimeout(() => {
                this.addElementsForSharing();
                this.setDefaultAreaSize();
                this.mediaElement = document.getElementById('sharingStream');
                const _canvas = document.getElementById('sharingScreen');
                const _context = _canvas.getContext('2d');
                this.mediaElement.ontimeupdate = (ev) => {
                    if (!inited) {
                        this.mediaElement.style.display = 'none';
                        inited = true;
                    }
                    this.cropFrame(_canvas, _context, this.mediaElement);
                };
                this.mediaElement.srcObject = stream;
                this.mediaElement.play();
                stream.getVideoTracks()[0].onmute = () => {
                    this.screenSharingStopCallback && this.screenSharingStopCallback(true);
                };
                stream.getVideoTracks()[0].onended = () => {
                    this.screenSharingStopCallback && this.screenSharingStopCallback(true);
                };

                if (stream.getAudioTracks().length !== 0) {
                    // this.audioTrack = new Twilio.Video.LocalAudioTrack(stream.getAudioTracks()[0], { name: 'TWILIO_TRACK_TYPE_AUDIO_SHARING' });
                }
            }, delay);
        }).catch(() => {
            this.capturing = false;
            showToast(TOAST_WARNING_VARIANT, TOAST_WARNING_TITLE, "{!$Label.ScreenSharingPermissionDenied}");
        })
    }

    cropFrame(canvas, context, video) {
        // const _canvas = document.getElementById('sharingScreen');
        if (!canvas) return;
        // const _context = _canvas.getContext('2d');

        const settings = this.stream.getVideoTracks()[0].getSettings();

        if (settings) {
            const w = settings.width;
            const h = settings.height;
            canvas.width = w;
            canvas.height = h;

        }


        context.drawImage(video, 0, 0);


        // canvas.width = this.correctionDPI(this.CROP_W);
        // canvas.height = this.correctionDPI(this.CROP_H);
        // context.drawImage(
        //     video,
        //     this.correctionDPI(this.CROP_X),
        //     this.correctionDPI(this.CROP_Y),
        //     this.correctionDPI(this.CROP_W),
        //     this.correctionDPI(this.CROP_H), 0, 0,
        //     this.correctionDPI(this.CROP_W),
        //     this.correctionDPI(this.CROP_H)
        // );
    }

    shareCroppedStream() {
        const _canvas = document.getElementById('sharingScreen');
        if (!_canvas) return;
        const MediaStream = _canvas.captureStream();
        // console.log(MediaStream.getVideoTracks()[0].getSettings());
        // this.recordStreamLocally(MediaStream);


        // Whole screen. NO CANVAS
        // sender.startSharing(this.stream);
        // Cropped screen. Canvas
        sender.startSharing(MediaStream);
        // this.screenTrack = new Twilio.Video.LocalVideoTrack(MediaStream.getTracks()[0], { name: TWILIO_TRACK_TYPE_SHARING });
        // this.currentRoom.localParticipant.publishTrack(this.screenTrack);
        if (this.audioTrack) {
            //   this.currentRoom.localParticipant.publishTrack(this.audioTrack);
        }
    }

    recordStreamLocally(stream) {
        const chunks = [];
        this.recorder = new MediaRecorder(stream);
        this.recorder.start();

        this.recorder.addEventListener('dataavailable', (event) => {
            chunks.push(event.data);
        });

        this.recorder.addEventListener('stop', (value) => {
            const link = document.createElement('a');
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = window.URL.createObjectURL(blob);

            link.setAttribute('style', 'display:none');
            document.body.appendChild(link);
            link.href = url;
            link.download = 'file.webm';
            link.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        })
    }

    setSharingPause(isPause) {
        if (!this.mediaElement) return;

        if (isPause) {
            this.mediaElement.pause();
            this.audioTrack && this.audioTrack.enable(false);
            return;
        }
        if (screenSharingState.state !== screenSharingStateEnum.MANUALLY_PAUSED
            && screenSharingState.state !== screenSharingStateEnum.TAB_IS_HIDDEN) {
            // ^^^ prevent sharing in case a presenter stopped the stream manually
            this.mediaElement.play();
            this.audioTrack && this.audioTrack.enable(true);
        }
    }

    getUserAgent() {
        let sBrowser, sUsrAg = navigator.userAgent;
        if (sUsrAg.indexOf("Firefox") > -1) {
            sBrowser = "Firefox";
        } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
            sBrowser = "Samsung Internet";
        } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
            sBrowser = "Opera";
        } else if (sUsrAg.indexOf("Trident") > -1) {
            sBrowser = "IE";
        } else if (sUsrAg.indexOf("Edge") > -1) {
            sBrowser = "EdgeLegacy)";
        } else if (sUsrAg.indexOf("Edg") > -1) {
            sBrowser = "Edge";
        } else if (sUsrAg.indexOf("Chrome") > -1) {
            sBrowser = "Chrome";
        } else if (sUsrAg.indexOf("Safari") > -1) {
            sBrowser = "Safari";
        } else {
            sBrowser = "unknown";
        }
        return sBrowser;
    }

    destroy() {
        this.stopCapturing();
        this.drawBackDrop(false);
        this.removeElementsForSharing();
    }
}

/*
* Keeps the state of the screen-sharing action
* Provides the ability to pop back to the previously set state
* */
class ScreenSharingState {
    state;
    prevState;

    constructor() {
        this.state = screenSharingStateEnum.OFF;
    }

    push(newState) {
        this.prevState = this.state;
        this.state = newState;
    }

    pop() {
        this.state = this.prevState;
        this.prevState = screenSharingStateEnum.OFF;
    }
}

const SharePresentation = new SharePresentationClass();
const screenSharingState = new ScreenSharingState();

function screenSharingOn() {

    // if (document.getElementById('remote-screen-media').childElementCount !== 0) {
    //     const elementToRemove = document.getElementById('sharing-video');
    //     elementToRemove.remove();

    //     document.getElementById('remote-screen-media').classList.add('display-none');
    //     document.querySelector('iframe').style.display = 'block';
    // }

    if (SharePresentation.screenTrack) {
        screenSharingState.push(screenSharingStateEnum.INPROG);
        // hideNavigationMenu(0);
        SharePresentation.toggleSharingButton(true);
        return;
    }
    SharePresentation.init({
        currentRoom: null,
        screenSharingStopCallback: screenSharingOff
    });
}

function screenSharingOff(force) {
    if (!SharePresentation) return;

    SharePresentation.toggleSharingButton(false);

    if (SharePresentation.hasOwnProperty('recorder')) {
        SharePresentation.recorder.stop();
    }

    // by requirements the user action  should not remove the stream, but pause it
    screenSharingState.push(screenSharingStateEnum.MANUALLY_PAUSED);
    screenSharingPause(true);

    if (force) {
        SharePresentation.destroy();
    }
}

function screenSharingPause(isPause, force) {
    // SharePresentation && SharePresentation.setSharingPause(isPause);
    // if (isPause) {
    //     RemotePlatformHelper.showElementById('no-screen-share-msg');
    //     playerInstance && playerInstance.send('screenSharingState', { isPaused: true }, {});
    // } else if(force || (SharePresentation.screenTrack && screenSharingState.state !== screenSharingStateEnum.MANUALLY_PAUSED)) {
    //     // RemotePlatformHelper.hideElementById('no-screen-share-msg');
    //     playerInstance && playerInstance.send('screenSharingState', { isPaused: false }, {});
    // }
}

(function () {
    const connectionIdEl = document.getElementById('input-id');
    const twilioTokenEl = document.getElementById('twilio-token');
    const twilioRoomEl = document.getElementById('twilio-room');
    const twilioConnectBtn = document.getElementById('twilio-connect');
    const connectBtn = document.getElementById('start-connection');
    const shareBtn = document.getElementById('start-sharing');
    const useTwilio = document.getElementById('twilio');

    const gatherLogs = true;


    sender = new Sender(gatherLogs);

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
        screenSharingOn();
    });

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

})()
