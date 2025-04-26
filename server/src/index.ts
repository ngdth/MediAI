import dotenv from 'dotenv'
dotenv.config()

import { Request, Response, NextFunction } from 'express';
import app from './utils/app' // (server)
import mongo from './config/mongo' // (database)
import { PORT } from './constants/index'
import http from 'http'
// import { setupVideoCallSocket } from './utils/socket';
import { initSocketServer } from './utils/socket';
import authRoutes from './routes/authRoutes' // Import auth routes
import userRoutes from './routes/userRoutes' // Import user routes
import adminRoutes from './routes/adminRoutes' // Import admin routes
import appointmentRoutes from './routes/appointmentRoutes'; // Import appointment routes
import scheduleRouter from './routes/scheduleRoutes'; // Import schedule routes
import serviceRouter from './routes/serviceRoutes'; // Import service routes
import blogRoutes from './routes/blogRoutes';
import pharmacyRoutes from './routes/pharmacyRoutes';
import paymentRoutes from './routes/paymentRoutes';
import testRoutes from './routes/testRoutes';
import notificationRoutes from './routes/notificationRoutes'
import uploadRoutes from './routes/uploadRoutes'; // Import upload routes

interface MulterError extends Error {
  field?: string;
  code?: string;
}

const server = http.createServer(app) // 👈 quan trọng: tạo HTTP server từ app

const bootstrap = async () => {
  await mongo.connect()

  app.get('/', (req, res) => {
    res.status(200).send('Hello, world!')
  })

  app.get('/healthz', (req, res) => {
    res.status(204).end()
  })

  app.use('/user', userRoutes) // Use user routes
  app.use('/admin', adminRoutes) // Use admin routes
  app.use('/auth', authRoutes) // Use auth routes

  app.use('/appointment', appointmentRoutes); // Use appointment routes
  app.use('/pharmacy', pharmacyRoutes);
  app.use('/schedule', scheduleRouter); // Use schedule routes
  app.use('/blog', blogRoutes); // Use blog routes
  app.use('/service', serviceRouter); // Use service routes
  app.use('/payment', paymentRoutes); // Use payment routes
  app.use("/test", testRoutes); // Use test routes
  app.use('/notification', notificationRoutes);
  app.use('/upload', uploadRoutes); // Use upload routes
  app.use((error: MulterError, req: Request, res: Response, next: NextFunction) => {
    console.log('Trường bị từ chối ->', error);
    if (error.field) {
      console.log('Lỗi ở trường:', error.field);
    }
    res.status(400).json({ error: error.message });
  });

  // Kết nối socket
  // setupVideoCallSocket(server)
  initSocketServer(server)

  // Lắng nghe
  server.listen(PORT || 8080, () => {
    console.log(`✅ Server is listening on port: ${PORT || 8080}`)
  })
}

bootstrap()