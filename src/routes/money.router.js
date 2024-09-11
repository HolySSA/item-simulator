import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authSignInToken from '../middlewares/auth.signin.middleware.js';

const router = express.Router();

/**
 * 게임 머니 벌기 API
 * @route POST /money/earn/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @returns {object} - 성공 or 실패 메시지 : 현재 캐릭터 보유 money
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

export default router;
