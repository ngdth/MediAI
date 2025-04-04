import dotenv from 'dotenv'
dotenv.config()

import app from './utils/app' // (server)
import mongo from './config/mongo' // (database)
import { PORT } from './constants/index'
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
  app.listen(PORT || 8080, () => {
    console.log(`✅ Server is listening on port: ${PORT || 8080}`)
  })
}

bootstrap()