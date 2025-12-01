/**
 * Task Manager Frontend Application
 * Demonstrates communication with backend API service
 */

const API_BASE_URL = '/api';

// ============================================================================
// Check Backend Health
// ============================================================================
async function checkBackendHealth() {
    try {
        const response = await fetch('/api/../health');
        const data = await response.json();
        
        const statusElement = document.getElementById('backend-status');
        if (data.status === 'healthy') {
            statusElement.textContent = 'Active';
            statusElement.className = 'service-status active';
            
            // Update database and redis status
            document.getElementById('database-status').textContent = 'Connected';
            document.getElementById('database-status').className = 'service-status active';
            document.getElementById('redis-status').textContent = 'Connected';
            document.getElementById('redis-status').className = 'service-status active';
        } else {
            statusElement.textContent = 'Unhealthy';
            statusElement.className = 'service-status error';
        }
    } catch (error) {
        console.error('Health check failed:', error);
        const statusElement = document.getElementById('backend-status');
        statusElement.textContent = 'Error';
        statusElement.className = 'service-status error';
    }
}

// ============================================================================
// Load Statistics
// ============================================================================
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const result = await response.json();
        
        document.getElementById('total-tasks').textContent = result.data.total || 0;
        document.getElementById('completed-tasks').textContent = result.data.completed || 0;
        document.getElementById('pending-tasks').textContent = result.data.pending || 0;
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

// ============================================================================
// Load Tasks
// ============================================================================
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        const result = await response.json();
        
        const container = document.getElementById('tasks-container');
        
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-state">No tasks yet. Add your first task!</div>';
            return;
        }
        
        // Show cache indicator
        const cacheIndicator = result.source === 'cache' ? 
            '<span class="cache-badge">⚡ From Cache</span>' : 
            '<span class="cache-badge">💾 From Database</span>';
        
        container.innerHTML = `
            <div class="cache-indicator">${cacheIndicator}</div>
            ${result.data.map(task => createTaskHTML(task)).join('')}
        `;
        
        // Add event listeners
        document.querySelectorAll('.task-card').forEach(card => {
            const taskId = card.dataset.taskId;
            
            // Toggle complete
            card.querySelector('.btn-complete').addEventListener('click', () => toggleTask(taskId));
            
            // Delete task
            card.querySelector('.btn-delete').addEventListener('click', () => deleteTask(taskId));
        });
        
    } catch (error) {
        console.error('Failed to load tasks:', error);
        document.getElementById('tasks-container').innerHTML = 
            '<div class="error">Failed to load tasks. Please try again.</div>';
    }
}

// ============================================================================
// Create Task HTML
// ============================================================================
function createTaskHTML(task) {
    return `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="task-status">${task.completed ? '✓ Done' : '⏳ Pending'}</span>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-footer">
                <small class="task-date">Created: ${new Date(task.created_at).toLocaleDateString()}</small>
                <div class="task-actions">
                    <button class="btn btn-small btn-complete">
                        ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button class="btn btn-small btn-delete">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// Add Task
// ============================================================================
document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    
    if (!title) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        });
        
        if (response.ok) {
            // Clear form
            document.getElementById('task-title').value = '';
            document.getElementById('task-description').value = '';
            
            // Reload tasks and statistics
            await Promise.all([loadTasks(), loadStatistics()]);
            
            showNotification('Task added successfully! 🎉', 'success');
        } else {
            throw new Error('Failed to add task');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Failed to add task. Please try again.', 'error');
    }
});

// ============================================================================
// Toggle Task Status
// ============================================================================
async function toggleTask(taskId) {
    try {
        // Get current task
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
        const result = await response.json();
        const task = result.data;
        
        // Toggle completed status
        const updateResponse = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !task.completed }),
        });
        
        if (updateResponse.ok) {
            await Promise.all([loadTasks(), loadStatistics()]);
            showNotification('Task updated! ✓', 'success');
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        showNotification('Failed to update task.', 'error');
    }
}

// ============================================================================
// Delete Task
// ============================================================================
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            await Promise.all([loadTasks(), loadStatistics()]);
            showNotification('Task deleted! 🗑️', 'success');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task.', 'error');
    }
}

// ============================================================================
// Utility Functions
// ============================================================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================================
// Initialize Application
// ============================================================================
async function init() {
    // Check backend health
    await checkBackendHealth();
    
    // Load initial data
    await Promise.all([loadTasks(), loadStatistics()]);
    
    // Refresh data every 30 seconds
    setInterval(() => {
        loadStatistics();
    }, 30000);
    
    // Check health every 30 seconds
    setInterval(checkBackendHealth, 30000);
}

// Start application
init();
