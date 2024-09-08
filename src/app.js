import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import AccountsRouter from './routes/accounts.router.js';
import CharactersRouter from './routes/characters.router.js'
import ItemsRouter from './routes/items.router.js'
import LogMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';

// .env 파일을 읽어서 process.env에 추가
dotenv.config();

const app = express();
const PORT = 3020;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/api', [AccountsRouter, CharactersRouter, ItemsRouter]);
app.use(ErrorHandlingMiddleware); // 에러 처리 미들웨어는 항상 마지막에

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸습니다!');
});
