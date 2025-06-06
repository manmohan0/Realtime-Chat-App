"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = void 0;
class WebSocketClient {
    constructor() {
        const isProduction = process.env.MODE === 'production';
        const wsURL = isProduction ? process.env.VITE_WEBSOCKET_URL : `ws://${window.location.hostname}:8080`;
        if (!wsURL) {
            throw new Error('WebSocket URL is not defined');
        }
        this.socket = new WebSocket(wsURL);
    }
    static getClient() {
        if (!this.instance) {
            this.instance = new WebSocketClient();
        }
        return this.instance.socket;
    }
}
exports.WebSocketClient = WebSocketClient;
