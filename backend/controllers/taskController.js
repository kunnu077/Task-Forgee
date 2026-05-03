const Task = require('../models/Task');
const Project = require('../models/Project');

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, deadline } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project admin can create tasks' });
    }

    // Validate assignedTo is a project member
    if (assignedTo) {
      const isMember = project.members.some((m) => m.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a member of this project' });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      projectId,
      assignedTo: assignedTo || null,
      deadline: deadline || null,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo createdBy', 'name email');

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// GET /api/tasks/:projectId
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    const isAdmin = project.createdBy.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Members can only update status
    if (!isAdmin) {
      if (Object.keys(req.body).some((k) => k !== 'status')) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    const { title, description, assignedTo, status, deadline } = req.body;

    const validStatuses = ['todo', 'in-progress', 'done'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (isAdmin) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (deadline !== undefined) task.deadline = deadline || null;
    }

    if (status !== undefined) task.status = status;

    await task.save();
    await task.populate('assignedTo createdBy', 'name email');

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project admin can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// GET /api/tasks/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    let projectIds;
    const Project = require('../models/Project');

    if (req.user.role === 'admin') {
      const projects = await Project.find({ createdBy: req.user._id });
      projectIds = projects.map((p) => p._id);
    } else {
      const projects = await Project.find({ members: req.user._id });
      projectIds = projects.map((p) => p._id);
    }

    const now = new Date();

    const [total, completed, overdue, inProgress] = await Promise.all([
      Task.countDocuments({ projectId: { $in: projectIds } }),
      Task.countDocuments({ projectId: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({
        projectId: { $in: projectIds },
        status: { $ne: 'done' },
        deadline: { $lt: now, $ne: null },
      }),
      Task.countDocuments({ projectId: { $in: projectIds }, status: 'in-progress' }),
    ]);

    res.json({
      stats: {
        total,
        completed,
        overdue,
        inProgress,
        todo: total - completed - inProgress,
        projectCount: projectIds.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask, getDashboardStats };
