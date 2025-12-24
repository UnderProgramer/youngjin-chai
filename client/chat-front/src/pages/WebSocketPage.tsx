import { useEffect, useRef, useState } from "react";
import { createSocket } from "../utils/socket";
import { Socket } from "socket.io-client";
import { refresh } from "../utils/api";

export const WebSocketPage = () => {
  const [messages, setMessages] = useState<socketType[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      const token = await refresh()
      console.log(token)
      if (!token) return;

      const socket = createSocket(token);
      socketRef.current = socket;

      socket.on("initServer", (msg) => {
        console.log(msg);
      });

      socket.on("message", (data) => {
        setMessages((prev) => [...prev, data]);
      });

      socket.on("SocketErr", (err) => {
        alert(err.message);
        socket.disconnect();
      });
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socketRef.current?.emit("message", input);
    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Global Chat</h2>

      <div style={{ border: "1px solid #ccc", height: 300, overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
