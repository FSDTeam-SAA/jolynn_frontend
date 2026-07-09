"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger, TextPlugin } from "gsap/all"

gsap.registerPlugin(ScrollTrigger, TextPlugin)

// Parallax effect hook
export const useParallax = (strength = 0.5) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      y: (i, target) => {
        return (gsap.getProperty(target, "offsetHeight") as number) * strength
      },
      scrollTrigger: {
        trigger: ref.current,
        scrub: 1,
        markers: false,
      },
      ease: "none",
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [strength])

  return ref
}

// Counter animation hook
export const useCounterAnimation = (finalValue: number, duration = 2) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const obj = { value: 0 }

    gsap.to(obj, {
      value: finalValue,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.floor(obj.value).toString()
        }
      },
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [finalValue, duration])

  return ref
}

// Text reveal animation hook
export const useTextReveal = (staggerDelay = 0.05) => {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const text = ref.current.textContent || ""
    ref.current.innerHTML = text
      .split("")
      .map((char) => `<span class="inline-block">${char}</span>`)
      .join("")

    const chars = ref.current.querySelectorAll("span")

    gsap.from(chars, {
      opacity: 0,
      y: 30,
      stagger: staggerDelay,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [staggerDelay])

  return ref
}

// Blur reveal animation hook
export const useBlurReveal = () => {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.from(ref.current, {
      filter: "blur(10px)",
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return ref
}

// Pin animation hook (sticky section)
export const usePinSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    ScrollTrigger.create({
      trigger: ref.current,
      pin: true,
      pinSpacing: false,
      start: "top top",
      end: "bottom bottom",
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return ref
}

// Staggered children animation hook
export const useStaggerChildren = (duration = 0.6, delay = 0.1) => {
  const ref = useRef<HTMLDivElement>(null)
  const childrenRefs = useRef<HTMLElement[]>([])

  useEffect(() => {
    if (!ref.current) return

    const children = Array.from(ref.current.children) as HTMLElement[]
    childrenRefs.current = children

    gsap.from(children, {
      opacity: 0,
      y: 30,
      stagger: delay,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [duration, delay])

  return ref
}

// Hover scale animation hook
export const useHoverScale = (scale = 1.05) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale,
        duration: 0.3,
        overwrite: "auto",
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        overwrite: "auto",
      })
    }

    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [scale])

  return ref
}

// Scroll progress animation hook
export const useScrollProgress = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        scrub: true,
        start: "top 0%",
        end: "bottom 100%",
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return ref
}
