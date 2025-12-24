import { io, Socket } from "socket.io-client";

export interface ServerToClientEvents {
  message: (data: string) => void;
  initServer: (msg: string) => void;
  SocketErr: (err: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  message: (data: string) => void;
}

export const createSocket = (token: any): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> => {
  return io("http://localhost:3000/chat/global", {
    auth: {
      token,
    },
    transports: ["websocket"],
  });
};
