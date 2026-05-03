const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard/stats', protect, getDashboardStats);
router.post('/', protect, adminOnly, createTask);
router.get('/:projectId', protect, getTasksByProject);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
