// routes/crypto-routes.js
const axios = require('axios');
const NodeCache = require('node-cache');

// 5분 동안 캐시 유지
const cryptoCache = new NodeCache({ stdTTL: 300 });

// CoinGecko API에 요청하는 함수
async function fetchFromCoinGecko(endpoint, params) {
  const queryString = new URLSearchParams(params).toString();
  const url = `https://api.coingecko.com/api/v3/${endpoint}${queryString ? '?' + queryString : ''}`;
  
  // 캐시 확인
  const cacheKey = url;
  const cachedResponse = cryptoCache.get(cacheKey);
  
  if (cachedResponse) {
    console.log(`캐시된 응답 제공: ${url}`);
    return cachedResponse;
  }
  
  console.log(`CoinGecko에서 데이터 가져오는 중: ${url}`);
  
  // API 요청 제한 방지를 위한 지연
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    // 응답 캐싱
    cryptoCache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('CoinGecko API 오류:', error.message);
    throw error;
  }
}

// Express 라우터에 엔드포인트 추가
module.exports = function(app) {
  // 암호화폐 차트 데이터
  app.get('/api/crypto/chart/:coinId', async (req, res) => {
    try {
      const { coinId } = req.params;
      const { currency = 'usd', days = 30, interval = 'hourly' } = req.query;
      
      const data = await fetchFromCoinGecko(`coins/${coinId}/market_chart`, {
        vs_currency: currency,
        days: days,
        interval: interval
      });
      
      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    }
  });
  
  // 암호화폐 가격 데이터
  app.get('/api/crypto/prices', async (req, res) => {
    try {
      const { ids, currency = 'usd' } = req.query;
      
      const data = await fetchFromCoinGecko('simple/price', {
        ids: ids,
        vs_currencies: currency
      });
      
      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    }
  });
  
  // 단일 코인 정보
  app.get('/api/crypto/coin/:coinId', async (req, res) => {
    try {
      const { coinId } = req.params;
      
      const data = await fetchFromCoinGecko(`coins/${coinId}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false
      });
      
      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    }
  });
  
  // 코인 목록
  app.get('/api/crypto/coins/list', async (req, res) => {
    try {
      const data = await fetchFromCoinGecko('coins/list');
      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    }
  });
  
  // 시장 데이터
  app.get('/api/crypto/markets', async (req, res) => {
    try {
      const { currency = 'usd', order = 'market_cap_desc', per_page = 100, page = 1 } = req.query;
      
      const data = await fetchFromCoinGecko('coins/markets', {
        vs_currency: currency,
        order: order,
        per_page: per_page,
        page: page
      });
      
      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    }
  });
};