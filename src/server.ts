import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

import { authRoute } from './routes/auth'
import { memoriesRoutes } from './routes/memories'
import { uploadRoutes } from './routes/upload'

const app = fastify()

app.register(multipart)

app.register(cors, {
  // origin: ['http://localhost:3000', 'https://urlDeProducao.com']
  origin: true
})

app.register(jwt, {
  // secret: 'f12398h348yifber2238dy48fgh37fdhsn38e7d34'
  secret: 'spacetime'
})

app.register(authRoute)
app.register(memoriesRoutes)
app.register(uploadRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Http server running on https://localhost:3333')
  })
