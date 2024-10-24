import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import * as path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let messages = [];

let today = new Date();

let day = ['일','월','화','수','목','금','토'];

let todayFormat =
  today.getFullYear() +
  "년 " +
  (today.getMonth() + 1) +
  "월 " +
  today.getDate() +
  "일 " +
  day[today.getDay()] +
  "요일"
  today.getHours() +
  "시 " +
  today.getMinutes() +
  "분 " +
  today.getSeconds() +
  "초";

io.on("connection", (socket) => {
  io.emit("SEND_MESSAGE", { // 새로운 사용자 입장 메세지
    id: `${socket.id} - ${Math.random()}`, //"-"는 그냥 구분하기위한 선
    content: `${socket.id}이 입장했습니다.`,
    sender: socket.id,
    timestamp: todayFormat,
  });
  console.log("사용자가 연결되었습니다", socket.id);

  // 메세지 송수신 구현, 메시지 객체는 id, content, timestamp 필드를 포함해야 합니다
  socket.on("SEND_MESSAGE", (msg) => {
    console.log(`${msg}입니다`);
    // const parseMessage = JSON.parse(msg); // 문자열을 객체로 변환

    const message = {
      id: `${socket.id} - ${Math.random()}`, //"-"는 그냥 구분하기위한 선
      content: msg,
      sender: socket.id,
      timestamp: todayFormat,
    };

    // 메시지를 전송할 때마다 서버에 메시지를 저장하세요.
    messages.push(message); // 배열에 저장
    io.emit("SEND_MESSAGE", JSON.stringify(message)); // 객체를 문자열로 변환한 메시지를 클라이언트에게 발송
    console.log(messages);
  });

  socket.on("disconnect", () => {
    console.log("사용자가 연결을 끊었습니다", socket.id);
  });
});

// GET /messages 엔드포인트를 추가하여, 서버에 저장된 모든 채팅 기록을 반환하세요
app.get("/messages", (req, res) => {
  res.json(messages);
});

app.use(express.static(path.join(path.resolve(), "public")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
