# Deployment Guide for Minister's Grievance System

## Quick Deployment Options

### Option 1: Vercel (Recommended - Free)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/grievance-system.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`: Use Vercel Postgres or external DB
     - `NEXTAUTH_URL`: Your Vercel app URL
     - `NEXTAUTH_SECRET`: Generate random string
   - Deploy!

### Option 2: Railway (Alternative - Free tier)

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

### Option 3: Netlify (Static deployment)

1. Build the app: `npm run build && npm run export`
2. Upload `out` folder to [netlify.com](https://netlify.com)

## Environment Variables for Production

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-app-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
```

## Minister's Image Setup

To add Shri D. Sridhar Babu's image:

1. **Google Drive Method:**
   - Upload image to Google Drive
   - Make it public
   - Get shareable link
   - Convert to direct link format:
     `https://drive.google.com/uc?id=FILE_ID`

2. **Update the code:**
   Replace `/placeholder-minister.jpg` in `app/page.tsx` with your image URL

## Demo URLs After Deployment

- **Main Landing:** `https://your-app.vercel.app`
- **Demo Login:** `https://your-app.vercel.app/demo-login`
- **Minister Dashboard:** `https://your-app.vercel.app/minister/dashboard`

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET

# Redeploy with env vars
vercel --prod
```

## Expected Timeline
- GitHub setup: 5 minutes
- Vercel deployment: 10 minutes
- Database setup: 15 minutes
- **Total: ~30 minutes**

Your app will be live at: `https://your-project-name.vercel.app`