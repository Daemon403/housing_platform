import { Router } from 'express';
import MaintenanceRequestController from '../controllers/MaintenanceRequestController';

const router = Router();

router.get('/', MaintenanceRequestController.list);
router.post('/', MaintenanceRequestController.create);
router.get('/:id', MaintenanceRequestController.getById);
router.patch('/:id', MaintenanceRequestController.update);
router.delete('/:id', MaintenanceRequestController.remove);

export default router;
