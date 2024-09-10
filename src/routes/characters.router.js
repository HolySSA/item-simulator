import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authSignInToken from '../middlewares/auth.signin.middleware.js';

const router = express.Router();

/**
 * 캐릭터 생성 API
 * @route POST /create-character
 * @param {string} name - 캐릭터 명
 * @returns {object} - 성공 or 실패 메시지 / 캐릭터 정보
 */
router.post('/create-character', authSignInToken, async (req, res, next) => {
  const { accountId } = req.account;
  // body 로부터  title, content 전달받기
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ errorMessage: '캐릭터 명을 입력해주세요.' });
  }

  try {
    // 캐릭터 명 존재 여부
    const isExistCharacterName = await prisma.characters.findFirst({
      where: { name },
    });
    if (isExistCharacterName) {
      return res.status(400).json({ errorMessage: '이미 존재하는 캐릭터 명입니다.' });
    }

    // 보유 캐릭터 중 최근에 만든 캐릭터 불러오기
    const maxCharacterId = await prisma.characters.findFirst({
      where: { accountId },
      orderBy: { characterId: 'desc' },
      select: { characterId: true },
    });

    const maxExistCharacterId = maxCharacterId
      ? parseInt(maxCharacterId.characterId.split('-')[1])
      : 0;
    // accountId - characterId 형식으로 저장
    const newCharacterId = `${accountId}-${maxExistCharacterId + 1}`;

    // 캐릭터 생성
    const newCharacter = await prisma.characters.create({
      data: {
        accountId: +accountId,
        characterId: newCharacterId,
        name,
        // 나머지는 default 값으로 설정
      },
    });

    res.status(201).json({ data: newCharacter });
  } catch (error) {
    // 에러 처리 미들웨어
    next();
  }
});

/**
 * 보유 캐릭터 목록 조회 API
 * @route GET /characters
 * @returns {object} - 보유 캐릭터 목록
 */
router.get('/characters', authSignInToken, async (req, res, next) => {
  const { accountId } = req.account;

  try {
    const characters = await prisma.characters.findMany({
      where: {
        // 현재 사용자의 accountId로 필터링
        accountId: accountId,
      },
      select: {
        // select는 true로 표현
        accountId: true,
        characterId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ characters: characters });
  } catch (err) {
    next(err);
  }
});

/**
 * 캐릭터 상세 조회 API
 * @route GET /characters/:characterId
 * @returns {object} - (해당 계정 내 캐릭터일 경우 Money 포함) 캐릭터 정보 / 다른 계정의 캐릭터일 경우 Money 속성 제외
 */
router.get('/characters/:characterId', authSignInToken, async (req, res, next) => {
  try {
    const { characterId } = req.params;

    // 로그인 여부 확인
    const isAuthenticated = req.account && req.account.accountId;
    const accountId = isAuthenticated ? req.account.accountId : null;

    // 캐릭터 상세 정보
    const character = await prisma.characters.findFirst({
      where: {
        characterId: characterId,
      },
      select: {
        characterId: true,
        accountId: true,
        name: true,
        health: true,
        power: true,
        createdAt: true,
        updatedAt: true,
        // money 필드 조건부로 추가 (사용자의 캐릭터일 경우 money 필드 포함한 정보)
        money: isAuthenticated ? true : false,
      },
    });

    // 캐릭터가 존재하지 않을 경우 처리
    if (!character) {
      return res.status(404).json({ errorMessage: '해당 캐릭터는 존재하지 않습니다.' });
    }

    // 자신의 캐릭터가 아닐 경우
    if (!isAuthenticated || character.accountId !== accountId) {
      const { money, ...publicCharacter } = character;
      return res.status(200).json({ character: publicCharacter });
    }

    return res.status(200).json({ character: character });
  } catch (err) {
    next(err);
  }
});

/**
 * 캐릭터 상세 조회 (로그인 X) API
 * @route GET /characters/:characterId/without-auth
 * @returns {object} - 캐릭터 정보
 */
router.get('/characters/:characterId/without-auth', async (req, res, next) => {
  try {
    const { characterId } = req.params;

    // 캐릭터 상세 정보 조회
    const character = await prisma.characters.findUnique({
      where: { 
        characterId: characterId 
      },
      select: {
        characterId: true,
        accountId: true,
        name: true,
        health: true,
        power: true,
        createdAt: true,
        updatedAt: true,
        money: false,
      },
    });

    if (!character) {
      return res.status(404).json({ errorMessage: '해당 캐릭터는 존재하지 않습니다.' });
    }

    return res.status(200).json({ character: character });
  } catch (err) {
    next(err);
  }
});

/** 캐릭터 삭제 API **/
router.delete('/characters/:characterId', authSignInToken, async (req, res, next) => {
  ///////////////////////////////////////////////////
  ///// characters/accountId-charater넘버       /////
  ///// 예시) localhost:3020/api/characters/5-3 /////
  //////////////////////////////////////////////////
  
  try {
    // 로그인한 사용자 정보와 요청된 캐릭터 ID를 가져옴
    const { accountId } = req.account;
    const { characterId } = req.params;

    const character = await prisma.characters.findUnique({
      where: {
        characterId: characterId,
      },
    });

    // 캐릭터가 존재하지 않을 경우
    if (!character) {
      return res.status(404).json({ message: '해당 캐릭터는 존재하지 않습니다.' });
    }

    // 캐릭터 accountId와 요청한 사용자의 accountId 체크
    if (character.accountId !== accountId) {
      return res.status(403).json({ message: '해당 캐릭터를 삭제할 권리가 없습니다.' });
    }

    // 캐릭터 삭제
    await prisma.characters.delete({
      where: {
        characterId: characterId,
      },
    });

    return res.status(204).json({ message: '캐릭터가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

export default router;
