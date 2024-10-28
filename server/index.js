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

// 타임 스탬프 가독성
let today = new Date();

let day = ["일", "월", "화", "수", "목", "금", "토"];

let todayFormat =
  today.getFullYear() +
  "년 " +
  (today.getMonth() + 1) +
  "월 " +
  today.getDate() +
  "일 " +
  day[today.getDay()] +
  "요일 " +
  today.getHours() +
  "시 " +
  today.getMinutes() +
  "분 " +
  today.getSeconds() +
  "초";

// 랜덤 닉네임 생성
const name = [
  "쥐",
  "소",
  "호랑이",
  "토끼",
  "용",
  "뱀",
  "말",
  "양",
  "원숭이",
  "닭",
  "개",
  "돼지",
];
const adjective = ["무서운", "귀여운", "슬픈", "놀라운", "화난", "똑똑한"];

function nickname() {
  const random1 = name[Math.floor(Math.random() * name.length)];
  const random2 = adjective[Math.floor(Math.random() * adjective.length)];
  return `${random2} ${random1}`;
}

io.on("connection", (socket) => {
  socket.nickname = nickname();

  socket.broadcast.emit("SEND_MESSAGE", {
    // 새로운 사용자 입장 메세지
    id: `${socket.id} - ${Math.random()}`, //"-"는 그냥 구분하기위한 선
    content: `${socket.id}님이 입장했습니다.`,
    sender: socket.nickname,
    timestamp: todayFormat,
  });
  console.log("사용자가 연결되었습니다", socket.id);

  // 메세지 송수신 구현, 메시지 객체는 id, content, timestamp 필드를 포함해야 합니다
  socket.on("SEND_MESSAGE", (msg) => {
    console.log(`${msg}입니다`);
    // const parseMessage = JSON.parse(msg); // 문자열을 객체로 변환
    socket.nickname = nickname();

    const message = {
      id: `${socket.id} - ${Math.random()}`, //"-"는 그냥 구분하기위한 선
      content: msg,
      sender: socket.nickname,
      timestamp: todayFormat, // 원래는 new Date()였음
    };

    // 메시지를 전송할 때마다 서버에 메시지를 저장하세요.
    messages.push(message); // 배열에 저장
    io.emit("SEND_MESSAGE", JSON.stringify(message)); // 객체를 문자열로 변환한 메시지를 클라이언트에게 발송
    console.log(messages);
  });

  // 룸 메세지 전송
  socket.on("SEND_MESSAGE", ({ room, message }) => {
    console.log("SEND_MESSAGE", room, message);

    socket.nickname = nickname();

    io.to(room).emit("SEND_MESSAGE", {
      id: `${socket.id}-${Math.random()}`,
      content: message,
      sender: socket.nicknameid,
      timestamp: todayFormat,
    });

    messages.push(message); // 배열에 메세지 저장
    io.to(room).emit("SEND_MESSAGE", JSON.stringify(message)); // 객체를 문자열로 변환한 메시지를 클라이언트에게 발송
    console.log(`${message}입니다`);
  });

  // 룸 입장 알림
  socket.on("JOIN_ROOM", (room) => {
    socket.join(room);
    console.log(`${socket.id}님이 방 ${room}에 입장했습니다.`);

    socket.nickname = nickname();

    const message = {
      id: `${socket.id} - ${Math.random()}`, //"-"는 그냥 구분하기위한 선
      content: `${socket.id}님이 방 ${room}에 입장했습니다.`,
      sender: socket.nickname,
      timestamp: todayFormat, // 원래는 new Date()였음
    };
    console.log(`${message}입니다`);

    io.to(room).emit("SEND_MESSAGE", JSON.stringify(message));
    console.log("JOIN_ROOM", room);
  });

  // 사용자가 채팅방을 떠날 때 호출됩니다
  socket.on("LEAVE_ROOM", (room) => {
    socket.leave(room);
    console.log(`${socket.id}님이 ${room} 방을 떠났습니다.`);

    socket.nickname = nickname();

    // 방을 떠날 때 알림 메시지 전송
    io.to(room).emit("SEND_MESSAGE", {
      id: `${socket.id} - ${Math.random()}`,
      content: `${socket.id}님이 방을 떠났습니다.`,
      sender: socket.nickname,
      timestamp: todayFormat,
    });
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
