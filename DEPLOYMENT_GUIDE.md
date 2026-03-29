# Zeronix UAE — Full Deployment Guide (Hostinger Git)

This document provides a comprehensive step-by-step guide to deploying the Zeronix UAE (React + Laravel) project to Hostinger Shared Hosting.

---

## 1. Local Development
To run the project locally, open two separate terminals:

- **Terminal 1 (Frontend)**: 
    ```bash
    cd frontend
    npm run dev
    ```
- **Terminal 2 (Backend)**: 
    ```bash
    cd backend
    php artisan serve --host=0.0.0.0
    ```

*(Note: The system automatically detects your local IP, so APIs will work on any device in your network without manual editing.)*

---

## 2. Production Preparation
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
ALLOWED_ORIGINS=https://zeronix.store

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### B. SSH/Terminal Commands (Migration & Updates)
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

    # 1. Route direct storage access to the backend storage folder
    RewriteRule ^storage/(.*)$ source/backend/public/storage/$1 [L]

    # 2. Route API and Health checks to the Laravel public folder
    RewriteRule ^(api|up)(/.*)?$ source/backend/public/index.php [L,QSA]

    # 3. Route all other requests to the React dist folder (Frontend)
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteCond %{REQUEST_URI} !^/up/
    RewriteCond %{REQUEST_URI} !^/storage/
    RewriteCond %{REQUEST_URI} !^/source/
    RewriteRule ^(.*)$ source/frontend/dist/$1 [L]

    # 3. Security: Deny direct access to source code and .env
    RedirectMatch 404 /\.git
    RedirectMatch 404 /source/backend/.env
</IfModule>
```

---

## 5. Verification Checklist
- [x] `https://zeronix.store` loads the React frontend.
- [x] `https://zeronix.store/up` responds with JSON "OK".
- [x] Product images load (verifies storage routing).

---

## 6. Ongoing Updates (Future Workflow)

Once the initial setup is done, follow this simple process for new updates:

### A. Frontend Changes
1.  Modify your code.
2.  **Run `npm run build`** in the `frontend` folder.
3.  Commit and push to GitHub.
4.  Deployment is automatic if you have "Auto-deploy" on, otherwise click **Deploy** in hPanel.

### B. Backend Changes
1.  Modify your code.
2.  Commit and push to GitHub.
3.  **If you added migrations**: Log in to Hostinger Terminal and run:
    ```bash
    cd ~/public_html/source/backend
    php artisan migrate --force
    ```
4.  **If you added dependencies**:
    ```bash
    composer install --no-dev --optimize-autoloader
    ```

---

## ⚠️ Important Notes
- **Storage**: Do NOT run `php artisan storage:link` on Hostinger. The project is configured to bypass this requirement by writing directly to `public/storage`.
- **API URL**: Always keep `VITE_API_URL=https://zeronix.store` (WITHOUT `/api`) in your local production `.env` to avoid double prefixes.
- **Routing**: The `.htaccess` in `public_html` handles everything. You don't need to change it again unless you add new top-level folders.
