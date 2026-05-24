import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().min(1)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId, warehouseId, quantity } = schema.parse(body)

    const reservation = await prisma.$transaction(async (tx: any) => {
      // Lock the row - prevents race conditions!
      const stocks = await tx.$queryRawUnsafe<any[]>(
        `SELECT * FROM "StockLevel" WHERE "productId" = $1 AND "warehouseId" = $2 FOR UPDATE`,
        productId,
        warehouseId
      )

      if (!stocks || stocks.length === 0) {
        throw new Error('STOCK_NOT_FOUND')
      }

      const stock = stocks[0]
      const available = stock.total - stock.reserved

      if (available < quantity) {
        throw new Error('NOT_ENOUGH_STOCK')
      }

      await tx.stockLevel.update({
        where: {
          productId_warehouseId: { productId, warehouseId }
        },
        data: { reserved: { increment: quantity } }
      })

      return await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: 'pending',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        },
        include: {
          product: true,
          warehouse: true
        }
      })
    })

    return NextResponse.json(reservation)
  } catch (error: any) {
    if (error.message === 'NOT_ENOUGH_STOCK') {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 409 })
    }
    if (error.message === 'STOCK_NOT_FOUND') {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}