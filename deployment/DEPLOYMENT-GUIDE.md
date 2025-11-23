# Sacred Lock Screen - Deployment Guide

## Prerequisites

- WhitePineTech server (5.78.128.255)
- SSH access: `ssh whitepine`
- Node.js installed on server
- Nginx installed on server
- Existing domain: whitepine-tech.com (already configured)
- Deployment URL: https://whitepine-tech.com/sacredlockscreen

---

## Step-by-Step Deployment

### 1. Build the Frontend Locally

```bash
cd ~/Documents/AI_Automation/Projects/SacredLockScreen
npm run build
```

This creates optimized production files in `client/dist/`

---

### 2. Create Directory on Server

```bash
ssh whitepine "mkdir -p /home/deploy/sacred-lockscreen"
```

---

### 3. Upload Files to Server

Upload the entire project (excluding node_modules and dev files):

```bash
cd ~/Documents/AI_Automation/Projects/SacredLockScreen

# Upload backend, built frontend, and backgrounds
rsync -avz --exclude 'node_modules' \
           --exclude 'client/node_modules' \
           --exclude 'client/src' \
           --exclude '.git' \
           --exclude 'tests' \
           --exclude 'test-results' \
           --exclude 'playwright-report' \
           --exclude '.env' \
           . whitepine:/home/deploy/sacred-lockscreen/
```

---

### 4. Install Dependencies on Server

```bash
ssh whitepine "cd /home/deploy/sacred-lockscreen && npm install --production"
```

**Note:** This only installs production dependencies (not the client dev dependencies)

---

### 5. Install System Fonts (if needed)

The app uses system fonts. Ubuntu servers typically have these installed, but verify:

```bash
ssh whitepine "apt list --installed | grep -E 'fonts-dejavu|fonts-liberation'"
```

If missing, you'll need to ask the user to run:
```bash
sudo apt install fonts-dejavu fonts-liberation fonts-freefont-ttf fonts-noto
```

---

### 6. Set Up Systemd Service

Copy the service file to the system directory:

```bash
ssh whitepine-root "cp /home/deploy/sacred-lockscreen/deployment/sacred-lockscreen.service /etc/systemd/system/"
```

Enable and start the service:

```bash
ssh whitepine-root "systemctl daemon-reload && \
                    systemctl enable sacred-lockscreen && \
                    systemctl start sacred-lockscreen"
```

Check status:

```bash
ssh whitepine "systemctl status sacred-lockscreen"
```

---

### 7. Configure Nginx Reverse Proxy

You need to add the Sacred Lock Screen location block to your existing `whitepine-tech.com` nginx configuration.

**Manual step:** Edit your existing nginx config and add this location block:

```bash
ssh whitepine-root
# Find your existing whitepine-tech.com config (might be in /etc/nginx/sites-available/)
# Add the location block from deployment/nginx-sacred-lockscreen.conf
# to the existing server block for whitepine-tech.com
```

Or copy the snippet:

```nginx
location /sacredlockscreen/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 10M;
}
```

Test nginx configuration:

```bash
ssh whitepine-root "nginx -t"
```

Reload nginx:

```bash
ssh whitepine-root "systemctl reload nginx"
```

**Note:** No separate SSL certificate needed - uses existing whitepine-tech.com certificate

---

### 8. Verify Deployment

Open in browser:
```
https://whitepine-tech.com/sacredlockscreen
```

Check logs:
```bash
ssh whitepine "journalctl -u sacred-lockscreen -f"
```

---

## Updating the Application

When you make changes:

1. Build frontend locally:
   ```bash
   npm run build
   ```

2. Upload changes:
   ```bash
   rsync -avz --exclude 'node_modules' \
              --exclude 'client/node_modules' \
              --exclude 'client/src' \
              --exclude '.git' \
              . whitepine:/home/deploy/sacred-lockscreen/
   ```

3. Restart service:
   ```bash
   ssh whitepine "sudo systemctl restart sacred-lockscreen"
   ```

---

## Troubleshooting

### Check if service is running:
```bash
ssh whitepine "systemctl status sacred-lockscreen"
```

### View logs:
```bash
ssh whitepine "journalctl -u sacred-lockscreen -n 50"
```

### Check if port 3001 is listening:
```bash
ssh whitepine "netstat -tlnp | grep 3001"
```

### Test backend directly (bypass nginx):
```bash
ssh whitepine "curl http://localhost:3001/api/backgrounds"
```

### Nginx errors:
```bash
ssh whitepine "tail -f /var/log/nginx/error.log"
```

---

## Architecture

```
Internet
   ↓
whitepine-tech.com/sacredlockscreen
   ↓
Nginx (443) → SSL/TLS → location /sacredlockscreen/
   ↓
Node.js/Express (localhost:3001)
   ├── Serves React frontend (static files with base: /sacredlockscreen/)
   ├── API endpoints (/api/*)
   └── Background images (/backgrounds/*)
```

---

## Security Notes

- Application runs as `deploy` user (not root)
- SSL/TLS encryption via Let's Encrypt
- CORS enabled for API access
- No database credentials (MVP uses filesystem)
- Background images are public (served via nginx)
