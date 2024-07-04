let websocket;

class Socket extends WebSocket {
    listeners = {};

    retryConnection = true;

    constructor() {
        super(...arguments);
        
        this.onopen = () => console.log(`Connected to socket! :D`);

        this.onmessage = (msg) => {
            msg = JSON.parse(msg.data);
            if (this.listeners[msg.event]) this.listeners[msg.event](msg);
        };

        this.onclose = () => {
            if (!this.retryConnection) return console.log(`Socket disconnect - ignoring retry.`);

            console.log(`Socket disconnect - attempting re-open`);
            websocket = new Socket(this.url);
            websocket.listeners = this.listeners;
        };
    };

    on = (event, callback) => this.listeners[event] = callback;
    emit = (data) => this.send(JSON.stringify(data));
};

export default {
    open: () => websocket = new Socket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`),
    on: (...args) => websocket?.on(...args),
    emit: (...args) => websocket?.emit(...args),
    disableRetry: () => websocket.retryConnection = false
};