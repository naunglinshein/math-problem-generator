import React from 'react'

interface LoadingSpinnerProps {
  text?: string
}

export default function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg
        className="animate-spin h-5 w-5 text-white"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
        />
      </svg>
      {text && <span>{text}</span>}
    </span>
  )
}
