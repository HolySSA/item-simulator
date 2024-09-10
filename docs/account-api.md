# API 명세서

## ACCOUNT API

### 엔드포인트 (API URL)
- `POST /api/sign-up`
- `POST /api/sign-in`

### API 명세표

| 기능    | METHOD   | API URL    |Request| Response| Response Error|
|----------|----------|----------|----------|----------|----------|
|회원 가입 | POST  | /api/sign-up  | {<br>"userId" : "b",<br>"password" : "bbbbbb",<br>"passwordCheck" : "bbbbbb",<br>"name" : "userA",<br>"age" : 30}  | 데이터2  | 데이터3  |
|  로그인  | POST  | /api/sign-in  | 데이터4  | 데이터5  | 데이터6  |