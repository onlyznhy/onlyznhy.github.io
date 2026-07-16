export default function SplitText({ text, className = '' }) {
  return (
    <span className={`split-text ${className}`} aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span
          className="split-char"
          aria-hidden="true"
          key={`${char}-${index}`}
          style={{ '--char-index': index }}
        >
          {char === ' ' ? '\u00a0' : char}
        </span>
      ))}
    </span>
  )
}
