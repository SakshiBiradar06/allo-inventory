// import { NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const reservation = await prisma.reservation.findUnique({
//       where: { id: params.id },
//       include: {
//         product: true,
//         warehouse: true
//       }
//     })
//     if (!reservation) {
//       return NextResponse.json({ error: 'Not found' }, { status: 404 })
//     }
//     return NextResponse.json(reservation)
//   } catch (error) {
//     return NextResponse.json({ error: 'Server error' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { product: true, warehouse: true }
    })
    if (!reservation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(reservation)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}