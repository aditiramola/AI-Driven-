// src/socket.js
import { io } from "socket.io-client";

// WebSocket connection configuration
const SOCKET_URL = "http://localhost:5000";

// Create socket instance
export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection event handlers for debugging
socket.on("connect", () => {
  console.log(` WebSocket connected: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
  console.log(` WebSocket disconnected: ${reason}`);
});

socket.on("connect_error", (error) => {
  console.error(" WebSocket connection error:", error.message);
});

// Custom function to emit events
export const emitEvent = (eventName, data) => {
  return new Promise((resolve, reject) => {
    socket.emit(eventName, data, (response) => {
      if (response && response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

// Custom function to subscribe to events
export const subscribeToEvent = (eventName, callback) => {
  socket.on(eventName, callback);
  return () => socket.off(eventName, callback);
};

export default socket;