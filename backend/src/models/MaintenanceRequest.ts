import mongoose, { Document, Schema } from 'mongoose';

export type MaintenanceStatus = 'pending' | 'in-progress' | 'resolved' | 'cancelled';
export type IssueType = 'electrical' | 'plumbing' | 'furniture' | 'appliance' | 'security' | 'cleaning' | 'other';

export interface IMaintenanceRequest extends Document {
  booking: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  homeowner: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  title: string;
  description: string;
  issueType: IssueType;
  status: MaintenanceStatus;
  images?: string[];
  assignedTo?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  resolutionNotes?: string;
  resolvedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  studentRating?: number;
  studentFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    homeowner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title for the maintenance request'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description of the issue'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    issueType: {
      type: String,
      enum: ['electrical', 'plumbing', 'furniture', 'appliance', 'security', 'cleaning', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'cancelled'],
      default: 'pending',
    },
    images: [
      {
        type: String,
      },
    ],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    resolutionNotes: {
      type: String,
      maxlength: [1000, 'Resolution notes cannot be more than 1000 characters'],
    },
    resolvedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot be more than 500 characters'],
    },
    studentRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    studentFeedback: {
      type: String,
      maxlength: [500, 'Feedback cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
maintenanceRequestSchema.index({ student: 1, status: 1 });
maintenanceRequestSchema.index({ homeowner: 1, status: 1 });
maintenanceRequestSchema.index({ listing: 1, status: 1 });
maintenanceRequestSchema.index({ assignedTo: 1, status: 1 });

// Virtual for time since creation
maintenanceRequestSchema.virtual('timeOpen').get(function (this: IMaintenanceRequest) {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save hook to update timestamps when status changes
maintenanceRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', maintenanceRequestSchema);
