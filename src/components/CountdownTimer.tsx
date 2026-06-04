import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  batasSla: string | null;
  status: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ batasSla, status }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isOverdue: boolean } | null>(null);

  useEffect(() => {
    if (!batasSla) return;
    if (status === 'selesai_teknisi' || status === 'tertutup') {
      setTimeLeft(null); // SLA stops running when completed
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const limit = new Date(batasSla).getTime();
      const diff = limit - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isOverdue: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds, isOverdue: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [batasSla, status]);

  if (!batasSla) return <span className="text-slate-400 text-xs">-</span>;
  if (status === 'selesai_teknisi' || status === 'tertutup') {
    return <span className="text-emerald-600 text-xs font-bold border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded">Tercapai</span>;
  }

  if (!timeLeft) return null;

  if (timeLeft.isOverdue) {
    return (
      <span className="text-red-600 text-xs font-bold font-mono bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">
        OVERDUE
      </span>
    );
  }

  const isWarning = timeLeft.hours === 0 && timeLeft.minutes < 30;

  return (
    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
      isWarning ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }`}>
      {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
    </span>
  );
};

export default CountdownTimer;
