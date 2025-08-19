'use client'

interface RichTextDisplayProps {
  content: string
  className?: string
}

export default function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  if (!content) return null

  // Convert markdown-like syntax to HTML
  const processContent = (text: string): string => {
    return text
      // Convert **text** to <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert line breaks
      .replace(/\n/g, '<br>')
      // Convert numbered lists (1. item)
      .replace(/^(\d+\.\s)/gm, '<br>$1')
      // Add paragraph breaks for double line breaks
      .replace(/\n\n/g, '<br><br>')
  }

  const processedContent = processContent(content)

  return (
    <>
      <div 
        className={`rich-text-display ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
      />
      <style jsx>{`
        .rich-text-display {
          color: #d1d5db;
        }
        .rich-text-display p {
          margin-bottom: 1em;
        }
        .rich-text-display strong {
          font-weight: 600;
          color: #ffffff;
        }
        .rich-text-display h1, .rich-text-display h2, .rich-text-display h3 {
          color: #ffffff;
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-display h1 {
          font-size: 1.5em;
        }
        .rich-text-display h2 {
          font-size: 1.3em;
        }
        .rich-text-display h3 {
          font-size: 1.1em;
        }
        .rich-text-display ul, .rich-text-display ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .rich-text-display li {
          margin-bottom: 0.5em;
        }
        .rich-text-display br {
          content: "";
          margin: 0.5em 0;
          display: block;
        }
      `}</style>
    </>
  )
}