# Deployment Guide

## 🚀 Production Deployment

### Backend Deployment Options

#### Option 1: Railway
1. Sign up at [Railway](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add environment variables
5. Deploy automatically

#### Option 2: Render (Recommended for Monorepo)
1. Sign up at [Render](https://render.com)
2. Create new Web Service
3. Connect repository
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `GEMINI_API_KEY`: Your Google AI key
   - `VITE_API_URL`: Set this to your own Render URL (e.g., `https://ai-course-builder-ycts.onrender.com/api`)

#### Option 3: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables
5. Deploy: `git push heroku main`

#### Option 4: DigitalOcean App Platform
1. Create account at [DigitalOcean](https://www.digitalocean.com)
2. Create App
3. Connect repository
4. Configure environment variables
5. Deploy

### Frontend Deployment Options

#### Option 1: Vercel (Recommended)
1. Sign up at [Vercel](https://vercel.com)
2. Import project
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com`
6. Deploy

#### Option 2: Netlify
1. Sign up at [Netlify](https://netlify.com)
2. Connect repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables
6. Deploy

#### Option 3: GitHub Pages
1. Update `vite.config.js`:
```javascript
export default {
  base: '/your-repo-name/',
  // ...
}
```
2. Build: `npm run build`
3. Deploy to GitHub Pages

### Environment Variables for Production

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=strong-random-secret-key-here
JWT_EXPIRE=7d
OTP_EXPIRE_MINUTES=10
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

#### Frontend (Vercel/Netlify Environment Variables)
```
VITE_API_URL=https://your-backend-url.com
```

### Database Setup

#### MongoDB Atlas (Recommended)
1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string
5. Update `MONGODB_URI` in backend `.env`

### File Storage Options

#### Option 1: Local Storage (Development)
- Files stored in `backend/uploads/`
- Not recommended for production

#### Option 2: AWS S3 (Recommended)
1. Create S3 bucket
2. Install AWS SDK: `npm install aws-sdk`
3. Update upload middleware to use S3
4. Configure bucket permissions

#### Option 3: Cloudinary
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Install: `npm install cloudinary`
3. Configure upload to Cloudinary
4. Store URLs in database

### SSL/HTTPS Setup

- Use platform-provided SSL (Vercel, Netlify, Railway)
- Or configure custom domain with SSL certificate
- Update CORS settings to allow HTTPS only

### Domain Configuration

1. Purchase domain
2. Configure DNS:
   - Backend: `api.yourdomain.com`
   - Frontend: `yourdomain.com`
3. Update CORS in backend:
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

### Monitoring & Logging

#### Option 1: Built-in Logging
- Console logs for errors
- Add Winston or similar for production

#### Option 2: Sentry
1. Sign up at [Sentry](https://sentry.io)
2. Install: `npm install @sentry/node`
3. Configure error tracking

#### Option 3: LogRocket
1. Sign up at [LogRocket](https://logrocket.com)
2. Install SDK
3. Track user sessions

### Backup Strategy

1. **Database Backups**
   - MongoDB Atlas automatic backups
   - Or manual backups using `mongodump`

2. **File Backups**
   - Use S3 versioning
   - Or regular file system backups

3. **Code Backups**
   - Git repository (GitHub/GitLab)
   - Regular commits

### Performance Optimization

1. **Enable Caching**
   - Redis for session storage
   - CDN for static files

2. **Database Indexing**
   - Already implemented in models
   - Monitor slow queries

3. **Image Optimization**
   - Compress uploaded files
   - Use CDN for delivery

4. **Code Optimization**
   - Minify frontend code
   - Enable gzip compression

### Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS only
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Sanitize file uploads
- [ ] Use environment variables (never commit secrets)
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Set up firewall rules
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication

### Post-Deployment

1. Test all features
2. Monitor error logs
3. Check performance metrics
4. Set up alerts
5. Configure backups
6. Update documentation with production URLs

### Rollback Plan

1. Keep previous deployment version
2. Database migration scripts
3. File backup before updates
4. Version control for code

---

**Ready for Production! 🎉**

