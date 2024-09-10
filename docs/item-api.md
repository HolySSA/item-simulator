# API 명세서

## ITEM API

### 엔드포인트 (API URL)
- `POST /api/items`

### API 명세표

| 기능    | METHOD   | API URL    |Request| Response| Response Error|
|---------------|---------------|---------------|---------------|---------------|---------------|
|아이템 생성 | POST  | /api/items  | {<br>"item_code": 1,<br>"item_name": "테스트무기",<br>"item_stat": { "power": 1 },<br>"item_slot": "weapon",<br>"item_price": 10<br>}| {<br>"message": "아이템 생성에 성공하였습니다.",<br>"item": {<br>"item_id": 5,<br>"item_code": 1,<br>"item_name": "테스트무기",<br>"item_stat": {<br>"power": 1<br>},<br>"item_slot": "weapon",<br>"item_price": 10,<br>"createdAt": "2024-09-10T10:13:34.610Z",<br>"updatedAt": "2024-09-10T10:13:34.610Z"<br>}<br>}| #400 body에 올바른 포맷으로 데이터를 기입하지 않았을 경우<br>{ "errorMessage": '아이템 정보를 알맞게 기입해주세요.' }<br>#409 이미 아이템명이나 아이템코드가 존재할 경우<br>{ "errorMessage": '이미 존재하는 아이템 코드입니다.' }<br>{ "errorMessage": '이미 존재하는 아이템 명입니다.' }|