interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
  minimal?: boolean
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start typing...',
  height = 200,
  minimal = false 
}: RichTextEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 resize-none"
      style={{ height: `${height}px` }}
    />
  )
}