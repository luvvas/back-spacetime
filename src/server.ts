import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'

import { memoriesRoutes } from './routes/memories'
import { authRoute } from './routes/auth'

const app = fastify()

app.register(cors, {
  // origin: ['http://localhost:3000', 'https://urlDeProducao.com']
  origin: true
})

app.register(authRoute)
app.register(memoriesRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Http server running on https://localhost:3333')
  })
