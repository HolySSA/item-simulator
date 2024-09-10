import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import AccountsRouter from './routes/accounts.router.js';
import CharactersRouter from './routes/characters.router.js';
import ItemsRouter from './routes/items.router.js';
import InventoriesRouter from './routes/inventories.router.js';
import EquipmentsRouter from './routes/equipments.router.js';
import MoneyRouter from './routes/money.router.js'
import LogMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();

const app = express();
const PORT = 3020;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/api', [AccountsRouter, CharactersRouter, ItemsRouter, InventoriesRouter, EquipmentsRouter, MoneyRouter]);
app.use(ErrorHandlingMiddleware); // 에러 처리 미들웨어는 항상 마지막에

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸습니다!');
});
