// 'use client'
// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'

// type Reservation = {
//   id: string
//   status: string
//   expiresAt: string
//   quantity: number
//   product: { name: string; price: number }
//   warehouse: { name: string; location: string }
// }

// export default function ReservationPage({ params }: { params: { id: string } }) {
//   const [reservation, setReservation] = useState<Reservation | null>(null)
//   const [timeLeft, setTimeLeft] = useState<number>(0)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [actionLoading, setActionLoading] = useState(false)
//   const router = useRouter()

//   useEffect(() => {
//     fetch(`/api/reservations/${params.id}`)
//       .then(r => r.json())
//       .then(data => {
//         setReservation(data)
//         const expires = new Date(data.expiresAt).getTime()
//         setTimeLeft(Math.max(0, expires - Date.now()))
//       })
//       .finally(() => setLoading(false))
//   }, [params.id])

//   useEffect(() => {
//     if (timeLeft <= 0) return
//     const interval = setInterval(() => {
//       setTimeLeft(prev => Math.max(0, prev - 1000))
//     }, 1000)
//     return () => clearInterval(interval)
//   }, [timeLeft])

//   async function handleConfirm() {
//     setActionLoading(true)
//     setError(null)
//     const res = await fetch(`/api/reservations/${params.id}/confirm`, { method: 'POST' })
//     const data = await res.json()
//     if (res.status === 410) {
//       setError('❌ Reservation expired! The item has been released back to stock.')
//       setActionLoading(false)
//       return
//     }
//     if (!res.ok) {
//       setError('Something went wrong.')
//       setActionLoading(false)
//       return
//     }
//     setReservation(prev => prev ? { ...prev, status: 'confirmed' } : prev)
//     setActionLoading(false)
//   }

//   async function handleCancel() {
//     setActionLoading(true)
//     setError(null)
//     const res = await fetch(`/api/reservations/${params.id}/release`, { method: 'POST' })
//     if (!res.ok) {
//       setError('Something went wrong.')
//       setActionLoading(false)
//       return
//     }
//     setReservation(prev => prev ? { ...prev, status: 'released' } : prev)
//     setActionLoading(false)
//   }

//   const minutes = Math.floor(timeLeft / 60000)
//   const seconds = Math.floor((timeLeft % 60000) / 1000)
//   const isExpired = timeLeft === 0

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <p className="text-gray-500">Loading reservation...</p>
//     </div>
//   )

//   if (!reservation) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <p className="text-red-500">Reservation not found.</p>
//     </div>
//   )

//   return (
//     <main className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-md mx-auto">
//         <button onClick={() => router.push('/')} className="text-blue-600 mb-6 flex items-center gap-1">
//           ← Back to products
//         </button>

//         <div className="bg-white rounded-xl shadow-sm border p-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-6">🛒 Checkout</h1>

//           {/* Product details */}
//           <div className="bg-gray-50 rounded-lg p-4 mb-6">
//             <p className="font-semibold text-lg">{reservation.product.name}</p>
//             <p className="text-blue-600 font-bold text-xl">₹{reservation.product.price.toLocaleString()}</p>
//             <p className="text-gray-500 text-sm mt-1">{reservation.warehouse.name} · {reservation.warehouse.location}</p>
//             <p className="text-gray-500 text-sm">Quantity: {reservation.quantity}</p>
//           </div>

//           {/* Status */}
//           {reservation.status === 'confirmed' && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
//               <p className="text-green-700 font-bold text-lg">✅ Purchase Confirmed!</p>
//               <p className="text-green-600 text-sm mt-1">Your order has been placed successfully.</p>
//             </div>
//           )}

//           {reservation.status === 'released' && (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
//               <p className="text-gray-700 font-bold text-lg">❌ Reservation Cancelled</p>
//               <p className="text-gray-500 text-sm mt-1">Item has been released back to stock.</p>
//             </div>
//           )}

