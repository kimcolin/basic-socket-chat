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

  // 룸 메세지 전송
  socket.on("SEND_MESSAGE", ({ room, message }) => {
    console.log("SEND_MESSAGE", room, message);
    socket.nickname = nickname();

    io.to(room).emit("SEND_MESSAGE", {
      id: `${socket.id}-${Math.random()}`,
      content: message,
      sender: socket.nickname,
      timestamp: todayFormat,
    });

    messages.push(message); // 배열에 메세지 저장
    io.to(room).emit("SEND_MESSAGE", JSON.stringify(message)); // 객체를 문자열로 변환한 메시지를 클라이언트에게 발송
    console.log(messages)
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
    // console.log(`${message}입니다`);

    io.to(room).emit("SEND_MESSAGE", JSON.stringify(message));
    console.log("JOIN_ROOM", room);
  });

  //사용자가 채팅방을 떠날 때 호출됩니다
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

  // leave room과 deisconnect 를 주석처리해서 실행해본 결과
  // 연결이 끊기는 것인지 하얀 페이지로 넘어가는 것인지 정확하게 모르겠음 연결은 안 끊기는 것으로 추정
  // 이렇게 돼서 물어본 결과 클라이언트 수정을 해야 될 것 같다. 베이직반 튜터님께 다시 여쭤 보는걸 추천

  // 일단 이렇게 에러문구가 나오지 않고 문제가 생기는 경우 어떻게 문제를 찾는지 궁금.

  // 에러가 어디서 난건지 구분할 줄 알아야됨
  // 지금과 같이 서버의 문제는 아니고 브라우저에서 이게 뭔데? 하고 에러를 발생시킨거기 때문에 개발자 도구를 확인했을 때 에러를 확인 할 수 있다
  // 샌드 메세지 이벤트가 중복이 되어 에러가 발생 했다고 볼수있다
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
