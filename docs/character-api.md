# API 명세서

## CHARACTER API

### 엔드포인트 (API URL)
- `POST /api/create-character`
- `GET /api/characters`

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

| 기능    | METHOD   | API URL    |Request| Response| Response Error|
|---------------|---------------|---------------|---------------|---------------|---------------|
|캐릭터 생성 | POST  | api/create-character  | {<br>"name": "A1"<br>}  | {<br>"data": {<br>"characterId": "1-1",<br>"accountId": 1,<br>"name": "A1",<br>"health": 500,<br>"power": 100,<br>"money": 10000,<br>"createdAt": "2024-09-09T10:35:36.333Z",<br>"updatedAt": "2024-09-09T10:35:36.333Z"<br>}<br>}  | #400 캐릭터 명에 오류가 발생할 경우<br>{"errorMessage": "캐릭터 명을 입력해주세요."}<br>{"errorMessage": "이미 존재하는 캐릭터 명입니다."}|
|보유 캐릭터 목록 조회 | GET  | /api/characters  | { } | {<br>
	"characters": [<br>
		{<br>
			"accountId": 1,<br>
			"characterId": "1-3",<br>
			"name": "A3",<br>
			"createdAt": "2024-09-09T10:35:36.333Z",<br>
			"updatedAt": "2024-09-09T10:35:36.333Z"<br>
		},<br>
		{<br>
			"accountId": 1,<br>
			"characterId": "1-2",<br>
			"name": "A2",<br>
			"createdAt": "2024-09-09T10:35:32.298Z",<br>
			"updatedAt": "2024-09-09T10:35:32.298Z"<br>
		},<br>
		{<br>
			"accountId": 1,<br>
			"characterId": "1-1",<br>
			"name": "A1",<br>
			"createdAt": "2024-09-09T10:35:29.198Z",<br>
			"updatedAt": "2024-09-09T11:21:34.716Z"<br>
		}<br>
	]<br>
}  | #401 ID 및 비밀번호 일치하지 않을 경우<br>{"errorMessage": "존재하지 않는 아이디입니다."}<br>{"errorMessage": "비밀번호가 일치하지 않습니다."}<br> |