import { useEffect, useRef, useState } from 'react'

export default function SplitText({ text, className = '', triggerOnView = false }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(!triggerOnView)

  useEffect(() => {
    if (!triggerOnView || isVisible || !ref.current) return undefined

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.2 }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [isVisible, triggerOnView])

  return (
    <span ref={ref} className={`split-text ${isVisible ? 'is-visible' : ''} ${className}`} aria-label={text}>
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
