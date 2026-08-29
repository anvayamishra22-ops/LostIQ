import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Please add item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add description'],
    },
    location: {
      type: String,
      required: [true, 'Please add location'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please select date'],
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Please specify if the item is lost or found'],
    },
    image: {
      type: String, // Stores Cloudinary Image URL
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'recovered'],
      default: 'active',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
