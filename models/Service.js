import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price must be a positive number'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    subcategory: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 1200,
    },
    duration: {
      type: Number,
      default: 45,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    fullDescription: {
      type: String,
      default: '',
    },
    whatsIncluded: {
      type: [String],
      default: [],
    },
    whatsExcluded: {
      type: [String],
      default: [],
    },
    addOns: {
      type: [Object],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model('Service', serviceSchema);
export default Service;

