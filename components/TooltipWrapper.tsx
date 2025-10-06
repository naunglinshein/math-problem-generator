import React from 'react'

interface TooltipWrapperProps {
  text: string
  show?: boolean
  children: React.ReactNode
}

export default function TooltipWrapper({ text, show = false, children }: TooltipWrapperProps) {
    if (!show) return <>{children}</>

  return (
    <div className="relative group w-full inline-block">
      {children}
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                   bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap z-10"
      >
        {text}
      </span>
    </div>
  )
}
