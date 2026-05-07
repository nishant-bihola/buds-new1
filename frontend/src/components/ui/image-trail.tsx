import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, useAnimationFrame } from "motion/react"
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
      {trail.map((item) => (
        <TrailItem key={item.id} item={item} onComplete={removeFromTrail} />
      ))}
    </div>
  )
}

interface TrailItemProps {
  item: TrailItem
  onComplete: (id: string) => void
}

const TrailItem = ({ item, onComplete }: TrailItemProps) => {
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Use CSS animation instead of motion/react animate() to avoid null-ref crash
  const onAnimationEnd = useCallback(() => {
    if (mountedRef.current) {
      onComplete(item.id)
    }
  }, [item.id, onComplete])

  return (
    <div
      className="trail-item-animate absolute w-16 h-16 pointer-events-none"
      style={
        {
          left: `${item.x}px`,
          top: `${item.y}px`,
          "--trail-rotate": `${item.rotation}deg`,
        } as React.CSSProperties
      }
      onAnimationEnd={onAnimationEnd}
    >
      <div className="w-full h-full flex items-center justify-center">
        {item.child}
      </div>
    </div>
  )
}

export { ImageTrail }
