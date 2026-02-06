# Deploying CMS to Namecheap with Vercel Backend

## 1. Backend Configuration (Vercel)

1.  **Environment Variables**: Go to your Vercel Project Settings > Environment Variables.
2.  **Add/Update `CLIENT_URL`**:
    *   Set `CLIENT_URL` to your actual Namecheap domain, e.g., `https://admin.yourdomain.com` (no trailing slash).
    *   *Note: If you want to support both localhost and production, you can add multiple comma-separated domains if using the latest `application.js` logic, or just update it for production.*
3.  **Redeploy**: Go to Deployments and redeploy the latest commit to apply the environment variable changes.

## 2. Frontend Build (Local Machine)

1.  **Update `.env`**:
    *   Open `d:\projects\2026.01.15_Nature_Scape\cpanel\client\Cmswithlogindashboard\.env`
    *   Change `VITE_BASE_URL` to your Vercel backend URL:
        ```env
        VITE_BASE_URL=https://nature-escape-web-back.vercel.app
        ```
    *   *Ensure there is no trailing slash.*

2.  **Build the Project**:
    *   Open a terminal in `d:\projects\2026.01.15_Nature_Scape\cpanel\client\Cmswithlogindashboard`
    *   Run:
        ```bash
        npm run build
        ```
    *   This converts your standard code into the `dist` folder.

3.  **Verify Output**:
    *   Check the `dist` folder. It should contain `index.html`, `assets/`, and the `.htaccess` file (I added this to `public` so it gets copied automatically).

## 3. Upload to Namecheap

1.  **Login to cPanel**: Go to the Namecheap cPanel File Manager.
2.  **Navigate to Domain Root**:
    *   If this is your main domain, go to `public_html`.
    *   If simpler using a subdomain (e.g., `cms.natureescape.com`), go to that subdomain's folder.
3.  **Upload Files**:
    *   Upload the **contents** of the `dist` folder (not the folder itself) to the server.
    *   You should see `index.html` in the root of your domain folder.
4.  **Verify `.htaccess`**:
    *   Ensure the `.htaccess` file is present. If you don't see it, enable "Show Hidden Files" in cPanel settings.
    *   This file is **crucial** for page refreshing to work (so `/login` doesn't give a 404).

## 4. Testing

1.  Open your Namecheap URL (e.g., `https://cms.natureescape.com`).
2.  Log in.
    *   The request should go to `https://nature-escape-web-back.vercel.app/api/auth/login`.
    *   The `apiClient` checks for the token and saves it to `localStorage`.
3.  Refresh the page. You should stay logged in.
