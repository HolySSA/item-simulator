# API 명세서

## ITEM API

### 엔드포인트 (API URL)
- `POST /api/items`
- `PATCH /api/items/:item_code`

### API 명세표

| 기능    | METHOD   | API URL    |Request| Response| Response Error|
|---------------|---------------|---------------|---------------|---------------|---------------|
|아이템 생성 | POST  | /api/items  | {<br>"item_code": 1,<br>"item_name": "테스트무기",<br>"item_stat": { "power": 1 },<br>"item_slot": "weapon",<br>"item_price": 10<br>}| {<br>"message": "아이템 생성에 성공하였습니다.",<br>"item": {<br>"item_id": 5,<br>"item_code": 1,<br>"item_name": "테스트무기",<br>"item_stat": {<br>"power": 1<br>},<br>"item_slot": "weapon",<br>"item_price": 10,<br>"createdAt": "2024-09-10T10:13:34.610Z",<br>"updatedAt": "2024-09-10T10:13:34.610Z"<br>}<br>}| #400 body에 올바른 포맷으로 데이터를 기입하지 않았을 경우<br>{ "errorMessage": '아이템 정보를 알맞게 기입해주세요.' }<br><br>#409 이미 아이템명이나 아이템코드가 존재할 경우<br>{ "errorMessage": '이미 존재하는 아이템 코드입니다.' }<br>{ "errorMessage": '이미 존재하는 아이템 명입니다.' }|
|아이템 수정 | PATCH  | /api/items/:item_code  | {<br>"item_name": "파멸의 반지_리뉴얼",<br>"item_stat": { "health": 50, "power": 2 },<br>"item_slot": "accessories"<br>} | {<br>"message": "아이템 수정에 성공하였습니다.",<br>"item": {<br>"item_id": 3,<br>"item_code": 3,<br>"item_name": "파멸의 반지_리뉴얼",<br>"item_stat": {<br>"power": 2,<br>"health": 50<br>},<br>"item_slot": "accessories",<br>"item_price": 500,<br>"createdAt": "2024-09-09T10:37:46.875Z",<br>"updatedAt": "2024-09-09T10:38:37.974Z"<br>}<br>}| #404 아이템 ID에 맞는 아이템이 존재하지 않을 경우<br>{"errorMessage": "해당 아이템은 존재하지 않습니다."}<br><br>#400 수정할 속성을 입력하지 않았을 경우<br>{"errorMessage": "수정할 필드를 하나 이상 기입해주세요."}|