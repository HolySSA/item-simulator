# API 명세서

## EQUIPMENT API

### 엔드포인트 (API URL)
- `POST /api/create-character`

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