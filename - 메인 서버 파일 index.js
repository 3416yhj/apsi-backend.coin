// index.js - 메인 서버 파일
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS 미들웨어 설정
app.use(cors());

// JSON 파싱
app.use(express.json());

// 기본 경로
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '암호화폐 API 서버가 실행 중입니다',
    endpoints: [
      '/api/crypto/chart/:coinId',
      '/api/crypto/prices',
      '/api/crypto/coin/:coinId',
      '/api/crypto/coins/list',
      '/api/crypto/markets'
    ]
  });
});

// 암호화폐 라우트 등록
require('./routes/crypto-routes')(app);

// 404 처리
app.use((req, res) => {
  res.status(404).json({ error: '요청한 페이지를 찾을 수 없습니다' });
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다' });
});

// 서버 시작
app.listen(port, () => {
  console.log(`암호화폐 API 서버가 포트 ${port}에서 시작되었습니다`);
});