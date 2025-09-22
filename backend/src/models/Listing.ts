import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IListingPackage {
  name: string;
  description: string;
  price: number;
  includes: string[];
}

export interface IAmenities {
  wifi: boolean;
  parking: boolean;
  laundry: boolean;
  kitchen: boolean;
  ac: boolean;
  furnished: boolean;
  studyArea: boolean;
  privateBathroom: boolean;
}

export interface IListing extends Document {
  title: string;
  description: string;
  address: IAddress;
  owner: mongoose.Types.ObjectId;
  roomType: 'private' | 'shared' | 'entire';
  genderPreference: 'male' | 'female' | 'any';
  packages: IListingPackage[];
  amenities: IAmenities;
  images: string[];
  isAvailable: boolean;
  isActive: boolean; // For soft delete
  availableFrom: Date;
  minimumStay: number; // in months
  maximumOccupancy: number;
  currentOccupancy: number;
  rules: string[];
  features: string[]; // Additional features not covered by amenities
  utilitiesIncluded: boolean;
  depositRequired: boolean;
  depositAmount?: number;
  leaseTerms: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'rented';
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'Nigeria' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const packageSchema = new Schema<IListingPackage>({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  includes: [{ type: String }],
});

const amenitiesSchema = new Schema<IAmenities>({
  wifi: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  laundry: { type: Boolean, default: false },
  kitchen: { type: Boolean, default: false },
  ac: { type: Boolean, default: false },
  furnished: { type: Boolean, default: false },
  studyArea: { type: Boolean, default: false },
  privateBathroom: { type: Boolean, default: false },
});

const listingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    address: {
      type: addressSchema,
      required: [true, 'Please add an address'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomType: {
      type: String,
      enum: ['private', 'shared', 'entire'],
      required: true,
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      default: 'any',
    },
    packages: [packageSchema],
    amenities: {
      type: amenitiesSchema,
      default: {},
    },
    images: [
      {
        type: String,
        required: [true, 'Please add at least one image'],
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availableFrom: {
      type: Date,
      required: [true, 'Please specify when the room will be available'],
    },
    minimumStay: {
      type: Number,
      required: [true, 'Please specify minimum stay in months'],
      min: [1, 'Minimum stay must be at least 1 month'],
    },
    rules: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create geospatial index for location-based queries
listingSchema.index({ 'address.coordinates': '2dsphere' });

// Create text index for search functionality
listingSchema.index(
  { 
    'title': 'text',
    'description': 'text',
    'address.street': 'text',
    'address.city': 'text',
    'address.state': 'text',
  },
  {
    weights: {
      'title': 5,
      'description': 1,
      'address.city': 3,
      'address.state': 2,
    },
  }
);

export default mongoose.model<IListing>('Listing', listingSchema);
