# Docker Compose - Complete Learning Guide
## Task Management Application Example

This document explains **ALL Docker Compose concepts** using a real-world application.

---

## 🎯 Learning Objectives Covered

✅ **a. Multiple Interdependent Services** - Frontend, Backend, Database, Cache  
✅ **b. Writing docker-compose.yml** - Complete configuration with explanations  
✅ **c. Portable Deployment** - Same setup works anywhere  
✅ **d. Networking & Persistent Storage** - Custom networks and volumes  
✅ **e. Fast Development Iteration** - Hot-reload and quick updates  

---

## 📚 PART 1: Understanding the Application

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Network (app-network)                 │
│                                                                  │
│  User Browser                                                    │
│       │                                                          │
│       │ http://localhost:3000                                    │
│       ▼                                                          │
│  ┌──────────────┐                                               │
│  │   Frontend   │  Nginx serves static HTML/CSS/JS              │
│  │   (Nginx)    │  Makes API calls to backend                   │
│  │   Port 3000  │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         │ API calls (fetch)                                      │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │   Backend    │  Node.js REST API                             │
│  │  (Node.js)   │  - Handles business logic                     │
│  │   Port 5000  │  - Connects to database                       │
│  └──────┬───┬───┘  - Uses Redis for caching                     │
│         │   │                                                    │
│         │   │                                                    │
│    ┌────┘   └────┐                                              │
│    │             │                                               │
│    ▼             ▼                                               │
│  ┌─────────┐  ┌───────┐                                        │
│  │Database │  │ Redis │                                         │
│  │(Postgre │  │(Cache)│                                         │
│  │SQL)     │  │       │                                         │
│  │Port 5432│  │Port   │                                         │
│  │         │  │6379   │                                         │
│  └─────────┘  └───────┘                                         │
│      │            │                                              │
│      ▼            ▼                                              │
│  [postgres-  [redis-                                            │
│   data]       data]                                             │
│  (Volume)    (Volume)                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Why These Services?

1. **Frontend (Nginx)**
   - Serves static files (HTML, CSS, JavaScript)
   - Fast and lightweight
   - Acts as entry point for users

2. **Backend (Node.js)**
   - REST API for business logic
   - Processes requests
   - Manages data operations

3. **Database (PostgreSQL)**
   - Persistent data storage
   - Relational data structure
   - ACID compliance

4. **Cache (Redis)**
   - In-memory data storage
   - Fast data retrieval
   - Reduces database load

---

## 📝 PART 2: docker-compose.yml Explanation

### Section 1: Version & Services Definition

```yaml
version: '3.8'  # Docker Compose file format version
```

**Why version matters:**
- Different versions support different features
- 3.8 is stable and widely supported
- Ensures compatibility across Docker installations

### Section 2: Frontend Service

```yaml
services:
  frontend:
    build:
      context: ./frontend      # Where to find Dockerfile
      dockerfile: Dockerfile   # Dockerfile name
```

**Explanation:**
- `build` tells Docker to build image from Dockerfile
- `context` is the directory containing source code
- Alternative: Use pre-built images with `image: nginx:alpine`

```yaml
    ports:
      - "3000:80"  # HOST_PORT:CONTAINER_PORT
```

**Port Mapping:**
- Maps container's port 80 to host's port 3000
- Access via: `http://localhost:3000`
- Container internally uses port 80
- Multiple containers can use same internal port (80) but different host ports

```yaml
    depends_on:
      - backend
```

**Service Dependencies:**
- Frontend waits for backend to start first
- Ensures correct startup order
- Doesn't wait for backend to be "ready" (use health checks for that)

```yaml
    networks:
      - app-network
```

**Custom Network:**
- Connects service to custom network
- Services on same network can communicate by name
- `frontend` can reach `backend` using hostname "backend"

```yaml
    volumes:
      - ./frontend/public:/usr/share/nginx/html:ro
```

