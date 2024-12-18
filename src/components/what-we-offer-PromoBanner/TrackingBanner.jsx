import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, Package, ShoppingBag, Timer, Truck } from 'lucide-react'
import { FaFileInvoice } from "react-icons/fa";
import { RiEBikeFill } from "react-icons/ri";



const Illustration = ({ children }) => (
  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white/10 rounded-full flex items-center justify-center">
    {children}
  </div>
)

export default function TrackingBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)
  
  const banners = [
   
    {
      icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
      title: "Order Ahead",
      description: "Skip the wait! Order before you arrive",
      illustration: (
        <Illustration>
          <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </Illustration>
      )
    },
    {
      icon: <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
      title: "Real-Time Tracking",
      description: "Watch your order status live",
      illustration: (
        <Illustration>
          <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </Illustration>
      )
    },
    {
      icon: <RiEBikeFill className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
      title: "Delivery Tracking",
      description: "Know when your order is out for delivery",
      illustration: (
        <Illustration>
        <img
          src="/trackeranime/dispatch (4).gif"
          alt="Invoice Icon"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white/80"
        />
      </Illustration>
      )
    },
    {
      icon: <Timer className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
      title: "Precise Timing",
      description: "Know exactly when your food will be ready",
      illustration: (
        <Illustration>
          <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        </Illustration>
      )
    },
    {
      icon: <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
      title: "Seamless Pickup",
      description: "Grab your order and enjoy!",
      illustration: (
        <Illustration>
          <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </Illustration>
      )
    },
    
    {
      icon: <FaFileInvoice className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />,
      title: "Invoice Download",
      description: "Download your invoice after your order is confirmed.",
      illustration: (
        <Illustration>
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-white/80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <path d="M9 8h6" />
          <path d="M9 12h4" />
        </svg>
      </Illustration>
      
      )
    }, 
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
<div className="relative overflow-hidden bg-gradient-to-r from-[#AF6E1C] to-[#C49402] text-white rounded-[10px]">
      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4 md:py-6">
        <div className="relative h-24 sm:h-28 md:h-32">
          {banners.map((banner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100 }}
              animate={{
                opacity: currentBanner === index ? 1 : 0,
                x: currentBanner === index ? 0 : 100,
              }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 flex items-center justify-between ${
                currentBanner === index ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 md:gap-4 max-w-[70%] sm:max-w-[75%]">
                <div className="rounded-full bg-white/20 p-1 sm:p-2">
                  {banner.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base md:text-xl font-semibold">{banner.title}</h3>
                  <p className="text-xs sm:text-sm text-white/90">{banner.description}</p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {banner.illustration}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="absolute bottom-1 md:bottom-2 left-1/2 flex -translate-x-1/2 transform gap-1 md:gap-2">
          {banners.map((_, index) => (
            <motion.div
              key={index}
              className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-white/50"
              animate={{
                scale: currentBanner === index ? 1.5 : 1,
                backgroundColor: currentBanner === index ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}




// import React, { useEffect, useState } from "react"
// import { motion } from "framer-motion"
// import { Clock, Package, ShoppingBag, Timer, Truck } from 'lucide-react'

// const Illustration = ({ children }) => (
//   <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full flex items-center justify-center">
//     {children}
//   </div>
// )

// export default function TrackingBanner() {
//   const [currentBanner, setCurrentBanner] = useState(0)
  
//   const banners = [
//     {
//       icon: <Clock className="h-6 w-6 md:h-8 md:w-8" />,
//       title: "Order Ahead",
//       description: "Skip the wait! Order before you arrive",
//       illustration: (
//         <Illustration>
//           <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
//             <circle cx="12" cy="12" r="10" />
//             <path d="M12 6v6l4 2" />
//           </svg>
//         </Illustration>
//       )
//     },
//     {
//       icon: <ShoppingBag className="h-6 w-6 md:h-8 md:w-8" />,
//       title: "Real-Time Tracking",
//       description: "Watch your order status live",
//       illustration: (
//         <Illustration>
//           <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
//             <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//           </svg>
//         </Illustration>
//       )
//     },
//     {
//       icon: <Timer className="h-6 w-6 md:h-8 md:w-8" />,
//       title: "Precise Timing",
//       description: "Know exactly when your food will be ready",
//       illustration: (
//         <Illustration>
//           <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
//             <circle cx="12" cy="12" r="10" />
//             <path d="M12 8v4l3 3" />
//           </svg>
//         </Illustration>
//       )
//     },
//     {
//       icon: <Package className="h-6 w-6 md:h-8 md:w-8" />,
//       title: "Seamless Pickup",
//       description: "Grab your order and enjoy!",
//       illustration: (
//         <Illustration>
//           <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
//             <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
//           </svg>
//         </Illustration>
//       )
//     },
//     {
//       icon: <Truck className="h-6 w-6 md:h-8 md:w-8" />,
//       title: "Delivery Tracking",
//       description: "Know when your order is out for delivery",
//       illustration: (
//         <Illustration>
//           <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 text-white/80" fill="none" stroke="currentColor">
//             <path d="M3 3h18v18H3z" />
//             <path d="M3 9h18" />
//             <path d="M3 15h18" />
//             <path d="M12 3v18" />
//           </svg>
//         </Illustration>
//       )
//     }
//   ]

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentBanner((prev) => (prev + 1) % banners.length)
//     }, 5000)
//     return () => clearInterval(timer)
//   }, [])

//   return (
//     <div className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-[10px]">
//     <div className="relative mx-auto max-w-7xl px-4 py-3 md:py-6">
//         <div className="relative h-20 md:h-32">
//           {banners.map((banner, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, x: 100 }}
//               animate={{
//                 opacity: currentBanner === index ? 1 : 0,
//                 x: currentBanner === index ? 0 : 100,
//               }}
//               transition={{ duration: 0.5 }}
//               className={`absolute inset-0 flex items-center justify-between ${
//                 currentBanner === index ? "pointer-events-auto" : "pointer-events-none"
//               }`}
//             >
//               <div className="flex items-center gap-2 md:gap-4">
//                 <div className="rounded-full bg-white/20 p-1 md:p-2">
//                   {banner.icon}
//                 </div>
//                 <div className="text-left">
//                   <h3 className="text-base md:text-xl font-semibold">{banner.title}</h3>
//                   <p className="text-xs md:text-sm text-white/90">{banner.description}</p>
//                 </div>
//               </div>
//               <motion.div
//                 initial={{ scale: 0.8, rotate: -10 }}
//                 animate={{ scale: 1, rotate: 0 }}
//                 transition={{ duration: 0.5, delay: 0.2 }}
//                 className="hidden md:block"
//               >
//                 {banner.illustration}
//               </motion.div>
//             </motion.div>
//           ))}
//         </div>
//         <div className="absolute bottom-1 md:bottom-2 left-1/2 flex -translate-x-1/2 transform gap-1 md:gap-2">
//           {banners.map((_, index) => (
//             <motion.div
//               key={index}
//               className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-white/50"
//               animate={{
//                 scale: currentBanner === index ? 1.5 : 1,
//                 backgroundColor: currentBanner === index ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)"
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

