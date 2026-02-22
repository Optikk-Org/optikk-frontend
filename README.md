# Observability Frontend (React + Vite)

React SPA for the observability platform. Built with Vite, served by nginx in production. All API calls are proxied by nginx to the backend — no CORS configuration needed.

## Build and Push

```bash
# Build (from project root)
docker build -t youruser/observability-frontend:latest ./observability-frontend

# Push to Docker Hub
docker login
docker push youruser/observability-frontend:latest
```

---

## VM Deployment with Podman

```bash
# Install Podman (Debian/Ubuntu)
sudo apt-get install -y podman

# Install Podman (RHEL/Fedora)
sudo dnf install -y podman
```

### Deploy Full Stack

```bash
# 1. Create network
podman network create observability-net

# 2. Start MariaDB
podman run -d --name mariadb --network observability-net \
  -p 3306:3306 -e MARIADB_ROOT_PASSWORD=root123 \
  -e MARIADB_DATABASE=observability -v mariadb-data:/var/lib/mysql \
  docker.io/library/mariadb:11.2

# 3. Start Backend (replace "youruser")
podman run -d --name backend --network observability-net \
  -p 8080:8080 -p 9876:9876/udp \
  -e MYSQL_HOST=mariadb -e MYSQL_DATABASE=observability \
  -e MYSQL_USERNAME=root -e MYSQL_PASSWORD=root123 \
  docker.io/youruser/observability-backend:latest

# 4. Start Frontend (replace "youruser")
podman run -d --name frontend --network observability-net \
  -p 8080:8080 -p 8443:8443 \
  -e BACKEND_URL=http://backend:8080 \
  docker.io/youruser/observability-frontend:latest
```

Access at `https://localhost:8443` (self-signed cert warning expected).

**Production:** Add `-e JWT_SECRET=your-secure-secret` to backend, mount custom certs to frontend:
```bash
-v /path/to/cert.pem:/etc/nginx/ssl/cert.pem:ro \
-v /path/to/key.pem:/etc/nginx/ssl/key.pem:ro
```

### Verify

```bash
podman ps
curl http://localhost:8080/api/health
curl -k https://localhost:8443  # Frontend (self-signed cert)
```

### Management

```bash
# Logs
podman logs -f frontend

# Stop/Start
podman stop frontend backend mariadb
podman start mariadb backend frontend

# Remove (data persists in volumes)
podman rm -f frontend backend mariadb
podman volume rm mariadb-data  # WARNING: deletes data
```

---

## Local Development

```bash
npm install
npm run dev  # Starts on http://localhost:3000
```

Requires backend running on `localhost:8080`.
