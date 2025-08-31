import { Request, Response, NextFunction } from 'express';
import BookingService from '../services/BookingService';

export default class BookingController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await BookingService.create(req.body);
      res.status(201).json({ status: 'success', data: created });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await BookingService.getById(req.params.id);
      if (!item) return res.status(404).json({ status: 'error', message: 'Booking not found' });
      res.json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await BookingService.list({}, { page, limit });
      res.json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await BookingService.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ status: 'error', message: 'Booking not found' });
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await BookingService.remove(req.params.id);
      if (!removed) return res.status(404).json({ status: 'error', message: 'Booking not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
