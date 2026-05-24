// import { NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'

// export async function POST(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const reservation = await prisma.reservation.findUnique({
//       where: { id: params.id }
//     })

//     if (!reservation) {
//       return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
//     }

//     if (reservation.status !== 'pending') {
//       return NextResponse.json({ error: 'Reservation is not pending' }, { status: 400 })
//     }

//     if (new Date() > reservation.expiresAt) {
//       // Release stock back
//       await prisma.stockLevel.update({
//         where: {
//           productId_warehouseId: {
//             productId: reservation.productId,
//             warehouseId: reservation.warehouseId
//           }
//         },
//         data: { reserved: { decrement: reservation.quantity } }
//       })
//       await prisma.reservation.update({
//         where: { id: params.id },
//         data: { status: 'released' }
//       })
//       return NextResponse.json({ error: 'Reservation has expired' }, { status: 410 })
//     }

//     const updated = await prisma.reservation.update({
//       where: { id: params.id },
//       data: { status: 'confirmed' }
//     })

//     return NextResponse.json(updated)
//   } catch (error) {
//     return NextResponse.json({ error: 'Server error' }, { status: 500 })
//   }
// }


import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }
    if (reservation.status !== 'pending') {
      return NextResponse.json({ error: 'Reservation is not pending' }, { status: 400 })
    }
    if (new Date() > reservation.expiresAt) {
      await prisma.stockLevel.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId
          }
        },
        data: { reserved: { decrement: reservation.quantity } }
      })
      await prisma.reservation.update({
        where: { id },
        data: { status: 'released' }
      })
      return NextResponse.json({ error: 'Reservation has expired' }, { status: 410 })
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'confirmed' }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}