# API 명세서

## ITEM API

### 엔드포인트 (API URL)
- `POST /api/money/earn/:characterId` : 게임 머니 벌기

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
|게임 머니 벌기 | POST  | /api/money/earn/:characterId  | { }| {<br>"message": "100 Money 획득 성공!",<br>"data": {<br>"name": "A1",<br>"money": 4169<br>}<br>}| #403 로그인한 계정의 캐릭터가 아닐 경우<br>{ "errorMessage": "본 계정에서 해당 캐릭터를 찾을 수 없습니다." }<br><br>#Authorization 오류 참고|