const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id/members', protect, adminOnly, addMember);
router.delete('/:id', protect, adminOnly, deleteProject);

module.exports = router;
