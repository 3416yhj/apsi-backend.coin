// index.js - 메인 서버 파일 (환경 변수 지원 추가)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
const corsOrigin = process.env.CORS_ORIGIN || '*';

// 로깅 설정
const logLevel = process.env.LOG_LEVEL || 'info';
console.log(`서버 시작 중... 환경: ${nodeEnv}, 로그 레벨: ${logLevel}`);

// CORS 미들웨어 설정
const corsOptions = {
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// JSON 파싱
app.use(express.json());

// 서버 상태 정보 엔드포인트
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    environment: nodeEnv,
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

// 환경 변수를 crypto-routes 모듈에 전달
const configOptions = {
  coingeckoApiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  coingeckoApiKey: process.env.COINGECKO_API_KEY || '',
  cacheTtl: parseInt(process.env.CACHE_TTL || '300')
};

// 암호화폐 라우트 등록
require('./routes/crypto-routes')(app, configOptions);

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
  console.log(`서버 환경: ${nodeEnv}`);
  console.log(`CORS 설정: ${corsOrigin === '*' ? '모든 출처 허용' : corsOrigin}`);
});