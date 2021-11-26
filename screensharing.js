// screensharing component goes here


class Sender {
    peer;
    connection;
    connectionStatusLabel;

    constructor() {
        this.peer = new Peer();
        this.connectionStatusLabel = document.getElementById('status');
    }

    connect(id) {
        this.connection = this.peer.connect(id, { reliable: true });

        this.connection.on('open', () => {
            this.updateConnectionStatus(1);
            this.startSharing(id);
        });

        // Firefox does not support this event yet
        this.connection.on('close', () => this.updateConnectionStatus(2));

        this.connection.on('error', () => this.updateConnectionStatus(3));
    }

    startSharing(id) {
        // get stream from Canvas here


        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                var call = this.peer.call(id, stream);
            })
            .catch(() => {
                console.log('Failed to get local stream', err);
            });
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
}

(function () {
    const connectionIdEl = document.getElementById('input-id');
    const connectBtn = document.getElementById('start-connection');
    const sender = new Sender();

    connectBtn.addEventListener('click', () => {
        const id = connectionIdEl.value;

        if (!id) {
            alert('Connection id is empty');
            return;
        }

        sender.connect(id);
    })

})()