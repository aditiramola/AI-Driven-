// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection events
socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from WebSocket server");
});

socket.on("connect_error", (error) => {
  console.error("💥 Connection error:", error.message);
});

export default socket;