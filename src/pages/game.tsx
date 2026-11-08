import React, { useState } from "react";
import { StrictMode, useCallback, useRef, type CSSProperties } from 'react'
import { AuthProvider, useAuth } from '../auth_context';

import '../style.css'

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

function Game() {

  const { user } = useAuth();

  const [score, setScore] = useState<number | null>(null);

  // Submit a score to Postgres
  async function handleSubmit(scoreToSubmit: number) {

    if (!user) {
      console.error('Create an account to submit scores!');
      return;
    }

    try {

      const user_id: number = user.id;

      console.log('Submitting score:', user_id, scoreToSubmit);

      const response = await fetch('http://localhost:3000/scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, score: scoreToSubmit })
      });

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit score');
      }

      console.log('Score successfully added:', data);

    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }
  
  const submitHandle = () => {
    const newScore = Math.floor(Math.random() * 500);
    setScore(newScore);
    void handleSubmit(newScore);
  };

  return (
    <StrictMode>
      <Card content = "Daily Sound Design" />
      <button onClick={submitHandle}>
        SUBMIT!
      </button>

      <h2>Score: {score}</h2>
    </StrictMode>
  );
}

export default Game;