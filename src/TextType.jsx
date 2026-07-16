import { useEffect, useState } from 'react'

export default function TextType({ text, speed = 54, startDelay = 220, className = '' }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    const startTimer = window.setTimeout(() => {
      let index = 0
      const typingTimer = window.setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))
        if (index >= text.length) window.clearInterval(typingTimer)
      }, speed)
    }, startDelay)

    return () => window.clearTimeout(startTimer)
  }, [text, speed, startDelay])

  return (
    <span className={`text-type ${className}`}>
      {displayed}
      <span className="text-type-caret" aria-hidden="true" />
    </span>
  )
}
