import { Router } from 'express';
import listingRoutes from './listings';
import bookingRoutes from './bookings';
import maintenanceRoutes from './maintenanceRequests';

const router = Router();

router.use('/listings', listingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/maintenance-requests', maintenanceRoutes);

export default router;
