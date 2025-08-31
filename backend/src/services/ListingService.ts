import Listing, { IListing } from '../models/Listing';
import { FilterQuery } from 'mongoose';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export default class ListingService {
  static async create(payload: Partial<IListing>) {
    const listing = new Listing(payload as IListing);
    return listing.save();
  }

  static async getById(id: string) {
    return Listing.findById(id).exec();
  }

  static async list(filter: FilterQuery<IListing> = {}, { page = 1, limit = 10 }: PaginationQuery = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Listing.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      Listing.countDocuments(filter).exec(),
    ]);
    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  static async update(id: string, payload: Partial<IListing>) {
    return Listing.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  static async remove(id: string) {
    return Listing.findByIdAndDelete(id).exec();
  }
}
