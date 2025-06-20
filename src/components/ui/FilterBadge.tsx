import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const filterBadgeVariants = cva(
  "inline-flex items-center bg-background text-sm text-muted-foreground border transition-colors",
  {
    variants: {
      variant: {
        default: "rounded-md gap-x-2 py-1 pl-3 pr-1",
        pill: "rounded-full gap-x-2 py-1 pl-3 pr-1",
        avatar: "rounded-full gap-2 px-1 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface FilterBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof filterBadgeVariants> {
  label?: string
  value?: string
  avatar?: string
  children?: React.ReactNode
  onRemove?: () => void
}

export function FilterBadge({
  className,
  variant,
  label,
  value,
  avatar,
  children,
  onRemove,
  ...props
}: FilterBadgeProps) {
  if (variant === "avatar") {
    return (
      <span className={cn(filterBadgeVariants({ variant }), className)} {...props}>
        {avatar && (
          <img
            className="inline-block size-5 rounded-full"
            src={avatar}
            alt=""
          />
        )}
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Remove"
          >
            <X className="size-3 shrink-0" />
          </button>
        )}
      </span>
    )
  }

  return (
    <span className={cn(filterBadgeVariants({ variant }), className)} {...props}>
      {label && (
        <>
          <span className="text-muted-foreground">{label}</span>
          <span className="h-4 w-px bg-border" />
        </>
      )}
      <span className="font-medium text-foreground">
        {value || children}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "-ml-1 flex size-5 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground",
            variant === "pill" ? "rounded-full" : "rounded"
          )}
          aria-label="Remove"
        >
          <X className="size-3 shrink-0" />
        </button>
      )}
    </span>
  )
}