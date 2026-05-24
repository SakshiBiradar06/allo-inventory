import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: 'pending',
        expiresAt: { lt: new Date() }
      }
    })

    for (const r of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        await tx.stockLevel.update({
          where: {
            productId_warehouseId: {
              productId: r.productId,
              warehouseId: r.warehouseId
            }
          },
          data: { reserved: { decrement: r.quantity } }
        })
        await tx.reservation.update({
          where: { id: r.id },
          data: { status: 'released' }
        })
      })
    }

    return NextResponse.json({ released: expiredReservations.length })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}