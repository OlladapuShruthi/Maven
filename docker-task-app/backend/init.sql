-- Database Initialization Script
-- This runs automatically when PostgreSQL container starts for the first time

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Insert sample data
INSERT INTO tasks (title, description, completed) VALUES
    ('Learn Docker Compose', 'Understand multi-container orchestration', false),
    ('Configure Networking', 'Set up custom bridge network for services', false),
    ('Implement Persistent Storage', 'Use volumes for database persistence', false),
    ('Add Health Checks', 'Ensure services are ready before accepting traffic', true),
    ('Deploy Application', 'Deploy the same setup across different machines', false);

-- Create a view for statistics
CREATE OR REPLACE VIEW task_statistics AS
SELECT 
    COUNT(*) as total_tasks,
    SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN NOT completed THEN 1 ELSE 0 END) as pending_tasks,
    ROUND(100.0 * SUM(CASE WHEN completed THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as completion_percentage
FROM tasks;

-- Output confirmation
SELECT 'Database initialized successfully!' as message;
SELECT * FROM task_statistics;
