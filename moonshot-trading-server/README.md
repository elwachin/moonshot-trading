# Moonshot Trading Service

A Node.js service that facilitates trading on Solana using the Moonshot SDK. This service provides endpoints for preparing and submitting trades.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Solana wallet with sufficient SOL for transactions

## Installation

1. Clone the repository:

```bash
git clone https://github.com/elwachin/moonshot-trading.git
cd moonshot-trading
```

2. Install dependencies:

```bash
npm install
```

## API Endpoints

### Prepare Transaction

Prepares a trade transaction for signing.

- **URL**: `/api/trading/prepare`
- **Method**: `POST`
- **Body**:

```json
{
  "action": "BUY" | "SELL",
  "mintAddress": "string",
  "amount": "string",
  "sender": "string"
}
```

- **Response**:

```json
{
  "transaction": {
    "serializedTransactionBase64": "string"
  }
}
```

### Submit Transaction

Submits a signed transaction to the Solana network.

- **URL**: `/api/trading/submit`
- **Method**: `POST`
- **Body**:

```json
{
  "serializedSignedTransaction": "string"
}
```

- **Response**:

```json
{
  "success": true,
  "result": "transaction-signature"
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Successful operation
- `500`: Server error with error message in response body

## Running the Service

Start the development server:

```bash
npx ts-node src/app.ts
```

Start build and run the service:

```bash
npm run build
npm run start
```

The service will be available at `http://localhost:5000`.

## Development

The project structure:

```
moonshot-trading/
├── src/
│   ├── app.ts
│   ├── config.ts
│   ├── controllers/
│   │   └── tradingController.ts
│   ├── routes/
│   │   └── tradingRoutes.ts
│   └── services/
│       └── tradingService.ts
├── package.json
└── README.md
```

## License
