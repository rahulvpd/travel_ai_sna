const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class WebSocketService {
  constructor() {
    this.visitorWs = null;
    this.chatWs = null;
    this.visitorCallbacks = [];
    this.chatCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connectVisitors(onMessage, onError) {
    const wsUrl = API_BASE.replace('http', 'ws') + '/ws/visitors';
    try {
      this.visitorWs = new WebSocket(wsUrl);

      this.visitorWs.onopen = () => {
        console.log('Visitor WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.visitorWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
          this.visitorCallbacks.forEach(cb => cb(data));
        } catch (e) {
          console.error('Failed to parse visitor data:', e);
        }
      };

      this.visitorWs.onerror = (error) => {
        console.error('Visitor WebSocket error:', error);
        if (onError) onError(error);
      };

      this.visitorWs.onclose = () => {
        console.log('Visitor WebSocket disconnected');
        this.handleReconnect(onMessage, onError);
      };
    } catch (error) {
      console.error('Failed to connect to visitor WebSocket:', error);
    }
  }

  handleReconnect(onMessage, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => {
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
        this.connectVisitors(onMessage, onError);
      }, delay);
    }
  }

  disconnectVisitors() {
    if (this.visitorWs) {
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.visitorWs.close();
      this.visitorWs = null;
    }
  }

  onVisitorUpdate(callback) {
    this.visitorCallbacks.push(callback);
    return () => {
      this.visitorCallbacks = this.visitorCallbacks.filter(cb => cb !== callback);
    };
  }

  sendChatMessage(topic, onResponse) {
    if (this.chatWs && this.chatWs.readyState === WebSocket.OPEN) {
      this.chatWs.send(JSON.stringify({ type: 'chat', topic }));
    } else {
      const wsUrl = API_BASE.replace('http', 'ws') + '/ws/chat';
      try {
        this.chatWs = new WebSocket(wsUrl);

        this.chatWs.onopen = () => {
          this.chatWs.send(JSON.stringify({ type: 'chat', topic }));
        };

        this.chatWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onResponse) onResponse(data);
            this.chatCallbacks.forEach(cb => cb(data));
          } catch (e) {
            console.error('Failed to parse chat response:', e);
          }
        };

        this.chatWs.onerror = (error) => {
          console.error('Chat WebSocket error:', error);
        };

        this.chatWs.onclose = () => {
          console.log('Chat WebSocket closed');
        };
      } catch (error) {
        console.error('Failed to send chat message:', error);
      }
    }
  }

  onChatResponse(callback) {
    this.chatCallbacks.push(callback);
    return () => {
      this.chatCallbacks = this.chatCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    this.disconnectVisitors();
    if (this.chatWs) {
      this.chatWs.close();
      this.chatWs = null;
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;