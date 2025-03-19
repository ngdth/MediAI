import express from 'express';
import { createPayment, paymentCallback } from '../service/momoService';
  // Đảm bảo đúng đường dẫn

const router = express.Router();

// Route để tạo thanh toán
router.post('/create-payment', createPayment);

// Route để nhận callback từ MoMo
router.post('/callback', paymentCallback);

export default router;
