import dotenv from 'dotenv'
dotenv.config()

import app from './utils/app' // (server)
import mongo from './config/mongo' // (database)
import { PORT } from './constants/index'
// import authRoutes from './routes/userRoutes'
import userRoutes from './routes/userRoutes' // Import user routes
import adminRoutes from './routes/adminRoutes' // Import admin routes
import appointmentRoutes from './routes/appointmentRouter'; // Import appointment routes
import scheduleRouter from './routes/scheduleRouter'; // Import schedule routes
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
  // app.use('/auth', authRoutes) // Use auth routes

  app.use('/api', appointmentRoutes); // Use appointment routes
  app.use('/api', scheduleRouter); // Use schedule routes
  app.listen(PORT || 8080, () => {
    console.log(`✅ Server is listening on port: ${PORT || 8080}`)
  })
}

bootstrap()
