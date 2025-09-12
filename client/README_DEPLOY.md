# Deploy Frontend to Vercel

## 1) Push to GitHub
Commit and push `client/`.

## 2) Create Vercel Project
- New Project → Import from Git
- Root Directory: `client`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## 3) Environment Variables
- `VITE_API_URL` = your Render API base URL, e.g. `https://your-api.onrender.com/api`

## 4) Deploy
- Click Deploy. Vercel will build and host your SPA.

## 5) Routing
`vercel.json` configured to route all paths to `index.html`.
