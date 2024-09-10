import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import validateSignUp from '../middlewares/auth.signup.middleware.js';

dotenv.config();

const router = express.Router();

/**
 * 회원 가입 API
 * @route POST /sign-up
 * @param {string} userId - 사용자 ID
 * @param {string} password - 비밀번호
 * @param {string} passwordCheck - 비밀번호 확인 : validateSignUp
 * @param {string} name - 이름
 * @param {number} age - 나이
 * @returns {object} - 성공 or 실패 메시지 / 계정 정보(비밀번호 제외)
 */
router.post('/sign-up', validateSignUp, async (req, res, next) => {
  try {
    // 에러 처리 미들웨어 테스트
    // throw new Error('에러 핸들링 미들웨어 테스트');

    // body 로부터 userId, password, name, age 전달 받기 - passwordCheck는 validateSignUp 미들웨어에서 체크
    const { userId, password, name, age } = req.body;

    // 동일한 아이디을 가진 사용자 유무 체크
    const isExistUser = await prisma.accounts.findFirst({
      where: { userId },
    });
    if (isExistUser) {
      return res.status(409).json({ errorMessage: '이미 존재하는 아이디입니다.' });
    }

    // 비밀번호 해싱
    const saltRounds = 10; // salt를 얼마나 복잡하게 만들지 결정.
    const hashedPassword = await bcrypt.hash(password, saltRounds); // bcrypt를 이용해서 암호화

    const account = await prisma.accounts.create({
      data: {
        userId: userId,
        password: hashedPassword,
        name: name,
        age: age,
      },
    });

    // 유저 정보 반환
    const accountResponse = {
      userId: account.userId,
      name,
      age,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    return res.status(201).json({ message: '계정 생성에 성공하셨습니다!', user: accountResponse });
  } catch (err) {
    // 에러 처리 미들웨어로 전달
    next(err);
  }
});

/**
 * 로그인 API
 * @route POST /sign-in
 * @param {string} userId - 사용자 ID
 * @param {string} password - 비밀번호
 * @returns {object} - 성공 or 실패 메시지 / JWT 토큰
 */
router.post('/sign-in', async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    const account = await prisma.accounts.findFirst({ where: { userId } });

    // 전달 받은 이메일을 토대로 해당 이메일 유무 확인.
    if (!account) return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    // 전달 받은 함호화된 비밀번호를 토대로 복호화하여 비밀번호 일치 여부 확인.
    if (!(await bcrypt.compare(password, account.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    // JWT 생성
    const payload = {
      accountId: account.accountId,
      userId: account.userId,
    };

    // 엑세스 토큰 생성
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // 로그인 성공 및 엑세스 토큰 반환
    return res.status(200).json({ message: '로그인에 성공하였습니다.', token });
  } catch (err) {
    // 에러 처리 미들웨어
    next(err);
  }
});

export default router;
