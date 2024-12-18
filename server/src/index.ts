import dotenv from 'dotenv'
dotenv.config()

import app from './utils/app' // (server)
import mongo from './utils/mongo' // (database)
import { PORT } from './constants/index'
import authRoutes from './routes/auth'
import userRoutes from './routes/user' // Import user routes

const bootstrap = async () => {
  await mongo.connect()

  app.get('/', (req, res) => {
    res.status(200).send('Hello, world!')
  })

  app.get('/healthz', (req, res) => {
    res.status(204).end()
  })

  app.use('/user', userRoutes) // Use user routes
  app.use('/auth', authRoutes) // Use auth routes

  app.listen(PORT || 8080, () => {
    console.log(`✅ Server is listening on port: ${PORT || 8080}`)
  })
}

bootstrap()
