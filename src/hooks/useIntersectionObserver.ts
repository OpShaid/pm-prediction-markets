import { useEffect, useRef, useState } from 'react'

interface IntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export const useIntersectionObserver = (
  options: IntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
  const { threshold = 0.1, root = null, rootMargin = '0px' } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold, root, rootMargin }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, root, rootMargin])

  return [ref, isIntersecting]
}
