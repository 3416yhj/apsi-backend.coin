const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
const corsOrigin = process.env.CORS_ORIGIN || '*';

const logLevel = process.env.LOG_LEVEL || 'info';
console.log(`서버 시작 중... 환경: ${nodeEnv}, 로그 레벨: ${logLevel}`);

const corsOptions = {
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

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

const configOptions = {
  coingeckoApiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  coingeckoApiKey: process.env.COINGECKO_API_KEY || '',
  cacheTtl: parseInt(process.env.CACHE_TTL || '300')
};

require('./routes/crypto-routes')(app, configOptions);

app.use((req, res) => {
  res.status(404).json({ error: '요청한 페이지를 찾을 수 없습니다' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다' });
});

app.listen(port, () => {
  console.log(`암호화폐 API 서버가 포트 ${port}에서 시작되었습니다`);
  console.log(`서버 환경: ${nodeEnv}`);
  console.log(`CORS 설정: ${corsOrigin === '*' ? '모든 출처 허용' : corsOrigin}`);
});
