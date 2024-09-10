import express from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma/index.js';
import authSignInToken from '../middlewares/auth.signin.middleware.js';

const router = express.Router();

/**
 * 아이템(인벤토리) 구입 API
 * @route POST /items/buy/:characterId
 * @param {string} characterId - 캐릭터 ID
 * @param {number} itemId - 아이템 코드
 * @param {number} count - 아이템 개수
 * @returns {object} - 성공 or 실패 메시지
 */
router.post('/items/buy/:characterId', authSignInToken, async (req, res, next) => {
  const { characterId } = req.params;
  const { item_code, count } = req.body;

  try {
    const buyItem = await prisma.$transaction(
      async (tx) => {
        // 계정 불러오기
        const account = req.account;

        // 캐릭터ID로 로그인한 계정 내 해당 캐릭터 검증
        const character = await tx.characters.findFirst({
          where: {
            characterId,
            accountId: account.accountId,
          },
        });
        if (!character) {
          return res
            .status(403)
            .json({ errorMessage: '본 계정에서 해당 캐릭터를 찾을 수 없습니다.' });
        }

        // 아이템 검증
        const item = await tx.items.findUnique({
          where: {
            item_code: +item_code,
          },
        });
        if (!item) {
          return res.status(404).json({ errorMessage: '해당 아이템은 존재하지 않습니다.' });
        }

        // 아이템 가격 계산
        const totalPrice = item.item_price * count;
        if (character.money < totalPrice) {
          return res.status(400).json({ errorMessage: '보유 금액이 부족합니다.' });
        }

        // 보유 금액 차감
        await tx.characters.update({
          where: { characterId },
          data: {
            money: character.money - totalPrice,
          },
        });

        // 해당 아이템을 인벤토리에 보유하고 있는지 확인
        const existingItem = await tx.inventories.findFirst({
          where: {
            characterId,
            item_code: +item.item_code,
          },
        });

        if (existingItem) {
          // 인벤토리에 존재 시, 수량 증가.
          await tx.inventories.update({
            where: {
              inventoryId: +existingItem.inventoryId,
            },
            data: {
              count: existingItem.count + count,
            },
          });
        } else {
          // 인벤토리에 X 시, 아이템 추가.
          await tx.inventories.create({
            data: {
              characterId,
              item_code: item.item_code,
              count,
            },
          });
        }

        return { message: '아이템 구매에 성공하였습니다.' };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return res.status(200).json(buyItem);
  } catch (err) {
    // 오류 처리 미들웨어
    next(err);
  }
});

/**
 * 아이템(인벤토리) 판매 API
 * @route POST /items/sell/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @param {number} item_code - 아이템 코드
 * @param {number} count - 판매할 수량
 * @returns {object} - 성공 or 실패 메시지 / 캐릭터의 현재 보유 금액
 */
router.post('/items/sell/:characterId', authSignInToken, async (req, res, next) => {
  const { characterId } = req.params;
  const { item_code, count } = req.body;

  try {
    const sellItem = await prisma.$transaction(
      async (tx) => {
        // 계정 불러오기
        const account = req.account;

        // 캐릭터ID로 로그인한 계정 내 해당 캐릭터 검증
        const character = await tx.characters.findFirst({
          where: {
            characterId,
            accountId: account.accountId,
          },
        });
        if (!character) {
          return res
            .status(403)
            .json({ errorMessage: '본 계정에서 해당 캐릭터를 찾을 수 없습니다.' });
        }

        // 인벤토리에서 아이템 조회
        const inventoryItem = await tx.inventories.findFirst({
          where: {
            characterId,
            item_code,
          },
          include: {
            item: true,
          },
        });
        if (!inventoryItem) {
          return res.status(404).json({ errorMessage: '인벤토리에서 해당 아이템을 찾을 수 없습니다.' });
        }
        if (inventoryItem.count < count) {
          return res.status(400).json({ errorMessage: '판매 수량이 보유 수량을 초과합니다.' });
        }

        // 인벤토리에서 아이템 수량 감소
        await tx.inventories.update({
          where: { inventoryId: inventoryItem.inventoryId },
          data: {
            count: inventoryItem.count - count,
          },
        });

        // 아이템 판매 가격 계산 (item_price의 60%)
        const itemPrice = inventoryItem.item.item_price;
        const salePrice = Math.floor(itemPrice * 0.6);
        console.log(salePrice);
        const totalSaleAmount = salePrice * count;

        // 캐릭터의 돈 증가
        const updatedCharacter = await tx.characters.update({
          where: { characterId },
          data: {
            money: character.money + totalSaleAmount,
          },
        });

        return { message: '아이템 판매에 성공하였습니다.', money: updatedCharacter.money };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return res.status(200).json(sellItem);
  } catch (err) {
    // 오류 처리 미들웨어
    next(err);
  }
});

/**
 * 인벤토리 아이템 목록 조회 API
 * @route GET /inventory/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @returns {object} - 성공 or 실패 메시지 / 인벤토리 아이템 목록
 */
router.get('/inventory/:characterId', authSignInToken, async (req, res, next) => {
  const { characterId } = req.params;

  try {
    const account = req.account;

    // 캐릭터ID로 로그인한 계정 내 해당 캐릭터 검증
    const character = await prisma.characters.findFirst({
      where: {
        characterId,
        accountId: account.accountId,
      },
    });
    if (!character) {
      return res.status(403).json({ errorMessage: '본 계정에서 해당 캐릭터를 찾을 수 없습니다.' });
    }

    // 인벤토리 아이템 목록 조회
    const inventoryItems = await prisma.inventories.findMany({
      where: { characterId },
      include: {
        item: true, // 아이템 테이블과 조인하여 아이템 정보 포함
      },
    });

    // response 데이터 형식
    const responseItems = inventoryItems.map((inventoryItem) => ({
      item_code: inventoryItem.item.item_code,
      item_name: inventoryItem.item.item_name,
      item_slot: inventoryItem.item.item_slot,
      count: inventoryItem.count,
    }));

    return res
      .status(200)
      .json({ message: '인벤토리 아이템 목록 조회 성공!', items: responseItems });
  } catch (err) {
    // 오류 처리 미들웨어
    next(err);
  }
});

export default router;
