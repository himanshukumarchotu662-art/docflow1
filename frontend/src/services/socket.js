import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token, userId, role, department) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket.emit('join', userId, role, department);
    });

    this.socket.on('document-updated', (data) => {
      toast.info(`Document ${data.action} by ${data.updatedBy || 'approver'}`);
    });

    this.socket.on('document-assigned', (data) => {
      toast.info(`Document assigned to ${data.assignedTo}`);
    });

    this.socket.on('new-document', (data) => {
      if (role === 'approver' && department === data.department) {
        toast.info(`New document received in ${department} department`);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();