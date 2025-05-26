# RAYNET Event Logging System

A Node.js application for logging and monitoring radio communications during emergency events and public service deployments.

## Features

- Real-time log entry and monitoring
- Support for multiple talkgroups and channels
- Message categorization and tagging
- Dark mode interface
- Offline support with sync capability
- Export functionality (CSV, JSON, PDF)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/raynet-logger
   JWT_SECRET=your-secret-key
   CLIENT_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
raynet-logger/
├── src/
│   ├── server/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── index.js
│   └── client/
├── package.json
└── README.md
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/logs` - Create new log entry
- `GET /api/logs` - Get all logs
- `GET /api/logs/:id` - Get specific log
- `PUT /api/logs/:id` - Update log entry
- `DELETE /api/logs/:id` - Delete log entry

## Development

- Backend: `npm run dev`
- Frontend: `npm run client`
- Full stack: `npm run dev:full`

## License

MIT 