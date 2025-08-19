'use client'

interface RichTextDisplayProps {
  content: string
  className?: string
}

export default function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  if (!content) return null

  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#1f2937'
      }}
    />
  )
}