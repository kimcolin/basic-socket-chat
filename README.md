# 베이직 채팅방
## 과제 설명
> 실시간 채팅 애플리케이션 소켓 기능 구현

제공된 코드를 기반으로 실시간 채팅 애플리케이션의 소켓 기능을 구현하세요. 이 과제에서는 Socket.IO를 사용하여 사용자 간의 실시간 통신을 가능하게 만드는 것이 목표입니다.

---

## 요구 사항
1. Socket.IO 서버 설정:
socket.io 모듈을 설치하고(npm install socket.io), 서버에 적용하세요.ㅇㅇ

2. 사용자 연결 처리:
사용자가 소켓을 통해 서버에 연결되면 콘솔에 해당 사용자의 소켓 ID를 출력하세요. ㅇㅇ
새로운 사용자가 입장했다는 메시지를 다른 모든 사용자에게 방송하세요.

3. 메시지 송수신 구현:
클라이언트로부터 SEND_MESSAGE 이벤트를 수신하여 메시지를 처리하세요.
받은 메시지를 모든 클라이언트에게 방송하여 실시간 채팅이 가능하도록 하세요.
메시지 객체는 id, content, timestamp 필드를 포함해야 합니다.

4. 사용자 연결 해제 처리:
사용자가 연결을 해제하면 콘솔에 해당 사실을 출력하세요.ㅇㅇ

5. 채팅 데이터 저장:
메시지를 전송할 때마다 서버에 메시지를 저장하세요.

6. 채팅 기록 조회:
GET /messages 엔드포인트를 추가하여, 서버에 저장된 모든 채팅 기록을 반환하세요.ㅇㅇ
---

## 소켓 명세
### SEND_MESSAGE
> 클라이언트 -> 서버 메시지 전송 이벤트
> 
> 서버 -> 클라이언트 메시지 전송 이벤트

**메시지 포멧**
```
{
  "id": "소켓 ID + 난수",
  "content": "전송된 메시지",
  "sender": "메시지 보낸 사용자",
  "timestamp": "메시지 전송 시각"
}
```

---

## 힌트
- 이벤트 리스너: io.on('connection', callback)을 사용하여 새로운 소켓 연결을 처리하세요.
- 이벤트 방송: socket.broadcast.emit()과 io.emit()을 활용하여 이벤트를 방송하세요.
- JSON 처리: 메시지를 주고받을 때 JSON.stringify()와 JSON.parse()를 사용하여 객체를 문자열로 변환하거나 다시 객체로 변환하세요.

WHY?
소켓을 통해 전송할 데이터는 문자열 형식이어야 한다.
따라서 JSON.stringify()를 사용해 객체를 문자열로 변환하여 전송해야한다.

다시 객체로 반환하는 이유는 수신한 데이터는 문자열 형식이므로
클라이언트에서 다시 객체 형태로 사용하기 위해 JSON.parse()로 변환해야한다.


---

## 예시 화면
![demo.png](./demo.png)

## 제출 방법
- 소켓 기능이 완전히 구현된 서버 코드를 제출하세요.
- 추가로 구현한 기능이나 개선 사항이 있다면 설명해주세요.

