import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import validateSignUp from '../middlewares/auth.signup.middleware.js';

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

export default router;
