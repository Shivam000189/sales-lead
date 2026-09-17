# Production Deployment

## One-service deployment

Use this when the backend serves the built React app.

1. Install dependencies:

```sh
npm run install:all
```

2. Build the frontend:

```sh
npm run build
```

3. Configure environment variables on the server:

```sh
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?appName=Cluster0
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
SERVE_CLIENT=true
```

4. Start the app:

```sh
npm start
```

The app is served from `/` and the API is served from `/api`.

## Split frontend/backend deployment

Use this when deploying the frontend and backend to separate services.

Backend variables:

```sh
NODE_ENV=production
PORT=3000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-long-random-secret
CLIENT_URL=https://your-frontend-domain.com
SERVE_CLIENT=false
```

Frontend variable:

```sh
VITE_API_URL=https://your-backend-domain.com/api
```

## Health Check

Use this URL for platform health checks:

```text
/api/health
```
