import MaintenanceRequest, { IMaintenanceRequest } from '../models/MaintenanceRequest';
import { FilterQuery } from 'mongoose';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export default class MaintenanceRequestService {
  static async create(payload: Partial<IMaintenanceRequest>) {
    const doc = new MaintenanceRequest(payload as IMaintenanceRequest);
    return doc.save();
  }

  static async getById(id: string) {
    return MaintenanceRequest.findById(id).exec();
  }

  static async list(filter: FilterQuery<IMaintenanceRequest> = {}, { page = 1, limit = 10 }: PaginationQuery = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      MaintenanceRequest.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      MaintenanceRequest.countDocuments(filter).exec(),
    ]);
    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  static async update(id: string, payload: Partial<IMaintenanceRequest>) {
    return MaintenanceRequest.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  static async remove(id: string) {
    return MaintenanceRequest.findByIdAndDelete(id).exec();
  }
}
