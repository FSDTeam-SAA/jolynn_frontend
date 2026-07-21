'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  // 🧠 Track mouse movement for subtle parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Entrance animation delay
    const timer = setTimeout(() => setIsLoaded(true), 100)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-4 text-primary">
      {/* 🔵 Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary opacity-30"
            style={{
              width: `${(i + 1) * 100}px`,
              height: `${(i + 1) * 100}px`,
              left: `calc(50% - ${(i + 1) * 50}px)`,
              top: `calc(50% - ${(i + 1) * 50}px)`,
              animationDuration: `${20 + i * 5}s`,
              animationDelay: `${i * 0.2}s`,
              animation: `pulse ${10 + i * 2}s infinite ease-in-out alternate`,
              transform: `
                translate(
                  ${mousePosition.x * (i + 1) * 10}px, 
                  ${mousePosition.y * (i + 1) * 10}px
                )
              `,
              transition: 'transform 0.3s ease-out',
            }}
          />
        ))}
      </div>

      {/* 🌟 Main Content */}
      <div
        className={`z-10 flex flex-col items-center text-center transition-all duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* 404 Title */}
        <div
          className="relative mb-8"
          style={{
            transform: `
              translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)
            `,
            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <h1 className="text-[8rem] sm:text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-primary">
            404 
          </h1>

          <div
            className="absolute -bottom-4 left-0 h-1 w-0 bg-primary transition-all duration-1000 ease-in-out"
            style={{
              width: isLoaded ? '100%' : '0%',
              animation: 'width-pulse 3s infinite alternate ease-in-out',
            }}
          />
        </div>

        {/* Subtitle */}
        <h2 className="mb-4 text-2xl font-bold text-primary sm:text-3xl">
          Page not found
        </h2>

        <p className="mb-8 max-w-md text-primary">
          The page you&#39;re looking for doesn&#39;t exist or has been moved.
        </p>

        {/* 🧭 Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* ✅ Fixed Back to Home Button (no React.Children.only error) */}
          <Button
            asChild
            className="group relative overflow-hidden bg-primary px-6 py-2 text-white transition-all"
            style={{
              transform: `
                translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)
              `,
              transition: 'transform 0.3s ease-out, background-color 0.3s ease',
            }}
          >
            <Link href="/">
              <div className="relative">
                <span className="relative z-10">Back to home</span>
                <span className="absolute bottom-0 left-0 h-0 w-full bg-primary transition-all duration-300 group-hover:h-full" />
              </div>
            </Link>
          </Button>

          {/* Go Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="group relative overflow-hidden border-primary px-6 py-2 text-primary transition-all hover:border-
            primary hover:text-primary flex items-center justify-center"
            style={{
              transform: `
                translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)
              `,
              transition:
                'transform 0.3s ease-out, border-color 0.3s ease, color 0.3s ease',
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Go back</span>
          </Button>
        </div>
      </div>

      {/* 🎬 Animation keyframes */}
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.05) rotate(5deg);
          }
        }

        @keyframes width-pulse {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}