import { createContext, useContext, useEffect, useState } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../lib/socket";

const SocketContext = createContext({
  socket: null,
  connected: false,
  toast: null,
  dismissToast: () => {},
});

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return Boolean(token && getSocket()?.connected);
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      disconnectSocket();
      return;
    }

    const s = connectSocket();
    if (!s) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onNotification = (data) => {
      setToast({
        id: Date.now(),
        title: data.title || "Notification",
        message: data.message || "New lead activity",
        leadId: data.leadId,
      });
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("notification:new", onNotification);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("notification:new", onNotification);
    };
  }, []);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const dismissToast = () => setToast(null);

  return (
    <SocketContext.Provider
      value={{
        socket: getSocket(),
        connected,
        toast,
        dismissToast,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);
