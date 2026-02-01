'use client'

import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-off-white to-gray p-4">
      <div className="max-w-2xl w-full text-center ">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/assets/MTM_Logos.svg"
            alt="Tender Match Logo"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-black !mb-8 tracking-tight">
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-lg">
            Site Under Development
          </span>
        </h1>

        {/* Description */}
        <p className="!text-lg md:text-xl text-dark-gray leading-relaxed mx-auto my-4 ">
          We are crafting something extraordinary for you.
          Tender Match will be launching soon. Please check back later!
        </p>
      </div>
    </div>
  )
}
