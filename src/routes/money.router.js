import express from 'express';
import dotenv from 'dotenv';
import { prisma } from '../utils/prisma/index.js';
import authSignInToken from '../middlewares/auth.signin.middleware.js';

dotenv.config();

const router = express.Router();

/**
 * 게임 머니 벌기 API
 * @route POST /money/earn/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @returns {object} - 성공 or 실패 메시지 / 현재 캐릭터 보유 money (100 증가)
 */
router.post('/money/earn/:characterId', authSignInToken, async (req, res, next) => {
  const { characterId } = req.params;

  try {
    // 계정 불러오기
    const account = req.account;

    let character = await prisma.characters.findFirst({
      where: {
        characterId,
        accountId: account.accountId,
      },
    });
    if (!character) {
      return res.status(403).json({ errorMessage: '본 계정에서 해당 캐릭터를 찾을 수 없습니다.' });
    }

    character = await prisma.characters.update({
      where: { characterId },
      data: {
        money: {
          increment: 100,
        },
      },
    });

    const filteredStats = {
      name: character.name,
      money: character.money,
    };

    return res.status(200).json({ message: '100 Money 획득 성공!', data: filteredStats });
  } catch (err) {
    next(err);
  }
});

/**
 * 도박 API
 * @route POST /money/gambling/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @param {number} betting - 도박에 걸 돈
 * @returns {object} - 성공 or 실패 메시지 / 현재 캐릭터 보유 money (성공 시 배팅한 금액 2배)
 */
router.post('/money/gambling/:characterId', authSignInToken, async (req, res, next) => {
  const { characterId } = req.params;
  const { betting } = req.body;

  if (typeof betting !== 'number' || betting <= 0) {
    return res.status(400).json({ errorMessage: '배팅할 금액을 제대로 입력해주세요.' });
  }

  try {
    // 계정 불러오기
    const account = req.account;

    let character = await prisma.characters.findFirst({
      where: {
        characterId,
        accountId: account.accountId,
      },
    });
    if (!character) {
      return res.status(403).json({ errorMessage: '본 계정에서 해당 캐릭터를 찾을 수 없습니다.' });
    }

    if (betting > character.money) {
      return res.status(400).json({ errorMessage: '돈이 없습니다. 배팅에는 신중히 임해주세요!' });
    }

    character = await prisma.characters.update({
      where: { characterId },
      data: {
        money: {
          decrement: betting,
        },
      },
    });

    // 확률 관련 로직은 .env에서 관리
    const winProbability = process.env.BETTING_ODDS;
    const randomNumber = Math.random();

    // 배팅 성공
    let winBetting = false;
    if (randomNumber < winProbability) {
      winBetting = true;

      const winnings = betting * 2;
      character = await prisma.characters.update({
        where: { characterId },
        data: {
          money: {
            increment: winnings,
          },
        },
      });
    }

    const filteredStats = {
      name: character.name,
      money: character.money,
    };

    if(winBetting) {
      return res.status(200).json({ message: '배팅 성공!', data: filteredStats });
    }
    else {
      return res.status(200).json({ message: '배팅 실패!', data: filteredStats });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
