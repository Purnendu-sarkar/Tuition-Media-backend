import { createServer } from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./sockets/chat.js";

const app = createApp();
const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

server.listen(env.PORT, () => {
  console.log(`Backend server is running on http://localhost:${env.PORT}`);
});
