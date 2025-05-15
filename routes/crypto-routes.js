// routes/crypto-routes.js
const axios = require('axios');
const NodeCache = require('node-cache');

module.exports = function(app, config) {
  const {
    coingeckoApiUrl = 'https://api.coingecko.com/api/v3',
    coingeckoApiKey = '',
    cacheTtl = 300
  } = config || {};

  const cryptoCache = new NodeCache({ stdTTL: cacheTtl });

  console.log(`암호화폐 라우트 설정: API URL=${coingeckoApiUrl}, 캐시 TTL=${cacheTtl}초`);

  async function fetchFromCoinGecko(endpoint, params) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${coingeckoApiUrl}/${endpoint}${queryString ? '?' + queryString : ''}`;

    const cacheKey = url;
    const cachedResponse = cryptoCache.get(cacheKey);
    if (cachedResponse) {
      console.log(`캐시된 응답 제공: ${url}`);
      return cachedResponse;
    }

    console.log(`CoinGecko에서 데이터 가져오는 중: ${url}`);

    await new Promise(resolve => setTimeout(resolve, 500)); // API 요청 제한 방지

    try {
      const headers = { 'Accept': 'application/json' };
      if (coingeckoApiKey) {
        headers['x-cg-api-key'] = coingeckoApiKey;
      }

      const response = await axios.get(url, { headers });
      cryptoCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('CoinGecko API 오류:', error.message);
      throw error;
    }
  }

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

  app.get('/api/crypto/prices', async (req, res) => {
    try {
      const { currency = 'usd', per_page = 10, page = 1 } = req.query;

      const data = await fetchFromCoinGecko('coins/markets', {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page,
        page,
        price_change_percentage: '24h'
      });

      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    }
  });

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
