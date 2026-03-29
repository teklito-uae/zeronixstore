# Zeronix UAE — Full Deployment Guide (Hostinger Git)

This document provides a comprehensive step-by-step guide to deploying the Zeronix UAE (React + Laravel) project to Hostinger Shared Hosting.

---

## 1. Local Preparation
Before pushing to GitHub, ensure your local environment is ready:

1.  **Frontend Build**:
    ```bash
    cd frontend
    npm run build
    ```
    *(Note: Your `.gitignore` is set to include the `dist` folder, so the build will be pushed to GitHub.)*

2.  **Push Changes**:
    ```bash
    git add .
    git commit -m "fix: migration order and backend routing"
    git push origin main
    ```

---

## 2. Hostinger hPanel Configuration

### A. Git Deployment
1.  Go to **Advanced > Git** in hPanel.
2.  Link your repository: `https://github.com/teklito-uae/zeronixstore`.
3.  **Deployment Path**: `/public_html/source`.
4.  Click **Create** and then **Deploy**.

### B. Database Setup
1.  Go to **Databases > Management**.
2.  Create a MySQL Database (e.g., `zeronix_db`).
3.  Note the **DB Name**, **DB User**, and **Password**.

---

## 3. Server Configuration

### A. Backend .env
In the **File Manager**, navigate to `public_html/source/backend/` and create a `.env` file:

```env
APP_NAME="Zeronix Store"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://zeronix.store/api

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### B. SSH/Terminal Commands
In the Hostinger **Browser Terminal** or **SSH**, run these commands:

```bash
# 1. Navigate to the backend
cd ~/public_html/source/backend

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Migrate database
php artisan migrate --force

# 4. Fix Permissions (Crucial for Images)
chmod -R 775 storage bootstrap/cache
chmod -R 775 public/storage
```

---

## 4. Global Routing (.htaccess)
Create/Edit the `.htaccess` file in the root of `public_html` (NOT inside `source`):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # 1. Route API requests to the Laravel public folder
    RewriteRule ^api/(.*)$ source/backend/public/index.php [L,QSA]

    # 2. Route all other requests to the React dist folder (Frontend)
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteCond %{REQUEST_URI} !^/source/
    RewriteRule ^(.*)$ source/frontend/dist/$1 [L]

    # 3. Security: Deny direct access to source code and .env
    RedirectMatch 404 /\.git
    RedirectMatch 404 /source/backend/.env
</IfModule>
```

---

## 5. Verification Checklist
- [ ] `https://zeronix.store` loads the React frontend.
- [ ] `https://zeronix.store/api/up` (if health check exists) or a login POST responds with JSON.
- [ ] Product images load (verifies `storage:link`).
