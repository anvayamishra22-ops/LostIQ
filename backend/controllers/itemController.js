import Item from '../models/Item.js';

// @desc    Create a new lost or found item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { itemName, category, description, location, date, type } = req.body;

    if (!itemName || !category || !description || !location || !date || !type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let image = '';
    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_API_KEY && 
                            process.env.CLOUDINARY_API_SECRET;
      if (hasCloudinary) {
        image = req.file.path; // Cloudinary URL
      } else {
        // Local fallback URL (windows backslash replaced by forward slash)
        image = '/' + req.file.path.replace(/\\/g, '/');
      }
    }

    const item = await Item.create({
      itemName,
      category,
      description,
      location,
      date,
      type,
      image,
      user: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items with search and filter parameters
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { search, category, location, type, status } = req.query;

    let query = {};

    // Filter by type: lost or found
    if (type) {
      query.type = type;
    }

    // Filter by status: active or recovered
    if (status) {
      query.status = status;
    }

    // Search by itemName (regex search)
    if (search) {
      query.itemName = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by location
    if (location && location !== 'All') {
      query.location = location;
    }

    const items = await Item.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an item report
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { itemName, category, description, location, date, status } = req.body;
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership (only owner or admin can update)
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized to update this item' });
    }

    let image = item.image;
    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_API_KEY && 
                            process.env.CLOUDINARY_API_SECRET;
      if (hasCloudinary) {
        image = req.file.path;
      } else {
        image = '/' + req.file.path.replace(/\\/g, '/');
      }
    }

    item.itemName = itemName || item.itemName;
    item.category = category || item.category;
    item.description = description || item.description;
    item.location = location || item.location;
    item.date = date || item.date;
    item.status = status || item.status;
    item.image = image;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an item report
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark item status as recovered/returned
// @route   PUT /api/items/:id/recover
// @access  Private
const markRecovered = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    item.status = 'recovered';
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get items reported by the logged-in user
// @route   GET /api/items/myreports
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  markRecovered,
  getMyReports,
};
