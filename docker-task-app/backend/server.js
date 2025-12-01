/**
 * Task Management Backend API
 * Demonstrates Docker Compose service communication:
 * - PostgreSQL for persistent storage
 * - Redis for caching
 * - REST API endpoints
 */

const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ============================================================================
// DATABASE CONNECTION (PostgreSQL)
// ============================================================================
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'database',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'taskdb',
  user: process.env.DATABASE_USER || 'admin',
  password: process.env.DATABASE_PASSWORD || 'admin123',
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// ============================================================================
// REDIS CONNECTION (Cache)
// ============================================================================
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
  password: 'redis123'
});

redisClient.on('error', (err) => console.error('❌ Redis error:', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis cache'));

redisClient.connect();

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/health', async (req, res) => {
  try {
    // Check database
    await pool.query('SELECT 1');
    
    // Check Redis
    await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Get all tasks (with caching)
app.get('/api/tasks', async (req, res) => {
  try {
    // Check Redis cache first
    const cachedTasks = await redisClient.get('tasks:all');
    
    if (cachedTasks) {
      console.log('📦 Returning cached tasks');
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedTasks)
      });
    }
    
    // Query database
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    
    // Cache the result for 60 seconds
    await redisClient.setEx('tasks:all', 60, JSON.stringify(result.rows));
    
    console.log('💾 Returning tasks from database');
    res.json({
      source: 'database',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check cache
    const cachedTask = await redisClient.get(`task:${id}`);
    if (cachedTask) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedTask)
      });
    }
    
    // Query database
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Cache the result
    await redisClient.setEx(`task:${id}`, 60, JSON.stringify(result.rows[0]));
    
    res.json({
      source: 'database',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || '']
    );
    
    // Invalidate cache
    await redisClient.del('tasks:all');
    
    res.status(201).json({
      message: 'Task created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           completed = COALESCE($3, completed),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, description, completed, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Invalidate cache
    await redisClient.del('tasks:all');
    await redisClient.del(`task:${id}`);
    
    res.json({
      message: 'Task updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Invalidate cache
    await redisClient.del('tasks:all');
    await redisClient.del(`task:${id}`);
    
    res.json({
      message: 'Task deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN NOT completed THEN 1 ELSE 0 END) as pending
      FROM tasks
    `);
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log(`   Task Management API Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   ============================================');
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET    /health           - Health check`);
  console.log(`   GET    /api/tasks        - Get all tasks`);
  console.log(`   GET    /api/tasks/:id    - Get task by ID`);
  console.log(`   POST   /api/tasks        - Create new task`);
  console.log(`   PUT    /api/tasks/:id    - Update task`);
  console.log(`   DELETE /api/tasks/:id    - Delete task`);
  console.log(`   GET    /api/stats        - Get statistics`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await pool.end();
  await redisClient.quit();
  process.exit(0);
});
