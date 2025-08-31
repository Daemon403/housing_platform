import { Request, Response, NextFunction } from 'express';
import ListingService from '../services/ListingService';

export default class ListingController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await ListingService.create(req.body);
      res.status(201).json({ status: 'success', data: created });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ListingService.getById(req.params.id);
      if (!item) return res.status(404).json({ status: 'error', message: 'Listing not found' });
      res.json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await ListingService.list({}, { page, limit });
      res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ListingService.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ status: 'error', message: 'Listing not found' });
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await ListingService.remove(req.params.id);
      if (!removed) return res.status(404).json({ status: 'error', message: 'Listing not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
