@echo off
echo ========================================
echo   Minister's Grievance System Deployment
echo ========================================
echo.

echo Step 1: Installing Vercel CLI...
npm install -g vercel

echo.
echo Step 2: Building the application...
npm run build

echo.
echo Step 3: Starting deployment...
echo Please follow the prompts to deploy to Vercel
echo.
vercel

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app should now be live at the URL shown above.
echo.
echo Next steps:
echo 1. Set up environment variables in Vercel dashboard
echo 2. Add minister's image URL
echo 3. Test the demo login functionality
echo.
pause