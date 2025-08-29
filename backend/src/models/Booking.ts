import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export interface IBooking extends Document {
  student: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  package: {
    name: string;
    price: number;
    includes: string[];
  };
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  totalAmount: number;
  securityDeposit: number;
  isPaid: boolean;
  paymentDate?: Date;
  paymentMethod: string;
  paymentReference?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    package: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      includes: [{ type: String }],
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
      validate: {
        validator: function (this: IBooking, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please add the total amount'],
      min: [0, 'Amount cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Please add the security deposit amount'],
      min: [0, 'Deposit cannot be negative'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please select a payment method'],
      enum: ['card', 'bank_transfer', 'mobile_money'],
    },
    paymentReference: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be longer than 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
bookingSchema.index({ student: 1, status: 1 });
bookingSchema.index({ listing: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function (this: IBooking) {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === 'confirmed';
});

// Pre-save hook to validate booking dates don't overlap
bookingSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    const existingBooking = await this.model('Booking').findOne({
      _id: { $ne: this._id },
      listing: this.listing,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { startDate: { $lt: this.endDate }, endDate: { $gt: this.startDate } },
      ],
    });

    if (existingBooking) {
      throw new Error('This listing is already booked for the selected dates');
    }
  }
  next();
});

export default mongoose.model<IBooking>('Booking', bookingSchema);
