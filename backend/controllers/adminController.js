import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all item reports
// @route   GET /api/admin/items
// @access  Private/Admin
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all claims in the system
// @route   GET /api/admin/claims
// @access  Private/Admin
const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find({})
      .populate('item')
      .populate('claimant', 'name email')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's items and claims
    await Item.deleteMany({ user: userId });
    await Claim.deleteMany({ claimant: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllUsers,
  getAllItems,
  getAllClaims,
  deleteUser,
};