**Bind Mount:**
- **Left side** (`./frontend/public`): Directory on your computer
- **Right side** (`/usr/share/nginx/html`): Directory in container
- `:ro` = Read-only (security best practice)
- **Result**: Changes to files on your computer instantly reflect in container

```yaml
    environment:
      - BACKEND_URL=http://backend:5000
```

**Environment Variables:**
- Configuration without hardcoding
- `backend` resolves to backend service via Docker DNS
- Can be overridden at runtime

```yaml
    restart: unless-stopped
```

**Restart Policy:**
- `no`: Never restart (default)
- `always`: Always restart
- `on-failure`: Restart only on crashes
- `unless-stopped`: Restart unless manually stopped

### Section 3: Backend Service

```yaml
  backend:
    build:
      context: ./backend
      args:
        NODE_ENV: development
```

**Build Arguments:**
- Pass variables during build time
- Available in Dockerfile as `ARG NODE_ENV`
- Different from environment variables

```yaml
    depends_on:
      database:
        condition: service_healthy  # Wait for health check to pass
      redis:
        condition: service_started  # Just wait for start
```

**Advanced Dependencies:**
- `service_healthy`: Waits for health check to succeed
- `service_started`: Waits for service to start (not necessarily ready)
- Ensures backend doesn't start until database is ready

```yaml
    environment:
      DATABASE_HOST: database  # Service name as hostname
      DATABASE_PORT: 5432
      DATABASE_NAME: taskdb
      DATABASE_USER: admin
      DATABASE_PASSWORD: admin123
```

**Service Communication:**
- `DATABASE_HOST: database` uses Docker's DNS resolution
- Docker automatically resolves "database" to the database container's IP
- Services communicate via service names, not IPs

```yaml
    volumes:
      - ./backend:/app
      - /app/node_modules      # Anonymous volume (higher priority)
      - backend-logs:/app/logs # Named volume
```

**Volume Types:**

1. **Bind Mount** (`./backend:/app`)
   - Links host directory to container
   - For development hot-reload
   - Changes on host = changes in container

2. **Anonymous Volume** (`/app/node_modules`)
   - Prevents bind mount from overwriting node_modules
   - Higher priority than bind mount
   - Preserves container's node_modules

3. **Named Volume** (`backend-logs:/app/logs`)
   - Managed by Docker
   - Persists data across container restarts
   - Stored in Docker's volume directory

```yaml
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s    # Check every 30 seconds
      timeout: 10s     # Wait max 10 seconds for response
      retries: 3       # Retry 3 times before marking unhealthy
      start_period: 40s # Grace period during startup
```

**Health Checks:**
- Tests if service is actually ready (not just running)
- Other services can wait for `service_healthy` condition
- Docker marks container as unhealthy if checks fail
- Can trigger automatic restarts

### Section 4: Database Service

```yaml
  database:
    image: postgres:15-alpine  # Pre-built image from Docker Hub
```

**Using Pre-built Images:**
- No need to write Dockerfile
- Alpine = Lightweight Linux distribution
- Version 15 = PostgreSQL version

```yaml
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: taskdb
      PGDATA: /var/lib/postgresql/data/pgdata
```

**PostgreSQL Configuration:**
- Creates database on first startup
- PGDATA specifies where PostgreSQL stores data
- Environment variables from official image documentation

