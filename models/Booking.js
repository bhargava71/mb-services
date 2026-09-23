import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required'],
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Address is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    quantity: {
      type: Number,
      default: 1,
    },
    selectedAddOns: {
      type: [Object],
      default: [],
    },
    status: {
      type: String,
      enum: [
        'pending',
        'assigned',
        'accepted',
        'in-progress',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
