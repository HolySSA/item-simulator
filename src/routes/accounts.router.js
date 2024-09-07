import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import validateSignUp from '../middlewares/auth.signup.middleware.js';

dotenv.config();

const router = express.Router();

/** Accounts-Users 회원가입 API **/
router.post('/sign-up', validateSignUp, async (req, res, next) => {
  try {
    // 에러 처리 미들웨어 테스트
    // throw new Error('에러 핸들링 미들웨어 테스트');
    
    // body 로부터 userAccount, password, name, age 전달 받기 - passwordCheck는 validateSignUp 미들웨어에서 체크
    const { userAccount, password, name, age } = req.body;
    
    // 동일한 아이디을 가진 사용자 유무 체크
    const isExistUser = await prisma.accounts.findFirst({
      where: { userAccount },
    });
    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 비밀번호 해싱
    const saltRounds = 10; // salt를 얼마나 복잡하게 만들지 결정.
    const hashedPassword = await bcrypt.hash(password, saltRounds); // bcrypt를 이용해서 암호화

    // 트랜잭션 적용
    const [account, user] = await prisma.$transaction(
      async (tx) => {
        const account = await tx.accounts.create({
          data: {
            userAccount,
            password: hashedPassword,
          },
        });

        const user = await tx.users.create({
          data: {
            accountId: account.accountId,
            name,
            age,
          },
        });

        return [account, user];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    // 유저 정보 반환
    const userResponse = {
      userAccount: account.userAccount,
      name: user.name,
      age: user.age,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(201).json({ message: '계정 생성에 성공하셨습니다!', user: userResponse });
  } catch (err) {
    // 에러 처리 미들웨어로 전달
    next(err);
  }
});

/** Accounts 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  try {
    const { userAccount, password } = req.body;

    const account = await prisma.accounts.findFirst({ where: { userAccount } });

    // 전달 받은 이메일을 토대로 해당 이메일 유무 확인.
    if (!account)
      return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
    // 전달 받은 함호화된 비밀번호를 토대로 복호화하여 비밀번호 일치 여부 확인.
    if (!(await bcrypt.compare(password, account.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    // JWT 생성
    const payload = {
      accountId: account.accountId,
      userAccount: account.userAccount
    };

    // 엑세스 토큰 생성
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    // 로그인 성공 및 엑세스 토큰 반환
    return res.status(200).json({ message: '로그인에 성공하였습니다.' , token });
  }
  catch (err) {
    // 에러 처리 미들웨어
    next(err);
  }
});

export default router;
