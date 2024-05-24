import { reactive } from 'vue';

const state = reactive({
  socket: null as WebSocket | null,
  isConnected: false,
  messages: [] as any[],
});

export function connect(url: string) {
  state.socket = new WebSocket(url);

  state.socket.onopen = () => {
    state.isConnected = true;
    console.log('WebSocket connected');
  };

  state.socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    state.messages.push(message);
    console.log('Received:', message);
  };

  state.socket.onclose = () => {
    state.isConnected = false;
    console.log('WebSocket disconnected');
  };

  state.socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

export function disconnect() {
  if (state.socket) {
    state.socket.close();
  }
}

export function sendMessage(message: any) {
  if (state.isConnected && state.socket) {
    state.socket.send(JSON.stringify(message));
  }
}

export default {
  state,
  connect,
  disconnect,
  sendMessage,
};
