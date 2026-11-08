import { StrictMode, useCallback, useRef, type CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

import Users from './users';

interface AudioProps {
  path: string
}

interface CardProps {
  content: string
}

interface WigglyTextProps {
  text: string,
  offset: number
}

function FormatWigglyChars(char: string, index: number) {

  const indexObj = { '--i': index };

  return (
    <span
      key={`${char}-${index}`}
      style = {indexObj as CSSProperties}
      className = {char == " " ? "space" : ""}
    >
      { char }
    </span>
  )
}

function WigglyText({ text, offset } : WigglyTextProps) {
  return (
    <h1 className = "wiggly-container">
      {text.split("").map((char, index) => (
        FormatWigglyChars(char, index + offset)
      ))}
    </h1>
  );
}

export function Card({ content }: CardProps) {
  return (
    <div className = "card">
      <WigglyText text = { content } offset = { 0 }/>
    </div>
  );
}

function AudioComponent({ path }: AudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleAudio = useCallback(() => {
    const audio = audioRef.current
    const button = buttonRef.current

    if (!audio || !button) return

    if (audio.paused) {
      void audio.play()
      button.textContent = 'Pause'
    } else {
      audio.pause()
      button.textContent = 'Play'
    }
  }, [])

  return (
    <div className = "audio-component">
      <audio ref={audioRef} id = "audio" src = { path }></audio>
      <button ref={buttonRef} id = "ctrl-button" onClick={handleAudio}>Play / Pause</button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <Card content = "cool wiggly text :D" /> */}
    <Users />
    {/* <AudioComponent path = "./src/audio/test_audio.wav"/> */}
  </StrictMode>
)
