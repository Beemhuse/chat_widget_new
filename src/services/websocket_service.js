export class WebSocketService {
  constructor(url, session, guestId) {
    this.url = url;
    this.session = session;
    this.guestId = guestId;
    this.ws = null;
    this.connectionState = 'disconnected';
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.connectionTimeout = 10000; // 10 seconds
    this.pingInterval = 25000; // 25 seconds
    this.pingTimeout = 5000; // 5 seconds
    this.pingTimer = null;
    this.pongTimeoutTimer = null;
    this.eventListeners = {
      open: [],
      message: [],
      close: [],
      error: []
    };
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  connect() {
    if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
      console.warn('Already connecting or connected');
      return;
    }

    this.connectionState = 'connecting';
    this.connectionAttempts++;

    // Clean up any existing connection
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
    }

    // Create new connection with token in query params
    const fullUrl = `${this.url}?session_id=${encodeURIComponent(this.session)}&guest_id=${encodeURIComponent(this.guestId)}`;
    console.log(`Connecting to ${fullUrl}`);
    this.ws = new WebSocket(fullUrl);

    // Set timeout for connection
    const connectionTimer = setTimeout(() => {
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        console.error('Connection timeout');
        this.ws.close();
        this.handleConnectionFailure();
      }
    }, this.connectionTimeout);

    this.ws.onopen = (event) => {
      clearTimeout(connectionTimer);
      this.connectionState = 'connected';
      this.connectionAttempts = 0;
      console.log('WebSocket connected');
      this.setupHeartbeat();
      this.emit('open', event);
    };

    this.// In the onmessage handler of WebSocketService
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'error' || !hasMessageContent(data)) {
            console.warn('Received empty or error message:', data);
            return;
          }

          if (data.type === 'pong') {
            this.resetHeartbeat();
            return;
          }
          this.emit('message', data);
        } catch (error) {
          console.error('Message parsing error:', error);
        }
      };

    // Helper function to check for message content
    function hasMessageContent(data) {
      return (data.message && data.message.trim() !== '') ||
        (data.text && data.text.trim() !== '');
    }
    this.ws.onclose = (event) => {
      clearTimeout(connectionTimer);
      this.cleanupHeartbeat();
      this.connectionState = 'disconnected';
      console.log('WebSocket closed:', event.code, event.reason);
      this.emit('close', event);

      if (this.connectionAttempts < this.maxConnectionAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000);
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(() => this.connect(), delay);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
      this.handleConnectionFailure();
    };
  }

  handleConnectionFailure() {
    this.cleanupHeartbeat();
    this.connectionState = 'disconnected';
    if (this.ws) {
      this.ws.close();
    }
  }

  setupHeartbeat() {
    this.cleanupHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
        this.pongTimeoutTimer = setTimeout(() => {
          console.error('Pong timeout - reconnecting');
          this.ws.close();
        }, this.pingTimeout);
      }
    }, this.pingInterval);
  }

  resetHeartbeat() {
    if (this.pongTimeoutTimer) {
      clearTimeout(this.pongTimeoutTimer);
    }
  }

  cleanupHeartbeat() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer);
  }

  send(data) {
    if (this.isConnected()) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.ws.send(message);
        return true;
      } catch (error) {
        console.error('Send error:', error);
        return false;
      }
    }
    console.error('Cannot send - not connected');
    return false;
  }

  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
    return this;
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
    return this;
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    this.connectionState = 'disconnecting';
    this.cleanupHeartbeat();
    if (this.ws) {
      this.ws.close();
    }
  }
}