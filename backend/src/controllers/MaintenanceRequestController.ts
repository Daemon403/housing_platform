import { Request, Response, NextFunction } from 'express';
import MaintenanceRequestService from '../services/MaintenanceRequestService';

export default class MaintenanceRequestController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await MaintenanceRequestService.create(req.body);
      res.status(201).json({ status: 'success', data: created });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await MaintenanceRequestService.getById(req.params.id);
      if (!item) return res.status(404).json({ status: 'error', message: 'Maintenance request not found' });
      res.json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await MaintenanceRequestService.list({}, { page, limit });
      res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MaintenanceRequestService.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ status: 'error', message: 'Maintenance request not found' });
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await MaintenanceRequestService.remove(req.params.id);
      if (!removed) return res.status(404).json({ status: 'error', message: 'Maintenance request not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
