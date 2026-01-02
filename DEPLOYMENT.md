# Deployment Guide for Invitation Web App

This guide explains how to deploy the Invitation Web App with:

- **Frontend (Angular)** → Netlify
- **Backend (Express/Node.js)** → Render (or Railway/Fly.io)

---

## Prerequisites

1. A [Netlify](https://netlify.com) account
2. A [Render](https://render.com) account (free tier available)
3. A [MongoDB Atlas](https://mongodb.com/cloud/atlas) database (free tier available)
4. Git repository with your code pushed

---

## Part 1: Deploy the Backend (Render)

### Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (`0.0.0.0/0`) for cloud access
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/invitation-app`

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub/GitLab repository
4. Configure the service:

   | Setting | Value |
   | **Name** | `invitation-webapp-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

5. Add **Environment Variables**:

   | Variable | Value |
   | `MONGODB_URI` | `mongodb+srv://...` (your Atlas connection string) |
   | `JWT_SECRET` | `your-super-secret-key-change-this` |
   | `PORT` | `10000` |
   | `NODE_ENV` | `production` |

6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. Copy your service URL: `https://invitation-webapp-api.onrender.com`

### Alternative: Railway

1. Go to [Railway](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select the repository
4. Set the **root directory** to `backend`
5. Add the same environment variables as above
6. Deploy and get your URL

---

## Part 2: Deploy the Frontend (Netlify)

### Step 1: Update the Production API URL

Before deploying, update the API URL in your frontend:

**File:** `frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://invitation-webapp-api.onrender.com/api'  // Your backend URL
};
```

Commit and push this change.

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub/GitLab repository
4. Configure build settings:

   | Setting | Value |
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `frontend/dist/invitation-webapp/browser` |

5. Click **"Deploy site"**

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend folder
cd frontend

# Build the app
npm run build

# Deploy (first time - creates new site)
netlify deploy --prod --dir=dist/invitation-webapp/browser
```

### Step 3: Verify Deployment

1. Open your Netlify URL
2. Test the login functionality
3. Create an invitation
4. Test the public invitation link

---

## Environment Variables Summary

### Backend (Render/Railway)

| Variable | Description | Example |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `my-super-secret-key-123` |
| `PORT` | Server port | `10000` |
| `NODE_ENV` | Environment | `production` |

### Frontend (Netlify)

The frontend uses build-time configuration in `environment.prod.ts`. No runtime environment variables needed.

---

## Troubleshooting

### CORS Errors

If you get CORS errors, update `backend/src/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-app.netlify.app',
    'http://localhost:4200'
  ],
  credentials: true
}));
```

### MongoDB Connection Issues

- Ensure your IP whitelist includes `0.0.0.0/0`
- Check the connection string format
- Verify username/password

### Build Failures

- Check the build logs in Netlify/Render dashboard
- Ensure all dependencies are in `package.json`
- Try building locally first: `npm run build`

### Cold Starts (Render Free Tier)

Render free tier spins down after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Custom Domain Setup

### Netlify (Frontend)

1. Go to **Site settings** → **Domain management**
2. Add your custom domain
3. Configure DNS with your provider

### Render (Backend)

1. Go to **Settings** → **Custom Domains**
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Configure DNS

---

## Cost Estimates (Free Tiers)

| Service | Free Tier Limits |
| **Netlify** | 100GB bandwidth/month, 300 build minutes |
| **Render** | 750 hours/month (spins down after 15min inactivity) |
| **MongoDB Atlas** | 512MB storage |

For production with more traffic, consider paid plans (~$7-15/month each).
