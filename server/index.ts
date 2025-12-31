import express from 'express';
import { handleGenerate } from './api/generate';

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IP 추출을 위한 설정
app.set('trust proxy', true);

// CORS 설정 (개발 환경)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API 엔드포인트
app.post('/api/generate', handleGenerate);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`AI 제공자: ${process.env.AI_API_PROVIDER || 'openai'}`);
});

