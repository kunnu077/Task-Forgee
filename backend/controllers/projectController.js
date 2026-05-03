const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { title, description, memberEmails } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    // Resolve member emails to user IDs
    let memberIds = [req.user._id];
    if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
      const members = await User.find({ email: { $in: memberEmails } });
      const foundIds = members.map((m) => m._id.toString());
      memberIds = [...new Set([req.user._id.toString(), ...foundIds])];
    }

    const project = await Project.create({
      title,
      description: description || '',
      createdBy: req.user._id,
      members: memberIds,
    });

    await project.populate('createdBy members', 'name email role');

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({ createdBy: req.user._id })
        .populate('createdBy members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy members', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'createdBy members',
      'name email role'
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// PUT /api/projects/:id/members
const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    const alreadyMember = project.members.some(
      (m) => m.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToAdd._id);
    await project.save();
    await project.populate('createdBy members', 'name email role');

    res.json({ message: `${userToAdd.name} added to project`, project });
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error: error.message });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can delete it' });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and all its tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, addMember, deleteProject };
