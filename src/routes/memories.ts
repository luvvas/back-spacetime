import { FastifyInstance } from "fastify";
import { z } from 'zod';

import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    return memories.map(memory => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...')
      }
    })
  })

  app.get('/memories/:id', async (req) => {
    // zod faz uma validação para saber se o objeto req.params
    // segue um schema
    const paramsSchema = z.object({
      id: z.string().uuid()
    })
    
    const { id } = paramsSchema.parse(req.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id
      }
    })

    return memory
  })

  app.post('/memories', async (req) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body);

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: '1b8dcd35-97d2-4d52-8c9b-684bf26a005b'
      }
    })

    return memory
  })

  app.put('/memories/:id', async (req) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })
    
    const { id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false)
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(req.body);

    const memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic
      }
    })

    return memory
  })

  app.delete('/memories/:id', async (req) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })
    
    const { id } = paramsSchema.parse(req.params);

    const memory = await prisma.memory.delete({
      where: {
        id
      }
    })
  })
}