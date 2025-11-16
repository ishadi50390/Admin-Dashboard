import { Router } from 'express';
import { createOrder, listOrders, getOrderById } from '../controllers/orderController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, listOrders);
router.get('/:id', authenticateJWT, getOrderById);
router.post('/', authenticateJWT, createOrder);

export default router;
