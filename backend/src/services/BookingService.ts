import Booking, { IBooking } from '../models/Booking';
import { FilterQuery } from 'mongoose';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export default class BookingService {
  static async create(payload: Partial<IBooking>) {
    const doc = new Booking(payload as IBooking);
    return doc.save();
  }

  static async getById(id: string) {
    return Booking.findById(id).exec();
  }

  static async list(filter: FilterQuery<IBooking> = {}, { page = 1, limit = 10 }: PaginationQuery = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Booking.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      Booking.countDocuments(filter).exec(),
    ]);
    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  static async update(id: string, payload: Partial<IBooking>) {
    return Booking.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  static async remove(id: string) {
    return Booking.findByIdAndDelete(id).exec();
  }
}
