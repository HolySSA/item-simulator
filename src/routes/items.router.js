import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 아이템 생성 API **/
router.post('/items', async (req, res, next) => {
  try {
    const { item_code, item_name, item_stat, item_price } = req.body;

    if (!item_code || !item_name || !item_stat || !item_price) {
      return res.status(400).json({ errorMessage: '아이템 정보를 알맞게 기입해주세요.' });
    }

    // 동일한 item_code 가진 아이템 유무 체크
    const isExistItemCode = await prisma.items.findFirst({
      where: { item_code },
    });
    if (isExistItemCode) {
      return res.status(409).json({ errorMessage: '이미 존재하는 아이템 코드입니다.' });
    }

    // 동일한 item_name 가진 아이템 유무 체크
    const isExistItemName = await prisma.items.findFirst({
      where: { item_name },
    });
    if (isExistItemName) {
      return res.status(409).json({ errorMessage: '이미 존재하는 아이템 명입니다.' });
    }

    const newItem = await prisma.items.create({
      data: {
        item_code,
        item_name,
        item_stat,
        item_price,
      },
    });

    return res.status(201).json({ message: '아이템 생성에 성공하였습니다.', data: newItem });
  } catch (err) {
    next(err);
  }
});

/** 아이템 수정 API **/
router.put('/items/:item_code', async (req, res, next) => {
  try {
    const { item_code } = req.params;
    const { item_name, item_stat } = req.body;

    if (!item_name && !item_stat) {
      return res.status(400).json({ errorMessage: '수정할 필드를 하나 이상 기입해주세요.' });
    }

    // 업데이트할 데이터 명시
    const updatedItem = await prisma.items.update({
      where: {
        item_code: +item_code,
      },
      data: {
        item_name,
        item_stat,
      },
    });

    return res.status(200).json({ message: '아이템 수정에 성공하였습니다.', data: updatedItem });
  } catch (err) {
    next(err);
  }
});

/** 아이템 목록 조회 API **/
router.get('/items', async (req, res, next) => {
  try {
    const items = await prisma.items.findMany({
      select: {
        // 코드, 이름, 가격만 조회
        item_code: true,
        item_name: true,
        item_price: true,
      },
      orderBy: {
        // 아이템 코드로 정렬
        item_code: 'asc',
      },
    });

    return res.status(200).json({ data: items });
  } catch (err) {
    next(err);
  }
});

/** 아이템 상세 조회 API **/
router.get('/items/:item_code', async (req, res, next) => {
  try {
    const { item_code } = req.params;

    const item = await prisma.items.findUnique({
      where: {
        item_code: +item_code,
      },
      select: {
        item_code: true,
        item_name: true,
        item_stat: true,
        item_price: true,
      },
    });

    if (!item) {
      return res.status(404).json({ errorMessage: '해당 아이템은 존재하지 않습니다.' });
    }

    return res.status(200).json({ data: item });
  } catch (err) {
    next(err);
  }
});

export default router;
