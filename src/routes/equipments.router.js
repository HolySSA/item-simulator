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

        // 캐릭터ID로 로그인한 계정 내 해당 캐릭터 검증 - 같은 부위 아이템 장착 시 스탯 변경이 필요하므로 let으로 선언
        let character = await tx.characters.findFirst({
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
            // 해당 아이템의 Items 테이블 접근 허용
            item: true,
          },
        });
        if (!inventoryItem) {
          return res.status(404).json({ errorMessage: '인벤토리에서 해당 아이템을 찾을 수 없습니다.' });
        }

        // 아이템 정보에서 슬롯 확인
        const itemSlot = inventoryItem.item.item_slot;
        if (!itemSlot) {
          return res.status(404).json({ errorMessage: '장착할 수 없는 아이템입니다.' });
        }

        // 해당 슬롯에 이미 장착된 아이템이 있는지 확인
        const equippedItem = await tx.equipments.findFirst({
          where: {
            characterId,
            slot: itemSlot,
          },
        });

        // 장착할 아이템과 장착 중인 아이템이 동일한 경우
        if (equippedItem && equippedItem.item_code === item_code) {
          return res.status(400).json({ errorMessage: '해당 아이템은 이미 장착 중입니다.' });
        }

        // 해당 슬롯에 장착한 아이템이 있을 경우
        if (equippedItem) {
          // 인벤토리에 같은 아이템 존재 여부 파악
          const previousItem = await tx.inventories.findFirst({
            where: {
              characterId,
              item_code: equippedItem.item_code,
            },
          });

          // 해당 아이템이 인벤토리에 존재할 경우, 아이템 개수 증가
          if (previousItem) {
            await tx.inventories.update({
              where: {
                inventoryId: previousItem.inventoryId,
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

          // 기존 장착 아이템 스탯만큼 캐릭터 스탯 감소
          const previousItemStats = await tx.items.findFirst({
            where: {
              item_code: equippedItem.item_code,
            },
          });

          if (previousItemStats) {
            let updatedStats = { ...character };

            if (previousItemStats.item_stat.health)
              updatedStats.health -= previousItemStats.item_stat.health;
            if (previousItemStats.item_stat.power)
              updatedStats.power -= previousItemStats.item_stat.power;

            // 캐릭터 스탯 업데이트
            character = await tx.characters.update({
              where: {
                characterId,
              },
              data: updatedStats,
            });
          }

          // Equipments 테이블에서 장착하고 있던 아이템 제거
          await tx.equipments.delete({
            where: {
              equipmentId: equippedItem.equipmentId,
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
              inventoryId: inventoryItem.inventoryId,
            },
          });
        } else {
          // 장착한 아이템이 인벤토리에 둘 이상일 경우, 인벤토리 테이블에서 개수 감소
          await tx.inventories.update({
            where: {
              inventoryId: inventoryItem.inventoryId,
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

        const filteredStats = {
          name: updatedStats.name,
          health: updatedStats.health,
          power: updatedStats.power,
        };

        return { message: '아이템 장착 성공', stats: filteredStats };
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

/**
 * 아이템 탈착 API
 * @route POST /items/unequip/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @param {number} item_code - 아이템 코드
 * @returns {object} - 성공 or 실패 메시지 / 캐릭터 스탯 업데이트
 */
router.post('/items/unequip/:characterId', authSignInToken, async (req, res, next) => {
  const { characterId } = req.params;
  const { slot } = req.body;

  let validateSlots = ["weapon", "clothTop", "clothBottom", "shoes", "accessories"];
  if(!validateSlots.includes(slot)) {
    return res.status(404).json({ errorMessage: '해당 슬롯은 존재하지 않습니다.' });
  }

  try {
    const { stats } = await prisma.$transaction(
      async (tx) => {
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

        // 해당 슬롯에 장착된 아이템 확인
        const equippedItem = await tx.equipments.findFirst({
          where: {
            characterId,
            slot,
          },
          include: {
            // Items 테이블 접근 허용
            item: true,
          },
        });
        if (!equippedItem) {
          return res.status(404).json({ errorMessage: '해당 슬롯에 장착 중인 아이템이 없습니다.' });
        }

        // 장착 중인 아이템 스탯 캐릭터에서 제거
        const itemStats = equippedItem.item.item_stat;
        let updatedStats = { ...character };

        if (itemStats.health) updatedStats.health -= itemStats.health;
        if (itemStats.power) updatedStats.power -= itemStats.power;

        await tx.characters.update({
          where: {
            characterId,
          },
          data: updatedStats,
        });

        // Equipments 테이블에서 장착된 아이템 제거
        await tx.equipments.delete({
          where: {
            equipmentId: equippedItem.equipmentId,
          },
        });

        // 인벤토리 탈착한 아이템 추가
        const inventoryItem = await tx.inventories.findFirst({
          where: {
            characterId,
            item_code: equippedItem.item_code,
          },
        });

        if (inventoryItem) {
          // 인벤토리에 해당 아이템이 있을 경우, 수량 증가
          await tx.inventories.update({
            where: {
              inventoryId: inventoryItem.inventoryId,
            },
            data: {
              count: inventoryItem.count + 1,
            },
          });
        } else {
          // 해당 아이템이 없을 경우, 인벤토리에 아이템 추가
          await tx.inventories.create({
            data: {
              characterId,
              item_code: equippedItem.item_code,
              count: 1,
            },
          });
        }

        const filteredStats = {
          name: updatedStats.name,
          health: updatedStats.health,
          power: updatedStats.power,
        };

        return { message: '아이템 탈착 성공.', stats: filteredStats };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return res.status(200).json({ stats });
  } catch (err) {
    next(err);
  }
});

/**
 * 장착 아이템 목록 조회 API
 * @route GET /equipments/:characterId
 * @param {string} characterId - 캐릭터 ID (경로 매개변수)
 * @returns {object} - 성공 or 실패 메시지 / 캐릭터 스탯 업데이트
 */
router.get('/equipments/:characterId', async (req, res, next) => {
  const { characterId } = req.params;

  try {
    // 장착 아이템 목록 조회
    const equipments = await prisma.equipments.findMany({
      where: { characterId },
      orderBy: {
        slot: 'asc',
      },
      include: {
        item: true, // 아이템 테이블과 조인하여 아이템 정보 포함
      },
    });

    // response 데이터 형식
    const responseItems = equipments.map((equipmentItem) => ({
      item_code: equipmentItem.item.item_code,
      item_name: equipmentItem.item.item_name,
      item_slot: equipmentItem.item.item_slot,
    }));

    return res
      .status(200)
      .json({ message: '장착 중인 아이템 목록 조회 성공!', items: responseItems });
  } catch (err) {
    // 오류 처리 미들웨어
    next(err);
  }
});

export default router;