```yaml
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

**Database Persistence:**
1. **Named Volume** (`postgres-data`)
   - All database data stored here
   - Survives container deletion
   - Can be backed up and restored

2. **Initialization Script**
   - `init.sql` runs automatically on first startup
   - Creates tables and inserts initial data
   - Only runs if database doesn't exist

### Section 5: Redis Service

```yaml
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass redis123
```

**Custom Command:**
- Overrides default container command
- `--appendonly yes`: Enables persistence
- `--requirepass`: Sets password

---

## 🌐 PART 3: Docker Networking Explained

### How Services Communicate

```yaml
networks:
  app-network:
    driver: bridge              # Network driver type
    name: task-app-network     # Custom network name
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16  # Custom IP range
```

### Network Drivers

**1. Bridge (Default)**
- Most common for single-host deployments
- Services get unique IPs on shared subnet
- DNS resolution automatically configured
- Services reach each other by name

**2. Host**
- Container uses host's network
- No network isolation
- Faster but less secure

**3. Overlay**
- For multi-host deployments (Docker Swarm/Kubernetes)
- Services across different physical machines

### DNS Resolution Example

When backend connects to database:
```javascript
// In backend code
const db = new Pool({
  host: 'database',  // Docker resolves 'database' → 172.20.0.3
  port: 5432
});
```

**What happens:**
1. Backend queries Docker's internal DNS
2. DNS returns database container's IP (e.g., 172.20.0.3)
3. Connection established on port 5432
4. All traffic stays within Docker network (secure)

### Port Exposure

```yaml
ports:
  - "5432:5432"  # HOST:CONTAINER
```

**Published Ports:**
- Left (5432): Accessible from your computer
- Right (5432): Used inside Docker network
- Only necessary if you want external access
- Services within Docker network don't need published ports

---

## 💾 PART 4: Persistent Storage Explained

### Volume Types Comparison

```yaml
volumes:
  # 1. Named Volume (Docker-managed)
  postgres-data:
    driver: local
    labels:
      - "com.example.description=PostgreSQL data volume"
```

**Named Volumes:**
- **Location**: Managed by Docker
  - Linux: `/var/lib/docker/volumes/postgres-data/_data`
  - Windows: Docker Desktop volume storage
- **Lifecycle**: Persists until explicitly deleted
- **Use case**: Production data
- **Backup**: `docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data`

```yaml
# 2. Bind Mount (in service definition)
volumes:
  - ./backend:/app  # Host path : Container path
```

**Bind Mounts:**
- **Location**: Your computer's filesystem
- **Lifecycle**: Managed by you
- **Use case**: Development (hot-reload)
- **Changes**: Bidirectional (host ↔ container)

```yaml
# 3. Anonymous Volume
volumes:
  - /app/node_modules  # No left side = anonymous
```

**Anonymous Volumes:**
- **Location**: Docker-managed (random name)
- **Lifecycle**: Removed when container is removed (unless `--volumes` flag)
- **Use case**: Prevent bind mount overwrites
- **Priority**: Higher than bind mounts

### Volume Priority Order

```yaml
volumes:
  - ./backend:/app           # Priority 1 (lowest)
  - /app/node_modules        # Priority 2 (higher)
  - backend-logs:/app/logs   # Priority 3 (highest for /app/logs)
```

**Result:**
- `/app/logs` → Uses named volume `backend-logs`
- `/app/node_modules` → Uses anonymous volume
- `/app/everything-else` → Uses bind mount `./backend`

---

## 🚀 PART 5: Commands & Deployment

### Building and Starting

```bash
# Build images and start containers
docker-compose up -d
```

**What happens:**
1. Reads `docker-compose.yml`
2. Creates network (`app-network`)
3. Creates volumes (`postgres-data`, `redis-data`, `backend-logs`)
4. Builds images for services with `build` directive
5. Pulls images for services with `image` directive
6. Starts containers in dependency order
7. Attaches containers to network
8. Mounts volumes
9. Sets environment variables
10. `-d` runs in detached mode (background)

### Viewing Status

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f backend

# Check resource usage
docker-compose stats
```

### Making Changes

**Code Changes (with bind mounts):**
```bash
# No rebuild needed - changes reflect immediately
# Just refresh your browser
```

**Dockerfile Changes:**
```bash
# Rebuild specific service
docker-compose up -d --build backend

# Rebuild all services
docker-compose up -d --build
```

**docker-compose.yml Changes:**
```bash
# Recreate containers with new configuration
docker-compose up -d

# Force recreate
docker-compose up -d --force-recreate
```

