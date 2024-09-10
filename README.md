# 아이템 시뮬레이터

게임 내 아이템의 관리 및 시뮬레이션을 위한 API 만들기!

이 프로젝트는 사용자의 회원가입, 로그인을 비롯한 아이템 추가, 업데이트 등의 기능을 제공합니다.

## API 명세서
- [계정 API](docs/account-api.md)
- [캐릭터 API](docs/character-api.md)
- [아이템 API](docs/item-api.md)
- [인벤토리 API](docs/inventory-api.md)
- [장착장비 API](docs/equipment-api.md)
- [머니 API](docs/money-api.md)

## 질의응답

1. **암호화 방식**<br><br>
    Q: 비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요?<br>
    답변: 해시(Hash)는 **단방향 암호화 방식**에 해당합니다. 단방향 암호화는 입력값을 암호화한 후, 암호화된 값을 원래의 입력값으로 복원하는 것이 매우 어려운 방식으로, 해시 함수는 입력 데이터를 고정된 길이의 해시 값으로 변환합니다. 따라서 이 과정에서 복원 가능성이 거의 없고, 원래 데이터로 역산하기가 매우 힘듭니다.

    Q: 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?<br>
    답변: 보안상의 장점이 있습니다. 해시는 단방향 암호화 방식이기에 해시된 비밀번호를 역산하여 원본 비밀번호를 알아내기가 매우 힘듭니다. 특히나 솔트(Salt) - 비밀번호와 함께 추가되는 임의의 데이터 - 를 추가해서 같은 비밀번호라도 다른 해시값을 생성하여 레인보우 테이블 공격(사전 공격)과 같은 공격에도 대비가 가능합니다. 또한, 해시 함수의 속성으로 **내성성**이 존재합니다. 일정 시간 내에 많은 데이터를 처리하더라도 일정한 길이의 해시 값을 생성하고, 해시 값을 원래 데이터로 역산하는 데에 많은 시간과 자원이 필요하게 만듭니다. 마지막으로 비밀번호 관리의 유연성이 있습니다. 해시 알고리즘이 업데이트되더라도 저장된 해시 값을 새로운 알고리즘으로 재처리하여 관리가 가능합니다.

2. **인증 방식**<br><br>
    Q: JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요?<br>
    답변: 먼저 권한 없이 접근이 가능하다는 문제가 있습니다. 불순한 마음을 먹은 사람이 마치 인증된 사용자처럼 행동하고 리소스나 기능에 접근이 가능하게 됩니다. 그리고 해당 계정의 개인 정보를 조회하거나 변경할 수 있게 됩니다. 또한, 토큰을 사용하여 과도한 서비스 요청을 할 수 있게 되는데, 이로 인해 서비스의 성능 저하나 서비스 거부(DoS) 공격을 초래하게 됩니다. 그 밖에도 사용자의 신뢰를 얻기 위해 이 토큰을 사용하여 합법적인 API 호출을 흉내내는 등 스푸핑 및 피싱 공격도 발생할 수 있습니다.

    Q: 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?<br>
    답변: 원시적인 답변으로는 Access Token의 유효 기간을 되도록 짧게 설정하는 방법이 있습니다. 이에 따라오는 문제에 대해서, Refresh Token을 사용하여 Access Token을 갱신하면 유효 기간이 짧더라도 세션을 유지할 수 있게 될 것입니다. 그 외의 방법으로, 모든 토큰을 HTTPS를 통해 안전하게 전달하여 중간자 공격(man-in-the-middle attack)으로부터 보호하고, 서버 측에서 모든 요청의 토큰을 검증하거나 Access Token 노출 시 폐기하는 메커니즘을 구현하는 방법, 토큰 스토리지를 이용하는 방법 등이 존재합니다.

3. **인증과 인가**<br><br>
    Q: 인증과 인가가 무엇인지 각각 설명해 주세요.<br>
    답변:<br>
    인증(Authentication)이란, 사용자가 주장하는 신원이 실제로 그 사용자임을 확인하는 과정. 즉, 사용자가 누구인지 검증하는 과정입니다.<br>
    인가(Authorization)란, 인증된 사용자에게 특정 자원이나 작업에 대한 접근 권한을 부여하는 과정. 즉, 인증된 사용자가 무엇을 할 수 있는지 결정하는 과정입니다.

    Q: 위 API 구현 명세에서 인증을 필요로 하는 API와 그렇지 않은 API의 차이가 뭐라고 생각하시나요?<br>
    답변: 보안 요구 사항과 사용자 혹은 시스템의 권한 관리에 따라 인증 필요 유무가 결정된다고 생각합니다. 예를 들어, 개인 정보나 권한이 필요한 동작에는 필시 인증(로그인 등)이 필요할 것입니다. 그러나 공개 데이터를 작업하거나 비공식적인 요청을 수행할 경우에는 인증없이 바로 수행하게 됩니다.

    Q: 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?<br>
    답변: 아이템을 생성하거나 수정하는 API는 아이템이라는 비즈니스 데이터를 직접적으로 변경하는 기능을 제공합니다. 만약 아이템과 관련된 작업에 인증이 없다면 누구나 아이템을 수정하거나 삭제할 수 있어 데이터 무결성에 큰 위협이 되고 시스템의 보안과 프로세스에 피해를 끼칠 것입니다.

