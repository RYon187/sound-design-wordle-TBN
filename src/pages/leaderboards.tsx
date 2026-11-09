import React from "react";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import '../style.css'

interface TotalScoreInfo {
  user_id: number,
  username: string,
  total_score: number,
  num_submissions: number,
}

interface DailyScoreInfo {
  user_id: number, 
  username: string, 
  score: number
}

function TotalScoreCard({ scoreInfo }: { scoreInfo: TotalScoreInfo }) {
  return (
    <div>
      <Link to={`/profile/${scoreInfo.user_id}`}>{scoreInfo.username}</Link>
      {' has scored '}{scoreInfo.total_score} over {scoreInfo.num_submissions} submissions
    </div>
  );
}

function DailyScoreCard({ scoreInfo }: { scoreInfo: DailyScoreInfo }) {
  return (
    <div>
      <Link to={`/profile/${scoreInfo.user_id}`}>{scoreInfo.username}</Link>
      {' scored '}{scoreInfo.score} today
    </div>
  );
}

// Leaderboard for CUMULATIVE scores
function AllLeaderboard() {
  const [totalScores, setScores] = useState<TotalScoreInfo[]>([]);

  // Retrieve ALL total scores per user from the database 
  useEffect(() => {
    async function fetchAllScores() {
      try {
        const response = await fetch(
          'http://localhost:3000/scores'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch scores');
        }

        const data: TotalScoreInfo[] = await response.json();
        setScores(data);

      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    }

    fetchAllScores();
  }, []);

  return (
    <div>
      {totalScores.map(score => (
        <div key={score.user_id}>
          <TotalScoreCard scoreInfo={score} />
        </div>
      ))}
    </div>
  );
}

// Leaderboard for TODAY'S scores
function DailyLeaderboard() {
  const [dailyScores, setScores] = useState<DailyScoreInfo[]>([]);

  // Retrieve ALL total scores per user from the database 
  useEffect(() => {
    async function fetchAllScores() {
      try {
        const response = await fetch(
          'http://localhost:3000/scores/today'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch daily scores');
        }

        const data: DailyScoreInfo[] = await response.json();
        setScores(data);

      } catch (error) {
        console.error('Error fetching daily scores:', error);
      }
    }

    fetchAllScores();
  }, []);

  return (
    <div>
      {dailyScores.map((score, index) => (
        <div key={`${score.user_id}-${index}`}>
          <DailyScoreCard scoreInfo={score} />
        </div>
      ))}
    </div>
  );
}

function Leaderboards() {
  return (
    <main>
      <h1>Leaderboards</h1>
      <h2>Today:</h2>
      <DailyLeaderboard />
      <h2>Total:</h2>
      <AllLeaderboard />
    </main>
  );
}

export default Leaderboards;