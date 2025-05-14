// routes/crypto-routes.js (환경 변수 지원 추가)
const axios = require('axios');
const NodeCache = require('node-cache');

// Express 라우터에 엔드포인트 추가
module.exports = function(app, config) {
  // 설정 값 가져오기
  const {
    coingeckoApiUrl = 'https://api.coingecko.com/api/v3',
    coingeckoApiKey = '',
    cacheTtl = 300
  } = config || {};
  
  // 캐시 설정
  const cryptoCache = new NodeCache({ stdTTL: cacheTtl });
  
  console.log(`암호화폐 라우트 설정: API URL=${coingeckoApiUrl}, 캐시 TTL=${cacheTtl}초`);
  
  // CoinGecko API에 요청하는 함수
  async function fetchFromCoinGecko(endpoint, params) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${coingeckoApiUrl}/${endpoint}${queryString ? '?' + queryString : ''}`;
    
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
      const headers = {
        'Accept': 'application/json',
      };
      
      // API 키가 있다면 헤더에 추가
      if (coingeckoApiKey) {
        headers['x-cg-api-key'] = coingeckoApiKey;
      }
      
      const response = await axios.get(url, { headers });
      
      // 응답 캐싱
      cryptoCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('CoinGecko API 오류:', error.message);
      throw error;
    }
  }

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