4. **Http Status Code**<br><br>
    Q: 과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.<br>
    답변:<br>
    200 OK - 요청이 성공적으로 처리되었음을 나타냅니다. GET 요청이나 POST 요청에 대한 성공 응답으로 사용했습니다.<br>
    201 Created - 요청이 성공적으로 처리되어 새로운 자원이 생성되었음을 나타냅니다. POST 요청을 통해 새로운 자원을 생성할 때 사용했습니다.<br>
    204 No Content - 요청이 성공적으로 처리되었으나 반환할 콘텐츠가 없음을 나타냅니다. DELETE 요청이 성공적으로 처리되었을 때 사용했습니다.<br><br>
    400 Bad Request - 서버가 요청을 이해하지 못하거나 잘못된 요청을 받았음을 나타냅니다. 대부분의 요청 데이터에서, 오류가 있을 때 사용했습니다.<br>
    401 Unauthorized - 요청이 인증되지 않았음을 나타냅니다. 인증이 필요한 API에서 인증 실패 시 사용했습니다.<br>
    403 Forbidden - 서버가 요청을 이해했으나, 권한이 부족하여 요청을 거부했음을 나타냅니다. 로그인을 하였으나 해당 계정 캐릭터가 아닐 때 주로 사용했습니다.<br>
    404 Not Found - 요청한 자원을 찾을 수 없음을 나타냅니다. 아이템 요청 시 해당 아이템이 존재하지 않았을 때 사용했습니다.<br>
    409 Conflict - 요청이 현재 서버의 상태와 충돌하였음을 나타냅니다. 일반적으로 자원 충돌에서 사용하는데, 저의 경우 아이템 중복 시에 사용했습니다.<br>

5. **게임 경제**<br><br>
    Q: 현재는 간편한 구현을 위해 캐릭터 테이블에 money라는 게임 머니 컬럼만 추가하였습니다.<br><br>
        Q-1: 이렇게 되었을 때 어떠한 단점이 있을 수 있을까요?<br>
        답변: 데이터 확장성 및 유연성이 부족합니다. 게임 머니와 관련된 다른 기능이나 데이터를 더 추가하는 것이 어렵고, 게임 머니를 소비하거나 추가할 때 너무나 단순한 로직으로 구현하는 수 밖에 없습니다.<br>
        데이터 무결성이나 일관성에도 문제가 발생할 수 있습니다. 게임 머니가 오롯이 캐릭터 테이블에 집중되어 있으므로 보안에 문제가 생기며, 빈번하게 업데이트되는 게임머니 특성상 캐릭터와 관련된 여러 속성이 존재하는 캐릭터 테이블에 계속 접근하여 게임머니를 관리하기에는 성능에도 문제가 생길 수 있고 관리에도 불편함이 존재할 수 있습니다.<br><br>
        Q-2: 이렇게 하지 않고 다르게 구현할 수 있는 방법은 어떤 것이 있을까요?<br>
        답변: 정규화를 진행하여 게임 머니와 관련된 다양한 데이터(예: 거래 내역, 게임 머니 유형 등)를 별도의 테이블로 분리하여 데이터의 정규화를 진행하는 방법이 존재합니다. 또한 게임 머니와 관련된 API를 별도로 구현하고 이를 트랜잭션을 이용하여 게임 머니와 관련된 무결성을 유지하는 방법이 있습니다. <br>

    Q. 아이템 구입 시에 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요?<br>
    답변: 가장 먼저 보안의 문제가 있습니다. 가격을 조작하거나 사기 및 악용이 발생할 수 있습니다. 이 또한 마찬가지로 데이터 무결성 문제가 발생하는데, 잘못된 가격이 서버로 전송될 수 있고 잘못된 정보가 저장될 수 있습니다. 그리고 사용자의 잘못된 데이터 입력으로 예상치 못한 동작이 발생할 수 있습니다. 또한, 아이템 구매에 대하여 많은 사용자 검증이 필수로 들어갈 것이고, 보다 더 많은 유효성 검사가 필수적으로 진행되어야 할 것입니다.