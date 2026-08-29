import Claim from '../models/Claim.js';
import Item from '../models/Item.js';

// @desc    Create a claim for a found item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  try {
    const { item: itemId, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({ message: 'Please provide item ID and identifying details' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Verify it is a found item
    if (item.type !== 'found') {
      return res.status(400).json({ message: 'Claims can only be filed for found items' });
    }

    // Check if user is claiming their own item
    if (item.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim an item you reported yourself' });
    }

    // Check if claim already exists
    const existingClaim = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim for this item' });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      message,
    });

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get claims filed by the logged-in user (Sent Claims)
// @route   GET /api/claims/myclaims
// @access  Private
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'item',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get claims received on found items reported by the logged-in user
// @route   GET /api/claims/received
// @access  Private
const getReceivedClaims = async (req, res) => {
  try {
    // Find all items reported by the user
    const userItems = await Item.find({ user: req.user._id });
    const userItemIds = userItems.map(item => item._id);

    // Find claims associated with these items
    const claims = await Claim.find({ item: { $in: userItemIds } })
      .populate('item')
      .populate('claimant', 'name email')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a claim status (Approve/Reject)
// @route   PUT /api/claims/:id
// @access  Private
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status' });
    }

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Verify ownership: only the user who reported the found item (or admin) can approve/reject the claim
    const itemOwnerId = claim.item.user.toString();
    if (itemOwnerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized to update this claim status' });
    }

    claim.status = status;
    const updatedClaim = await claim.save();

    // If claim is approved, optionally we could set the item status to recovered
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.item._id, { status: 'recovered' });
    }

    res.json(updatedClaim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  updateClaimStatus,
};
