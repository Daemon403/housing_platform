import { Router } from 'express';
import BookingController from '../controllers/BookingController';

const router = Router();

router.get('/', BookingController.list);
router.post('/', BookingController.create);
router.get('/:id', BookingController.getById);
router.patch('/:id', BookingController.update);
router.delete('/:id', BookingController.remove);

export default router;
