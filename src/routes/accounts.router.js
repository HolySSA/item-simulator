import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

const router = express.Router();

/** Accounts-Users 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    // body 로부터 userAccount, password, name, age 전달 받기
    const { userAccount, password, name, age } = req.body;

    const isExistUser = await prisma.accounts.findFirst({
      where: { userAccount },
    });
    // 동일한 아이디을 가진 사용자 유무 체크
    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

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

    return res.status(201).json({ message: '계정 생성에 성공하셨습니다!' });
  } catch (err) {
    // 임시
    console.log(err);
  }
});

export default router;
