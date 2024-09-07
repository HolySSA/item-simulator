import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '../utils/prisma/index.js';

dotenv.config();

/**
 * 로그인(sign-in) 검증
 * @param {*} req 
 * @param {*} res 
 * @param {*} next - 다음 미들웨어
 */
const authSignInToken = async (req, res, next) => {
  try {
    // 로그인 시 토큰 확인 후 insomnia 헤더에 Authorization / Bearor 토큰 기입으로 확인
    // 헤더에서 Authorization 토큰 추출
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: 'Authorization 헤더가 제공되지 않았습니다.' });
    }

    // authorization은 `Bearer 토큰명` 으로 구성되어 있기 때문에 split으로 구조분해할당
    const [tokenType, token] = authorization.split(' ');

    // 쿠키가 Bearer 토큰 형식인지 확인
    if (tokenType !== 'Bearer')
      throw new Error('Token Type이 Bearer 형식이 아닙니다.');

    // 서버에서 발급한 JWT 검증 -  토큰이 일치하지 않는다면 error -> catch로 이동
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const accountId = decodedToken.accountId;

    // 데이터베이스에서 계정 존재 여부 확인
    const account = await prisma.accounts.findFirst({
      where: {
        accountId: +accountId,
      },
    });

    if (!account) {
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    req.account = account;

    // 다음 미들웨어로
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ message: '토큰이 조작되었습니다.' });

    return res.status(400).json({ message: err.message });
  }
};

export default authSignInToken;
