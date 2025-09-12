# Deploy Backend to Render

## 1) Push to GitHub
- Commit and push the `api/` folder with `Dockerfile` to GitHub.

## 2) Create a MongoDB Atlas cluster
- Create a free cluster.
- Add a database user and password.
- Network Access: allow 0.0.0.0/0 (or your Render static IPs).
- Copy your connection string (SRV URI).

## 3) Create a Render Web Service
- Create New → Web Service → From Repository
- Root Directory: `api`
- Runtime: Docker
- Region: closest to your users
- Branch: main
- Health Check Path: `/health`

### Environment Variables
- `PORT` = 5000
- `MONGO_URI` = your Atlas connection string
- `JWT_SECRET` = a strong secret
- `JWT_EXPIRES` = 7d

### Build & Start
Render detects the Dockerfile.
- No build command is required.
- Start command is defined as `CMD ["node", "server.js"]` in Dockerfile.

## 4) Verify
- Visit `<your-render-url>/health` → `{ status: 'ok' }`
- Test the API routes.
