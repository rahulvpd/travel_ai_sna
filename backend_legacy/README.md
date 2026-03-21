# Tamil Nadu Tourism Backend

Backend API for Tamil Nadu Tourism application built with Node.js, Express, and Neo4j graph database.

## Features
- 🔐 JWT Authentication
- 📝 Itinerary Management (CRUD)
- 🗺️ Neo4j Graph Database
- 🚀 RESTful API

## Setup

### Prerequisites
- Node.js 18+
- Neo4j Database (running locally or cloud)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=5000
```

3. Start Neo4j database

4. Run the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Itineraries
- `POST /api/itineraries` - Create itinerary (requires auth)
- `GET /api/itineraries` - Get user's itineraries (requires auth)
- `GET /api/itineraries/:id` - Get specific itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary (requires auth)

### Health Check
- `GET /health` - Check API status

## Neo4j Schema

### Nodes
- `User` {id, name, email, passwordHash, createdAt}
- `Itinerary` {id, userId, destination, duration, budget, travelers, days, createdAt, isPublic, likes}

## Example Usage

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

### Create Itinerary
```bash
curl -X POST http://localhost:5000/api/itineraries \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination":"Ooty","duration":3,"budget":"Standard","travelers":2,"days":[...]}'
```

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Neo4j
- **Auth**: JWT + bcrypt
- **CORS**: Enabled for frontend integration
