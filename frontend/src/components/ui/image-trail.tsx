import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, useAnimationFrame } from "motion/react"
import { v4 as uuidv4 } from "uuid"
import { useMouseVector } from "@/components/hooks/use-mouse-vector"

type TrailSegment = [Record<string, any>, Record<string, any>]
type TrailAnimationSequence = TrailSegment[]

interface ImageTrailProps {
  children: React.ReactNode
  containerRef?: React.RefObject<HTMLElement | null>
  newOnTop?: boolean
  rotationRange?: number
  animationSequence?: TrailAnimationSequence
  interval?: number
  velocityDependentSpawn?: boolean
}

interface TrailItem {
  id: string
  x: number
  y: number
  rotation: number
  child: React.ReactNode
}

const ImageTrail = ({
  children,
  newOnTop = true,
  rotationRange = 15,
  containerRef,
  interval = 100,
}: ImageTrailProps) => {
  const [trail, setTrail] = useState<TrailItem[]>([])
  const lastAddedTimeRef = useRef<number>(0)
  const { position: mousePosition } = useMouseVector(containerRef)
  const lastMousePosRef = useRef(mousePosition)
  const currentIndexRef = useRef(0)
  const childrenArray = useMemo(() => Children.toArray(children), [children])

  const addToTrail = useCallback(
    (mousePos: { x: number; y: number }) => {
      const newItem: TrailItem = {
        id: uuidv4(),
        x: mousePos.x,
        y: mousePos.y,
        rotation: (Math.random() - 0.5) * rotationRange * 2,
        child: childrenArray[currentIndexRef.current],
      }
      currentIndexRef.current = (currentIndexRef.current + 1) % childrenArray.length
      setTrail((prev) => newOnTop ? [...prev, newItem] : [newItem, ...prev])
    },
    [childrenArray, rotationRange, newOnTop]
  )

  const removeFromTrail = useCallback((itemId: string) => {
    setTrail((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  useAnimationFrame((time) => {
    if (
      lastMousePosRef.current.x === mousePosition.x &&
      lastMousePosRef.current.y === mousePosition.y
    ) return

    if (time - lastAddedTimeRef.current < interval) return

    const dx = mousePosition.x - lastMousePosRef.current.x
    const dy = mousePosition.y - lastMousePosRef.current.y
    if (Math.sqrt(dx * dx + dy * dy) < 10) return

    lastMousePosRef.current = mousePosition
    lastAddedTimeRef.current = time
    addToTrail(mousePosition)
  })

  return (
    <div className="relative w-full h-full pointer-events-none">
      <AnimatePresence>
        {trail.map((item) => (
          <TrailItem key={item.id} item={item} onComplete={removeFromTrail} />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface TrailItemProps {
  item: TrailItem
  onComplete: (id: string) => void
}

const TRAIL_SCALE_VARIANTS = [1, 0.9, 1.1, 0.95] as const
const TRAIL_DURATION = 0.85

const TrailItem = ({ item, onComplete }: TrailItemProps) => {
  const mountedRef = useRef(true)
  const scaleVariant = useRef(TRAIL_SCALE_VARIANTS[Math.floor(Math.random() * TRAIL_SCALE_VARIANTS.length)]).current

  useEffect(() => {
    mountedRef.current = true
    // Remove after animation completes (enter + hold + exit)
    const timeout = setTimeout(() => {
      if (mountedRef.current) onComplete(item.id)
    }, TRAIL_DURATION * 1000)
    return () => {
      mountedRef.current = false
      clearTimeout(timeout)
    }
  }, [item.id, onComplete])

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        x: "-50%",
        y: "-50%",
        rotate: item.rotation,
      }}
      initial={{ opacity: 0, scale: 0.4, rotate: item.rotation - 10 }}
      animate={{ opacity: 1, scale: scaleVariant, rotate: item.rotation }}
      exit={{ opacity: 0, scale: 0.15, rotate: item.rotation + 12 }}
      transition={{ duration: TRAIL_DURATION, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full h-full flex items-center justify-center">
        {item.child}
      </div>
    </motion.div>
  )
}

export { ImageTrail }
