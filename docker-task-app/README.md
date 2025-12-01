# Docker Compose Multi-Service Application
# Task Management System Example

## 🏗️ Architecture Overview

This application demonstrates all Docker Compose concepts with 4 interdependent services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│  PostgreSQL  │ │
│  │   (Nginx)    │    │   (Node.js)  │    │  (Database)  │ │
│  │   Port 3000  │    │   Port 5000  │    │   Port 5432  │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                              │                               │
│                              ▼                               │
│                      ┌──────────────┐                       │
│                      │    Redis     │                       │
│                      │   (Cache)    │                       │
│                      │   Port 6379  │                       │
│                      └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Services

1. **Frontend (Nginx)** - Serves static HTML/CSS/JS
2. **Backend (Node.js)** - REST API server
3. **Database (PostgreSQL)** - Persistent data storage
4. **Cache (Redis)** - Fast data caching

## 🎯 What You'll Learn

### a. Multiple Interdependent Services
- Frontend depends on Backend
- Backend depends on Database and Redis
- All services communicate via Docker network

### b. docker-compose.yml Configuration
- Service definitions
- Environment variables
- Port mappings
- Dependencies (depends_on)
- Health checks

### c. Portable Deployment
- Same setup works on any machine with Docker
- No manual configuration needed
- One command to run everything

### d. Networking & Storage
- Custom bridge network for service communication
- Named volumes for persistent database storage
- Bind mounts for development hot-reload

### e. Fast Development Iteration
- Changes reflect immediately (bind mounts)
- Easy service restart
- Isolated environment per developer

## 🚀 Quick Start

### Prerequisites
```bash
# Check if Docker is installed
docker --version
docker-compose --version
```

### Start All Services
```bash
# From project root directory
docker-compose up -d
```

### Check Running Services
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Fresh Start)
```bash
docker-compose down -v
```

## 📁 Project Structure

```
docker-task-app/
├── docker-compose.yml          # Main orchestration file
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── public/
│       ├── index.html
│       ├── style.css
│       └── app.js
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── init.sql
└── README.md
```

## 🔌 Service Communication

### Frontend → Backend
```javascript
// Frontend makes API calls to backend
fetch('http://localhost:5000/api/tasks')
```

### Backend → Database
```javascript
// Backend connects to PostgreSQL
const db = new Pool({
  host: 'database',  // Docker service name
  port: 5432,
  database: 'taskdb'
});
```

### Backend → Redis
```javascript
// Backend connects to Redis cache
const redis = new Redis({
  host: 'redis',  // Docker service name
  port: 6379
});
```

## 🌐 Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432 (from host)
- **Redis**: localhost:6379 (from host)

## 🔍 Docker Compose Commands

### Development Workflow
```bash
# Start services
docker-compose up -d

# Rebuild after code changes
docker-compose up -d --build

# Restart specific service
docker-compose restart backend

# View resource usage
docker-compose stats

# Execute command in container
docker-compose exec backend npm install lodash

# Access container shell
docker-compose exec backend sh
docker-compose exec database psql -U admin -d taskdb
```

### Debugging
```bash
# View service logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f --tail=100 backend

# Check service health
docker-compose ps
```

### Cleanup
```bash
# Stop services (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Remove everything including images
docker-compose down --rmi all -v
```

## 💾 Data Persistence

### Named Volumes (Persistent)
```yaml
volumes:
  postgres_data:     # Survives container restart
  redis_data:        # Survives container restart
```

Data location: 
- Linux: `/var/lib/docker/volumes/`
- Windows: `\\wsl$\docker-desktop-data\data\docker\volumes\`

### Bind Mounts (Development)
```yaml
volumes:
  - ./backend:/app   # Host directory → Container
```

Changes on host = Instant changes in container

## 🔒 Security Best Practices

1. **Don't hardcode secrets** - Use environment variables
2. **Limit exposed ports** - Only expose what's needed
3. **Use specific image tags** - Avoid `:latest` in production
4. **Run as non-root user** - Add USER in Dockerfile
5. **Use Docker secrets** - For sensitive data in production

## 🎓 Learning Concepts

### Concept 1: Service Dependencies
```yaml
backend:
  depends_on:
    - database
    - redis
```
Backend waits for database and redis to start

### Concept 2: Environment Variables
```yaml
environment:
  DATABASE_URL: postgresql://user:pass@database:5432/db
```
Configuration without hardcoding

### Concept 3: Custom Networks
```yaml
networks:
  app-network:
    driver: bridge
```
Isolated network for service communication

### Concept 4: Health Checks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```
Ensures service is actually ready

### Concept 5: Volume Management
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data  # Persistent
  - ./logs:/app/logs                        # Bind mount
```

## 🐛 Troubleshooting

### Service won't start
```bash
docker-compose logs service-name
docker-compose ps
```

### Port already in use
```bash
# Check what's using the port
netstat -ano | findstr :5000

# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Host:Container
```

### Database connection fails
```bash
# Check if database is ready
docker-compose exec database pg_isready

# Check network connectivity
docker-compose exec backend ping database
```

### Can't access from browser
- Check if services are running: `docker-compose ps`
- Check if ports are exposed: `docker-compose port frontend 80`
- Check firewall settings

## 📈 Production Deployment

For production, modify:
1. Use production-grade images
2. Add resource limits (CPU, memory)
3. Enable restart policies
4. Use Docker secrets for passwords
5. Add logging drivers
6. Set up monitoring
7. Use orchestration (Docker Swarm or Kubernetes)

## 🔗 Useful Links

- Docker Compose Documentation: https://docs.docker.com/compose/
- Docker Hub: https://hub.docker.com/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/
