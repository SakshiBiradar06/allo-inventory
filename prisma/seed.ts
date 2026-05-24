import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const mumbai = await prisma.warehouse.create({
    data: { name: 'Mumbai Warehouse', location: 'Mumbai' }
  })
  const delhi = await prisma.warehouse.create({
    data: { name: 'Delhi Warehouse', location: 'Delhi' }
  })

  const nike = await prisma.product.create({
    data: { name: 'Nike Air Max', price: 4999 }
  })
  const tshirt = await prisma.product.create({
    data: { name: 'Polo T-Shirt', price: 999 }
  })
  const watch = await prisma.product.create({
    data: { name: 'Casio Watch', price: 2499 }
  })

  await prisma.stockLevel.createMany({
    data: [
      { productId: nike.id, warehouseId: mumbai.id, total: 5, reserved: 0 },
      { productId: nike.id, warehouseId: delhi.id, total: 3, reserved: 0 },
      { productId: tshirt.id, warehouseId: mumbai.id, total: 10, reserved: 0 },
      { productId: tshirt.id, warehouseId: delhi.id, total: 8, reserved: 0 },
      { productId: watch.id, warehouseId: mumbai.id, total: 4, reserved: 0 },
    ]
  })

  console.log('✅ Seed data created!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())