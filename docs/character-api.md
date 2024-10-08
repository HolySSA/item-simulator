# API 명세서

## CHARACTER API

### 엔드포인트 (API URL)
- `POST /api/create-character` : 캐릭터 생성
- `GET /api/characters` : 보유 캐릭터 목록 조회
- `GET /api/characters/:characterId` : 캐릭터 정보 상세 조회(로그인)
- `GET /api/characters/:characterId/without-auth` : 캐릭터 정보 상세 조회(로그인 X)
- `DELETE /api/characters/:characterId` : 캐릭터 삭제

### Authorization 오류

- #401 Header에 Authorization을 제공(추가)하지 않았을 경우
{"errorMessage": "Authorization 헤더가 제공되지 않았습니다."}
- #401 토큰이 조작되거나 만료되었을 경우
{"errorMessage": "토큰이 만료되었습니다."}<br>
{"errorMessage": "토큰이 조작되었습니다."}
- #400 Token Type에 오류가 발생할 경우
{"errorMessage": "Token Type이 Bearer 형식이 아닙니다."}<br>
{"errorMessage": "토큰 사용자가 존재하지 않습니다."}

### API 명세표

| 기능    | METHOD   | API URL    | Request | Response| Response Error|
|---------------|---------------|---------------|---------------|---------------|---------------|
|캐릭터 생성 | POST  | /api/create-character  | {<br>"name": "A1"<br>}  | {<br>"data": {<br>"characterId": "1-1",<br>"accountId": 1,<br>"name": "A1",<br>"health": 500,<br>"power": 100,<br>"defense": 100,<br>"dex": 100,<br>"money": 10000,<br>"createdAt": "2024-09-09T10:35:36.333Z",<br>"updatedAt": "2024-09-09T10:35:36.333Z"<br>}<br>}  | #400 캐릭터 명에 오류가 발생할 경우<br>{"errorMessage": "캐릭터 명을 입력해주세요."}<br>{"errorMessage": "이미 존재하는 캐릭터 명입니다."}<br><br> #Authorization 오류 참고|
|보유 캐릭터 목록 조회 | GET  | /api/characters  | { } | {<br>"characters": [<br>{<br>"accountId": 1,<br>"characterId": "1-3",<br>"name": "A3",<br>"createdAt": "2024-09-09T10:35:36.333Z",<br>"updatedAt": "2024-09-09T10:35:36.333Z"<br>},<br>{<br>"accountId": 1,<br>"characterId": "1-2",<br>"name": "A2",<br>"createdAt": "2024-09-09T10:35:32.298Z",<br>"updatedAt": "2024-09-09T10:35:32.298Z"<br>},<br>{<br>"accountId": 1,<br>"characterId": "1-1",<br>"name": "A1",<br>"createdAt": "2024-09-09T10:35:29.198Z",<br>"updatedAt": "2024-09-09T11:21:34.716Z"<br>}<br>]<br>}  | #Authorization 오류 참고|
|캐릭터 정보 상세 조회 (로그인) | GET  | /api/characters/:characterId  | { } | {<br>"character": {<br>"characterId": "1-1",<br>"accountId": 1,<br>"name": "A1",<br>"health": 500,<br>"power": 100,<br>"defense": 100,<br>"dex": 100,<br>"createdAt": "2024-09-10T13:14:51.275Z",<br>"updatedAt": "2024-09-10T13:14:51.275Z",<br>"money": 10000<br>}<br>}<br><br> #만약 로그인한 계정의 캐릭터가 아닐 경우 로그인 X response 와 동일| #404 해당 characterId의 캐릭터가 없을 경우<br>{"errorMessage": "해당 캐릭터는 존재하지 않습니다."}<br><br>#Authorization 오류 참고|
|캐릭터 정보 상세 조회 (로그인 X) | GET  | /api/characters/:characterId/without-auth  | { } | {<br>"character": {<br>"characterId": "1-1",<br>"accountId": 1,<br>"name": "A1",<br>"health": 922,<br>"power": 124,<br>"defense": 100,<br>"dex": 100,<br>"createdAt": "2024-09-09T10:35:29.198Z",<br>"updatedAt": "2024-09-09T11:21:34.716Z",<br>}<br>}| #404 해당 characterId의 캐릭터가 없을 경우<br>{"errorMessage": "해당 캐릭터는 존재하지 않습니다."}|
|캐릭터 삭제 | DELETE  | /api/characters/:characterId  | { } | {"message": "캐릭터가 성공적으로 삭제되었습니다."} | #404 해당 characterId의 캐릭터가 없을 경우<br>{"errorMessage": "해당 캐릭터는 존재하지 않습니다."}<br><br> #403 로그인한 계정의 캐릭터가 아닐 경우<br>{"errorMessage": "해당 캐릭터를 삭제할 권리가 없습니다."}<br><br>#Authorization 오류 참고|