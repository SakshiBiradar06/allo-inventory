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

//     await prisma.$transaction(async (tx) => {
//       await tx.stockLevel.update({
//         where: {
//           productId_warehouseId: {
//             productId: reservation.productId,
//             warehouseId: reservation.warehouseId
//           }
//         },
//         data: { reserved: { decrement: reservation.quantity } }
//       })

//       await tx.reservation.update({
//         where: { id: params.id },
//         data: { status: 'released' }
//       })
//     })

//     return NextResponse.json({ message: 'Reservation released' })
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

    await prisma.$transaction(async (tx) => {
      await tx.stockLevel.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId
          }
        },
        data: { reserved: { decrement: reservation.quantity } }
      })
      await tx.reservation.update({
        where: { id },
        data: { status: 'released' }
      })
    })

    return NextResponse.json({ message: 'Reservation released' })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}