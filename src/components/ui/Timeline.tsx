import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface TimelineEntry {
  title: string
  content: React.ReactNode
}

interface TimelineProps {
  data: TimelineEntry[]
}

export const Timeline: React.FC<TimelineProps> = ({ data }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)

  React.useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div className="w-full font-sans" ref={containerRef}>
      <div ref={ref} className="relative max-w-2xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-2 gap-4">
            <div className="sticky flex flex-col z-40 items-start top-16 self-start w-[6%] pl-4 -mb-2">
              <h3 className="text-sm font-bold text-muted-foreground mb-2 whitespace-nowrap">
                {item.title === "Today" ? "Today" : 
                 item.title.includes("June") ? item.title.replace("June ", "") + " June" : 
                 item.title}
              </h3>
            </div>

            <div className="relative -ml-2 w-[96%] mt-6">
              {item.content}
            </div>
          </div>
        ))}
        
        <div
          style={{ height: height + "px" }}
          className="absolute left-[calc(6%+12px)] top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-border/30 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-primary/40 via-primary/30 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  )
}