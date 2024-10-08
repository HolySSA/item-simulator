# API 명세서

## ACCOUNT API

### 엔드포인트 (API URL)
- `POST /api/sign-up` : 회원 가입
- `POST /api/sign-in` : 로그인

### API 명세표

| 기능    | METHOD   | API URL    |Request| Response| Response Error|
|---------------|---------------|---------------|---------------|---------------|---------------|
|회원 가입 | POST  | /api/sign-up  | {<br>"userId" : "a",<br>"password" : "aaaaaa",<br>"passwordCheck" : "aaaaaa",<br>"name" : "userA",<br>"age" : 30<br>}  | {<br>"message": "계정 생성에 성공하셨습니다!",<br>"user": <br>{<br>"userId": "a",<br>"name": "userA",<br>"age": 30,<br>"createdAt": "2024-09-09T10:34:05.669Z",<br>"updatedAt": "2024-09-09T10:34:05.669Z"<br>}<br>}  | #400 body에 올바른 데이터를 기입하지 않았을 경우<br>{"errorMessage": "아이디는 알파벳 소문자와 숫자만 포함할 수 있습니다."}<br>{"errorMessage": "비밀번호는 최소 6자 이상이어야 합니다."}<br>{"errorMessage": "비밀번호 확인에 비밀번호를 입력해주세요."}<br>{"errorMessage": "비밀번호 확인이 일치하지 않습니다."}<br><br>#409 이미 해당 계정이 존재할 경우<br>{"errorMessage": '이미 존재하는 아이디입니다.'}|
|  로그인  | POST  | /api/sign-in  | {<br>"userId" : "a",<br>"password" : "aaaaaa"<br>} | {<br>"message": "로그인에 성공하였습니다.",<br>"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2<br>NvdW50SWQiOjEsInVzZXJJZCI6ImEiLCJpYXQiOjE3M<br>jU5NTQ5NTAsImV4cCI6MTcyNTk1ODU1MH0.<br>1XQol42x6phDyjGpvJsNGTBZ4WG73k3MmraqzgGAXo8"<br>}  | #401 ID 및 비밀번호 일치하지 않을 경우<br>{"errorMessage": "존재하지 않는 아이디입니다."}<br>{"errorMessage": "비밀번호가 일치하지 않습니다."}<br> |