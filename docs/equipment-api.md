# API 명세서

## EQUIPMENT API

### 엔드포인트 (API URL)
- `POST /api/items/equip/:characterId`
- `POST /api/items/unequip/:characterId`
- `GET /api/equipments/:characterId`

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
|아이템 장착 | POST  | /api/items/equip/:characterId | {"item_code": 1}| {<br>"message": "아이템 장착 성공",<br>"stats": {<br>"name": "A1",{<br>"health": 600,{<br>"power": 151,{<br>"defense": 101,{<br>"dex": 100{<br>}<br>}| #403 로그인한 계정의 캐릭터가 아닐 경우<br>{ "errorMessage": "본 계정에서 해당 캐릭터를 찾을 수 없습니다." }<br><br>#404 인벤토리에 해당 아이템이 없거나 장착할 수 없는 아이템일 경우<br>{"errorMessage": "인벤토리에서 해당 아이템을 찾을 수 없습니다."}<br>{ "errorMessage": '장착할 수 없는 아이템입니다.' }<br><br>#409 이미 같은 아이템을 착용한 경우<br>{"errorMessage": "해당 아이템은 이미 장착 중입니다."}<br><br>#Authorization 오류 참고|
|아이템 탈착 | POST  | /api/items/unequip/:characterId | {"slot": "shoes"}| {<br>"unequipItem": {<br>"message": "아이템 탈착 성공.",<br>"stats": {<br>"name": "A1",<br>"health": 600,<br>"power": 151,<br>"defense": 101,<br>"dex": 100<br>}<br>}<br>}| #403 로그인한 계정의 캐릭터가 아닐 경우<br>{ "errorMessage": "본 계정에서 해당 캐릭터를 찾을 수 없습니다." }<br><br>#404 해당 슬롯이 존재하지 않거나 장착 중인 아이템이 없을 경우.<br>{"errorMessage": "해당 슬롯은 존재하지 않습니다."}<br>{"errorMessage": "해당 슬롯에 장착 중인 아이템이 없습니다."}<br><br>#Authorization 오류 참고|
|장착 아이템 목록 조회 | GET  | /api/equipments/:characterId  | { }| {<br>"message": "장착 중인 아이템 목록 조회 성공!",<br>"items": [<br>{<br>"item_code": 1,<br>"item_name": "파멸의 반지_리뉴얼2",<br>"item_slot": "accessories"<br>}<br>]<br>}| #404 해당 캐릭터가 존재하지 않을 경우<br>{ "errorMessage": "해당 캐릭터는 존재하지 않습니다." }|