import express from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma/index.js';
import authSignInToken from '../middlewares/auth.signin.middleware.js';

const router = express.Router();

/**
 * 아이템 장착 API
 * @route POST /items/equip/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @param {number} item_code - 아이템 코드
 * @returns {object} - 성공 or 실패 메시지 / 캐릭터 스탯 업데이트
 */
router.post('/items/equip/:characterId', authSignInToken, async (req, res, next) => {
  const { characterId } = req.params;
  const { item_code } = req.body;

  try {
    const equipItem = await prisma.$transaction(
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
        const inventoryItem = await tx.inventories.findUnique({
          where: {
            characterId,
            item_code,
          },
          include: {
            // 해당 아이템의 Items 테이블 접근 허용
            item: true,
          },
        });
        if (!inventoryItem) {
          return res
            .status(404)
            .json({ errorMessage: '인벤토리에서 해당 아이템을 찾을 수 없습니다.' });
        }

        // 아이템 정보에서 슬롯 확인
        const itemSlot = inventoryItem.item.item_slot;
        if (!itemSlot) {
          return res.status(404).json({ errorMessage: '장착할 수 없는 아이템입니다.' });
        }

        // 해당 슬롯에 이미 장착된 아이템이 있는지 확인
        const equippedItem = await tx.equipments.findUnique({
          where: {
            characterId,
            slot: itemSlot,
          },
        });

        // 해당 슬롯에 장착한 아이템이 있을 경우
        if (equippedItem) {
          // 인벤토리에 같은 아이템 존재 여부 파악
          const previousItem = await tx.inventories.findUnique({
            where: {
              characterId,
              item_code: equippedItem.item_code,
            },
          });

          // 해당 아이템이 인벤토리에 존재할 경우, 아이템 개수 증가
          if (previousItem) {
            await tx.inventories.update({
              where: {
                characterId,
                item_code: equippedItem.item_code,
              },
              data: {
                count: previousItem.count + 1,
              },
            });
          } else {
            // 해당 아이템이 인벤토리에 없을 경우, 인벤토리에 아이템 생성
            await tx.inventories.create({
              data: {
                characterId,
                item_code: equippedItem.item_code,
                count: 1,
              },
            });
          }

          // Equipments 테이블에서 장착하고 있던 아이템 제거
          await tx.equipments.delete({
            where: {
              characterId,
              slot: itemSlot,
            },
          });
        }

        // Equipments 테이블에 장착할 아이템 추가
        await tx.equipments.create({
          data: {
            characterId,
            item_code,
            slot: itemSlot,
          },
        });

        if (inventoryItem.count <= 1) {
          // 장착한 아이템이 인벤토리에 하나일 경우, 인벤토리 테이블에서 삭제
          await tx.inventories.delete({
            where: {
              characterId,
              item_code,
            },
          });
        } else {
          // 장착한 아이템이 인벤토리에 둘 이상일 경우, 인벤토리 테이블에서 개수 감소
          await tx.inventories.update({
            where: {
              characterId,
              item_code,
            },
            data: {
              count: inventoryItem.count - 1,
            },
          });
        }

        // 아이템의 스탯을 캐릭터에 반영
        const { item_stat } = inventoryItem.item;
        let updatedStats = { ...character };

        if (item_stat.health) updatedStats.health += item_stat.health;
        if (item_stat.power) updatedStats.power += item_stat.power;

        // 캐릭터 스탯 업데이트
        await tx.characters.update({
          where: {
            characterId,
          },
          data: updatedStats,
        });

        return { message: '아이템 장착 성공', stats: updatedStats };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return res.status(200).json(equipItem);
  } catch (err) {
    next(err);
  }
});

export default router;
