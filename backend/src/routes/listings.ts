import { Router } from 'express';
import ListingController from '../controllers/ListingController';

const router = Router();

router.get('/', ListingController.list);
router.post('/', ListingController.create);
router.get('/:id', ListingController.getById);
router.patch('/:id', ListingController.update);
router.delete('/:id', ListingController.remove);

export default router;
