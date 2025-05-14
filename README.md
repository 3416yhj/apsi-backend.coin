# Cryptocurrency API Server

간단하고 효율적인 암호화폐 정보 API 서버입니다. 이 서버는 CoinGecko API를 활용하여 암호화폐의 시세, 정보 및 통계 데이터를 제공합니다.

## 기능

- 실시간 암호화폐 시세 정보 제공
- 다양한 암호화폐에 대한 상세 정보 제공
- 효율적인 캐싱 시스템으로 API 요청 최적화
- CORS 지원으로 다양한 클라이언트 애플리케이션 연동 가능
- 상세한 로깅 시스템

## 시작하기

### 필수 조건

- Node.js (v14 이상)
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone https://github.com/yourusername/crypto-api-server.git
cd crypto-api-server
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 설정 변경
```

4. 서버 실행
```bash
npm start
# 또는
yarn start
```

## 환경 변수

자세한 환경 변수 설정은 [ENV_DOCS.md](./ENV_DOCS.md) 파일을 참조하세요.

## API 엔드포인트

### 암호화폐 목록 조회

암호화폐 목록을 페이지네이션과 함께 조회합니다.

```
GET /api/crypto/coins
```

#### 쿼리 파라미터

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| page | number | 페이지 번호 | 1 |
| per_page | number | 페이지당 항목 수 | 50 |

#### 응답 예시

```json
{
  "status": "success",
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "current_price": 50000,
      "market_cap": 950000000000,
      "market_cap_rank": 1,
      "price_change_percentage_24h": 2.5
    },
    // ... 더 많은 코인
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 20,
    "total_items": 1000,
    "per_page": 50
  }
}
```

### 특정 암호화폐 상세 정보 조회

코인 ID를 사용하여 특정 암호화폐의 상세 정보를 조회합니다.

```
GET /api/crypto/coins/:id
```

#### URL 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | string | 암호화폐 ID (예: bitcoin, ethereum) |

#### 응답 예시

```json
{
  "status": "success",
  "data": {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "description": {
      "en": "Bitcoin is the first successful internet money..."
    },
    "image": {
      "thumb": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
      "small": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      "large": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    },
    "market_data": {
      "current_price": {
        "usd": 50000,
        "eur": 45000,
        "krw": 56000000
      },
      "market_cap": {
        "usd": 950000000000
      },
      "total_volume": {
        "usd": 30000000000
      },
      "price_change_percentage_24h": 2.5,
      "price_change_percentage_7d": 5.8,
      "price_change_percentage_30d": -3.2
    },
    "last_updated": "2023-05-15T12:30:45Z"
  }
}
```

### 암호화폐 시세 차트 데이터 조회

특정 기간 동안의 암호화폐 시세 차트 데이터를 조회합니다.

```
GET /api/crypto/coins/:id/market_chart
```

#### URL 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | string | 암호화폐 ID (예: bitcoin, ethereum) |

#### 쿼리 파라미터

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| days | number | 데이터를 조회할 일 수 | 7 |
| vs_currency | string | 기준 통화 | usd |

#### 응답 예시

```json
{
  "status": "success",
  "data": {
    "prices": [
      [1652616000000, 48000],
      [1652702400000, 49500],
      [1652788800000, 50200],
      // ... 더 많은 데이터 포인트
    ],
    "market_caps": [
      [1652616000000, 910000000000],
      [1652702400000, 930000000000],
      [1652788800000, 950000000000],
      // ... 더 많은 데이터 포인트
    ],
    "total_volumes": [
      [1652616000000, 28000000000],
      [1652702400000, 29500000000],
      [1652788800000, 30000000000],
      // ... 더 많은 데이터 포인트
    ]
  }
}
```

### 글로벌 암호화폐 시장 데이터 조회

전체 암호화폐 시장에 대한 글로벌 데이터를 조회합니다.

```
GET /api/crypto/global
```

#### 응답 예시

```json
{
  "status": "success",
  "data": {
    "active_cryptocurrencies": 10000,
    "markets": 650,
    "total_market_cap": {
      "usd": 2500000000000,
      "eur": 2300000000000,
      "krw": 2800000000000000
    },
    "total_volume": {
      "usd": 150000000000,
      "eur": 135000000000,
      "krw": 168000000000000
    },
    "market_cap_percentage": {
      "bitcoin": 42.5,
      "ethereum": 18.3,
      "ripple": 2.5
    },
    "market_cap_change_percentage_24h_usd": 3.2,
    "updated_at": 1652788800000
  }
}
```

### 시세 트렌딩 코인 조회

현재 트렌딩 중인 인기 암호화폐를 조회합니다.

```
GET /api/crypto/trending
```

#### 응답 예시

```json
{
  "status": "success",
  "data": {
    "coins": [
      {
        "id": "bitcoin",
        "name": "Bitcoin",
        "symbol": "BTC",
        "market_cap_rank": 1,
        "thumb": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
        "small": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        "score": 0
      },
      // ... 더 많은 트렌딩 코인
    ]
  }
}
```

## 오류 처리

API는 다음과 같은 형식으로 오류를 반환합니다:

```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "요청한 리소스를 찾을 수 없습니다.",
    "details": "존재하지 않는 코인 ID: invalid_coin_id"
  }
}
```

### 일반적인 오류 코드

| 코드 | 설명 |
|------|------|
| BAD_REQUEST | 잘못된 요청 파라미터 |
| NOT_FOUND | 요청한 리소스를 찾을 수 없음 |
| RATE_LIMIT | API 요청 한도 초과 |
| EXTERNAL_API_ERROR | 외부 API(CoinGecko)에서 오류 발생 |
| INTERNAL_SERVER_ERROR | 서버 내부 오류 |

## 캐싱

서버는 API 요청의 성능을 최적화하기 위해 응답 데이터를 캐싱합니다. 캐시 TTL(Time To Live)은 `.env` 파일의 `CACHE_TTL` 변수로 설정할 수 있습니다.

## 기여하기

1. 저장소를 포크합니다.
2. 새 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing-feature`).
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

## 라이센스

MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 연락처

프로젝트 관리자 - [your.email@example.com](mailto:your.email@example.com)

프로젝트 링크: [https://github.com/yourusername/crypto-api-server](https://github.com/yourusername/crypto-api-server)