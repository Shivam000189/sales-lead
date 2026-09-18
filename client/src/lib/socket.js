import { io } from "socket.io-client";

const getSocketUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
  if (configured) {
    return configured.replace(/\/api$/, "");
  }
  if (typeof window !== "undefined" && window.location.port === "5173") {
    return "http://localhost:3000";
  }
  return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
};

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem("token");
    socketInstance = io(getSocketUrl(), {
      auth: { token },
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect_error", (err) => {
      // Graceful silent degradation as required by spec
      console.warn("WebSocket connection notice:", err.message);
    });
  }
  return socketInstance;
};

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const s = getSocket();
  s.auth = { token };
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
};
