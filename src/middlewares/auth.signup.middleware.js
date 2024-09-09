// userId 유효성 검사 (영어 소문자와 숫자만 허용)
const userIdRegex = /^[a-z0-9]+$/;

/**
 * 회원 가입 유효성 검사
 * @param {*} req - 요청
 * @param {*} res - 클라
 * @param {*} next - 다음 미들웨어
 */
const validateSignUp = (req, res, next) => {
  const { userId, password, passwordCheck, name, age } = req.body;

  // userAccount 유효성 검사 (영어 소문자와 숫자만 허용)
  if (!userIdRegex.test(userId)) {
    return res.status(400).json({ message: '아이디는 영어 소문자와 숫자만 포함할 수 있습니다.' });
  }

  // 비밀번호 길이 검사
  if (password.length < 6) {
    return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
  }
  
  // 비밀번호 확인 검사
  if (!passwordCheck) {
    return res.status(400).json({ message: '비밀번호 확인에 비밀번호를 입력해주세요.' });
  }
  if (password !== passwordCheck) {
    return res.status(400).json({ message: '비밀번호 확인이 잘못되었습니다.' });
  }

  next();
};

export default validateSignUp;