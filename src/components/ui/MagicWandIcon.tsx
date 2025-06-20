import React from 'react'

interface MagicWandIconProps {
  className?: string
}

export function MagicWandIcon({ className = "h-3 w-3" }: MagicWandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Simple sparkle/star icon */}
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" fill="currentColor" />
      <path d="M19 4L19.5 6L21 6.5L19.5 7L19 9L18.5 7L17 6.5L18.5 6Z" fill="currentColor" opacity="0.7" />
      <path d="M6 2L6.5 3.5L8 4L6.5 4.5L6 6L5.5 4.5L4 4L5.5 3.5Z" fill="currentColor" opacity="0.6" />
    </svg>
  )
}