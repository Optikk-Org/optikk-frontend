# Observability Frontend (React + Vite)

React SPA for the observability platform. Built with Vite, served by nginx in production. All API calls are proxied by nginx to the backend — no CORS configuration needed.

## Build and Push

```bash
# Build (from project root)
docker build -t ramantayal12/observability-frontend:latest ./observability-frontend

# Push to Docker Hub
docker login
docker push ramantayal12/observability-frontend:latest
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
# 0. Create network for container communication
podman network create observability-net

# 1. Start ClickHouse
podman run -d --name clickhouse --network observability-net \
  -p 9000:9000 -p 8123:8123 \
  -e CLICKHOUSE_DB=observability \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=clickhouse123 \
  -v clickhouse-data:/var/lib/clickhouse \
  clickhouse/clickhouse-server:24.3

# 2. Start MariaDB
podman run -d --name mariadb --network observability-net \
  -p 3306:3306 \
  -e MARIADB_ROOT_PASSWORD=root123 \
  -e MARIADB_DATABASE=observability \
  -v mariadb-data:/var/lib/mysql \
  docker.io/library/mariadb:11.2

# 3. Start Backend
podman run -d --name backend --network observability-net \
  -p 8080:8080 \
  -e CLICKHOUSE_HOST=clickhouse -e CLICKHOUSE_DATABASE=observability \
  -e CLICKHOUSE_USERNAME=default -e CLICKHOUSE_PASSWORD=clickhouse123 \
  -e MYSQL_HOST=mariadb -e MYSQL_DATABASE=observability \
  -e MYSQL_USERNAME=root -e MYSQL_PASSWORD=root123 \
  docker.io/ramantayal12/observability-backend:latest

# 4. Start Frontend
podman run -d --name frontend --network observability-net \
  -p 8443:8443 \
  -e BACKEND_URL=http://backend:8080 \
  docker.io/ramantayal12/observability-frontend:latest
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
podman logs backend  # Check for connection errors
podman logs frontend # Check frontend logs
curl http://localhost:8080/api/v1/status  # Backend status
curl -k https://localhost:8443  # Frontend (self-signed cert)
```

---

## Local Development

```bash
npm install
npm run dev  # Starts on http://localhost:3000
```

Requires backend running on `localhost:8080`.