### Scaling Services

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Load balancing requires additional configuration
```

### Stopping and Cleaning

```bash
# Stop containers (keeps volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Remove everything including images
docker-compose down --rmi all -v
```

---

## 🔒 PART 6: Production Best Practices

### 1. Security

```yaml
# Use specific versions, not 'latest'
image: postgres:15-alpine  # ✅ Good
image: postgres:latest     # ❌ Bad

# Run as non-root user
USER nodejs

# Use secrets (Docker Swarm/Kubernetes)
secrets:
  db_password:
    external: true
```

### 2. Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.50'      # Max 50% of one CPU
          memory: 512M       # Max 512 MB RAM
        reservations:
          cpus: '0.25'      # Guaranteed 25% CPU
          memory: 256M       # Guaranteed 256 MB RAM
```

### 3. Logging

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"     # Max log file size
        max-file: "3"       # Keep 3 log files
```

### 4. Health Checks

Always implement health checks for all services:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🎓 PART 7: Common Patterns & Solutions

### Pattern 1: Database Migrations

```yaml
services:
  migrate:
    image: migrate/migrate
    command: ["-path", "/migrations", "-database", "postgres://..."]
    volumes:
      - ./migrations:/migrations
    depends_on:
      database:
        condition: service_healthy
```

### Pattern 2: Development vs Production

```bash
# docker-compose.yml (base configuration)
# docker-compose.dev.yml (development overrides)
# docker-compose.prod.yml (production overrides)

# Use development config
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Use production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Pattern 3: Waiting for Services

```yaml
# Use wait-for scripts
command: sh -c './wait-for-it.sh database:5432 -- node server.js'
```

---

## ✅ Complete Command Reference

```bash
# === STARTING ===
docker-compose up                    # Start in foreground
docker-compose up -d                 # Start in background
docker-compose up -d --build         # Rebuild and start

# === VIEWING ===
docker-compose ps                    # List containers
docker-compose logs                  # View logs
docker-compose logs -f backend       # Follow backend logs
docker-compose top                   # View processes
docker-compose stats                 # View resource usage

# === EXECUTING ===
docker-compose exec backend sh       # Open shell in backend
docker-compose exec database psql -U admin -d taskdb

# === STOPPING ===
docker-compose stop                  # Stop containers
docker-compose start                 # Start stopped containers
docker-compose restart backend       # Restart specific service
docker-compose down                  # Stop and remove containers
docker-compose down -v               # Also remove volumes

# === BUILDING ===
docker-compose build                 # Build all services
docker-compose build backend         # Build specific service
docker-compose build --no-cache      # Build from scratch

# === VALIDATION ===
docker-compose config                # Validate and view config
docker-compose config --services     # List services
docker-compose port backend 5000     # Show mapped port

# === SCALING ===
docker-compose up -d --scale backend=3

# === TROUBLESHOOTING ===
docker-compose logs --tail=100 -f    # Last 100 lines, follow
docker-compose events                 # View events in real-time
```

---

## 🎯 Summary: All Learning Objectives Achieved

✅ **a. Multiple Interdependent Services**
- Frontend depends on Backend
- Backend depends on Database and Redis
- Health checks ensure proper startup order

✅ **b. docker-compose.yml Skills**
- Service definitions
- Environment variables
- Port mappings
- Volume management
- Network configuration
- Health checks

✅ **c. Portable Deployment**
- Same `docker-compose up` works everywhere
- No manual configuration needed
- Environment-specific overrides possible

✅ **d. Networking & Storage**
- Custom bridge network for isolation
- Service name-based DNS resolution
- Named volumes for persistence
- Bind mounts for development

✅ **e. Fast Development Iteration**
- Hot-reload with bind mounts
- Quick container restarts
- Individual service rebuilds
- No environment setup needed

---

Now you have a complete understanding of Docker Compose! 🎉