//           {/* Countdown timer */}
//           {reservation.status === 'pending' && (
//             <div className={`rounded-lg p-4 mb-6 text-center ${isExpired ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
//               {isExpired ? (
//                 <p className="text-red-600 font-bold">⏰ Reservation Expired!</p>
//               ) : (
//                 <>
//                   <p className="text-gray-600 text-sm mb-1">Time remaining to complete payment</p>
//                   <p className="text-3xl font-bold text-blue-600">
//                     {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
//                   </p>
//                 </>
//               )}
//             </div>
//           )}

//           {/* Error message */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
//               {error}
//             </div>
//           )}

//           {/* Action buttons */}
//           {reservation.status === 'pending' && !isExpired && (
//             <div className="flex gap-3">
//               <button
//                 onClick={handleConfirm}
//                 disabled={actionLoading}
//                 className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
//               >
//                 {actionLoading ? 'Processing...' : '✅ Confirm Purchase'}
//               </button>
//               <button
//                 onClick={handleCancel}
//                 disabled={actionLoading}
//                 className="flex-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-700 py-3 rounded-lg font-semibold transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}

//           {(reservation.status === 'confirmed' || reservation.status === 'released') && (
//             <button
//               onClick={() => router.push('/')}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
//             >
//               Back to Shop
//             </button>
//           )}
//         </div>
//       </div>
//     </main>
//   )
// }



'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Reservation = {
  id: string
  status: string
  expiresAt: string
  quantity: number
  product: { name: string; price: number }
  warehouse: { name: string; location: string }
}

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then(r => r.json())
      .then(data => {
        setReservation(data)
        const expires = new Date(data.expiresAt).getTime()
        setTimeLeft(Math.max(0, expires - Date.now()))
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  async function handleConfirm() {
    setActionLoading(true)
    setError(null)
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' })
    if (res.status === 410) {
      setError('❌ Reservation expired! The item has been released back to stock.')
      setActionLoading(false)
      return
    }
    if (!res.ok) {
      setError('Something went wrong.')
      setActionLoading(false)
      return
    }
    setReservation(prev => prev ? { ...prev, status: 'confirmed' } : prev)
    setActionLoading(false)
  }

  async function handleCancel() {
    setActionLoading(true)
    setError(null)
    const res = await fetch(`/api/reservations/${id}/release`, { method: 'POST' })
    if (!res.ok) {
      setError('Something went wrong.')
      setActionLoading(false)
      return
    }
    setReservation(prev => prev ? { ...prev, status: 'released' } : prev)
    setActionLoading(false)
  }

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const isExpired = timeLeft === 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading reservation...</p>
    </div>
  )

  if (!reservation) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Reservation not found.</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.push('/')} className="text-blue-600 mb-6 flex items-center gap-1">
          ← Back to products
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🛒 Checkout</h1>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-semibold text-lg">{reservation.product.name}</p>
            <p className="text-blue-600 font-bold text-xl">₹{reservation.product.price.toLocaleString()}</p>
            <p className="text-gray-500 text-sm mt-1">{reservation.warehouse.name} · {reservation.warehouse.location}</p>
            <p className="text-gray-500 text-sm">Quantity: {reservation.quantity}</p>
          </div>

          {reservation.status === 'confirmed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-green-700 font-bold text-lg">✅ Purchase Confirmed!</p>
              <p className="text-green-600 text-sm mt-1">Your order has been placed successfully.</p>
            </div>
          )}

          {reservation.status === 'released' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-gray-700 font-bold text-lg">❌ Reservation Cancelled</p>
              <p className="text-gray-500 text-sm mt-1">Item has been released back to stock.</p>
            </div>
          )}

          {reservation.status === 'pending' && (
            <div className={`rounded-lg p-4 mb-6 text-center ${isExpired ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              {isExpired ? (
                <p className="text-red-600 font-bold">⏰ Reservation Expired!</p>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-1">Time remaining to complete payment</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {reservation.status === 'pending' && !isExpired && (
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {actionLoading ? 'Processing...' : '✅ Confirm Purchase'}
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {(reservation.status === 'confirmed' || reservation.status === 'released') && (
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              Back to Shop
            </button>
          )}
        </div>
      </div>
    </main>
  )
}