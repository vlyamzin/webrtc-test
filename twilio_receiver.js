class TWLReceiver {
    player;
    connectBtn;
    room;
    roomNameEl;
    localTracks;


    constructor() {
        this.player = document.getElementById('received-content');
        this.roomNameEl = document.getElementById('room-name');
    }

    async connect(token) {
        this.room = await Twilio.Video.connect(token, {
            tracks: []
        });

        this.roomNameEl.innerText = `Room name: ${this.room.name}`;

        this.room.on('participantConnected', (p) => console.log(`Connected: ${p}`));
        this.room.on('participantDisconnected', (p) => console.log(`Disconnected: ${p}`));


        this.room.on('trackSubscribed', track => {
            if (track && track.name === 'Screensharing') {
                const video = track.attach();
                video.id = 'received-content';
                document.body.appendChild(video);
            }
        });

        this.room.once('disconnected', (room, error) => { console.log(error); });
    }
}

(function () {
    const receiver = new TWLReceiver();
    const btn = document.getElementById('connect');

    btn.addEventListener('click', () => {
        const tokenEl = document.getElementById('input-id');

        if (tokenEl && tokenEl.value) {
            receiver.connect(tokenEl.value);
        }
    })
})()