# Quick Start Guide - Docker Compose Task Manager

## Prerequisites

1. **Install Docker Desktop**
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Mac: https://docs.docker.com/desktop/install/mac-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **Verify Installation**
   ```powershell
   docker --version
   docker-compose --version
   ```

## Step-by-Step Instructions

### Step 1: Navigate to Project Directory
```powershell
cd "C:\Users\ollad\OneDrive\Desktop\3_1\SE\SE_Lab\Maven_Java\docker-task-app"
```

### Step 2: Start All Services
```powershell
docker-compose up -d
```

**What this does:**
- Builds frontend and backend images
- Downloads PostgreSQL and Redis images
- Creates custom network
- Creates persistent volumes
- Starts all 4 services

**Expected Output:**
```
Creating network "docker-task-app_app-network" ... done
Creating volume "docker-task-app_postgres-data" ... done
Creating volume "docker-task-app_redis-data" ... done
Creating task-database ... done
Creating task-redis    ... done
Creating task-backend  ... done
Creating task-frontend ... done
```

### Step 3: Check Status
```powershell
docker-compose ps
```

**Expected Output:**
```
Name                   Command               State           Ports
-------------------------------------------------------------------------
task-backend    npm run dev                  Up      0.0.0.0:5000->5000/tcp
task-database   docker-entrypoint.sh postgres Up      0.0.0.0:5432->5432/tcp
task-frontend   nginx -g daemon off;         Up      0.0.0.0:3000->80/tcp
task-redis      redis-server --appendonly yes Up      0.0.0.0:6379->6379/tcp
```

### Step 4: View Logs
```powershell
# All services
docker-compose logs

# Specific service
docker-compose logs -f backend
```

### Step 5: Access the Application
Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/tasks
- **Health Check**: http://localhost:5000/health

### Step 6: Test the Application

1. **View Tasks** - You'll see 5 pre-loaded sample tasks
2. **Add a Task** - Use the form to create a new task
3. **Mark Complete** - Click "Mark Complete" button
4. **Delete Task** - Click "Delete" button
5. **Check Statistics** - View total, completed, and pending counts

### Step 7: Verify Service Communication

**Check Backend Logs:**
```powershell
docker-compose logs backend
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Connected to Redis cache
🚀 Task Management API Server
   Running on: http://localhost:5000
```

### Step 8: Test Database Connection

```powershell
# Connect to PostgreSQL
docker-compose exec database psql -U admin -d taskdb

# Run a query
SELECT * FROM tasks;

# Exit
\q
```

### Step 9: Test Redis Cache

```powershell
# Connect to Redis
docker-compose exec redis redis-cli -a redis123

# Check cached data
KEYS *

# Exit
exit
```

### Step 10: Stop Services

```powershell
# Stop but keep data
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

## Common Issues & Solutions

### Issue 1: Port Already in Use
**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```powershell
# Check what's using the port
netstat -ano | findstr :3000

# Either kill that process or change the port in docker-compose.yml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### Issue 2: Services Won't Start
```powershell
# View detailed logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Issue 3: Can't Connect to Database
```powershell
# Check if database is ready
docker-compose exec database pg_isready -U admin

# View database logs
docker-compose logs database
```

### Issue 4: Backend Shows Errors
```powershell
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Rebuild backend
docker-compose up -d --build backend
```

## Development Workflow

### Making Code Changes

**Frontend Changes:**
1. Edit files in `frontend/public/`
2. Refresh browser - changes appear immediately (bind mount)

**Backend Changes:**
1. Edit files in `backend/`
2. Backend auto-restarts (nodemon watches for changes)
3. Check logs: `docker-compose logs -f backend`

### Rebuilding After Changes

**If you change Dockerfile:**
```powershell
docker-compose up -d --build
```

**If you change docker-compose.yml:**
```powershell
docker-compose up -d
```

**If you change package.json:**
```powershell
docker-compose exec backend npm install
docker-compose restart backend
```

## Testing Concepts

### 1. Service Dependencies
```powershell
# Stop database
docker-compose stop database

# Backend should show connection errors
docker-compose logs backend

# Start database again
docker-compose start database
```

### 2. Data Persistence
```powershell
# Add some tasks via web interface
# Then stop and remove containers
docker-compose down

# Start again
docker-compose up -d

# Your tasks should still be there!
```

### 3. Caching
```powershell
# First request (from database)
curl http://localhost:5000/api/tasks
# Look for: "source": "database"

# Second request (from cache)
curl http://localhost:5000/api/tasks
# Look for: "source": "cache"
```

### 4. Health Checks
```powershell
# Check health status
docker-compose ps

# View health check logs
docker inspect task-backend --format='{{json .State.Health}}' | python -m json.tool
```

## Next Steps

1. **Read DOCKER_COMPOSE_GUIDE.md** for detailed explanations
2. **Modify docker-compose.yml** to experiment
3. **Add more services** (e.g., monitoring, logging)
4. **Deploy to production** with Docker Swarm or Kubernetes

## Useful Commands Cheat Sheet

```powershell
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Rebuild
docker-compose up -d --build

# Scale
docker-compose up -d --scale backend=3

# Execute command
docker-compose exec backend npm install

# View networks
docker network ls

# View volumes
docker volume ls

# Clean everything
docker-compose down -v --rmi all
```

## Success Criteria

✅ All 4 services running (`docker-compose ps`)  
✅ Frontend accessible at http://localhost:3000  
✅ Can create, view, update, and delete tasks  
✅ Statistics update correctly  
✅ Backend shows database and Redis connections  
✅ Data persists after `docker-compose down` and `up`  

---

**🎉 Congratulations!** You now have a working Docker Compose multi-service application!
