import { Response, NextFunction } from 'express';
import { tripService } from '../services/trip.service';
import { AuthRequest } from '../types';

export class TripController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await tripService.findAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const trip = await tripService.findById(id);
      res.json({ success: true, data: trip });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.create(req.body);
      res.status(201).json({ success: true, data: trip });
    } catch (error) { next(error); }
  }

  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const trip = await tripService.assign(id);
      res.json({ success: true, data: trip });
    } catch (error) { next(error); }
  }

  async startTrip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const trip = await tripService.startTrip(id);
      res.json({ success: true, data: trip });
    } catch (error) { next(error); }
  }

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const trip = await tripService.updateStatus(id, 'COMPLETED', req.body.notes);
      res.json({ success: true, data: trip });
    } catch (error) { next(error); }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const trip = await tripService.updateStatus(id, 'CANCELLED', req.body.notes);
      res.json({ success: true, data: trip });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await tripService.delete(id);
      res.json({ success: true, message: 'Trip deleted successfully.' });
    } catch (error) { next(error); }
  }
}

export const tripController = new TripController();
