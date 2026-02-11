import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { handleDisconnect, handleMessage, startSession } from "./chatRoom";
import { getProfile } from "./db";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });

app.prepare().then(() => {
  const handle = app.getRequestHandler();
  const upgrade = app.getUpgradeHandler();
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);

    if (parsedUrl.pathname === "/api/startSession") {
      const sessionId = startSession();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ sessionId }));
      return;
    }

    if (parsedUrl.pathname === "/api/profile" && req.method === "GET") {
      const username = parsedUrl.query.username as string | undefined;
      if (!username) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "username required" }));
        return;
      }
      const profile = getProfile(username);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ profile }));
      return;
    }

    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (socket) => {
    socket.on("message", (raw) => {
      handleMessage(socket, raw.toString());
    });

    socket.on("close", () => {
      handleDisconnect(socket);
    });
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url!, true);

    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      // Let Next.js handle HMR and other upgrade requests
      upgrade(req, socket, head);
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
