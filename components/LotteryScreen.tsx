import React, { useState, useEffect, useRef } from 'react';
import { Participant, Prize, WinnersMap } from '../types';

interface LotteryScreenProps {
  participants: Participant[];
  currentPrize: Prize;
  winners: WinnersMap;
  isDrawing: boolean;
  onStart: () => void;
  onStop: () => void;
  lastWinner: Participant | null;
}

export const LotteryScreen: React.FC<LotteryScreenProps> = ({
  participants, currentPrize, winners, isDrawing, onStart, onStop, lastWinner
}) => {
  const [displayParticipant, setDisplayParticipant] = useState<Participant | null>(null);
  const animationRef = useRef<number>(0);
  
  // Get existing winners for this prize to display them
  const currentPrizeWinners = winners[currentPrize.id] || [];
  const remainingCount = currentPrize.count - currentPrizeWinners.length;

  useEffect(() => {
    if (isDrawing) {
      let lastTime = 0;
      const loop = (time: number) => {
        // Throttle updates to ~20fps (every 50ms) for a better slot machine look
        if (time - lastTime > 50) {
          const randomIdx = Math.floor(Math.random() * participants.length);
          setDisplayParticipant(participants[randomIdx]);
          lastTime = time;
        }
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // If we just stopped and have a winner, show them
      if (lastWinner) {
        setDisplayParticipant(lastWinner);
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDrawing, participants, lastWinner]);

  // Determine what to show in the center slot
  const centerContent = isDrawing 
    ? displayParticipant 
    : lastWinner 
      ? lastWinner // If we just won, show the winner
      : { name: 'READY', department: '点击开始抽奖', id: 'placeholder' } as Participant; // Default state

  const isWinnerState = !isDrawing && lastWinner && centerContent?.id === lastWinner.id;

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-6 w-full h-full overflow-hidden">
      
      {/* Prize Title */}
      <div className="absolute top-4 md:top-10 w-full text-center z-10 px-4">
        <div className="inline-block relative max-w-full group">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-neon-blue rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-fast"></div>
            <div className="relative px-6 py-2 md:px-10 md:py-4 bg-slate-900 rounded-lg border border-slate-600 shadow-2xl">
                <h2 className="text-xs md:text-xl text-neon-blue font-display tracking-widest uppercase mb-1">正在抽取</h2>
                <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white font-display drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] truncate max-w-[85vw] md:max-w-3xl">
                  {currentPrize.image} {currentPrize.name}
                </h1>
                <div className="mt-1 md:mt-2 text-slate-400 font-mono text-xs md:text-base">
                   剩余名额: <span className="text-neon-pink font-bold text-lg md:text-xl">{remainingCount}</span> / {currentPrize.count}
                </div>
            </div>
        </div>
      </div>

      {/* The Slot Machine / Main Display */}
      <div className="relative w-full max-w-3xl aspect-[16/9] flex items-center justify-center z-0 mt-12 md:mt-0">
        
        {/* Decorative Rings */}
        <div className={`absolute inset-0 border-[1px] border-slate-700 rounded-full scale-[1.2] opacity-20 transition-all duration-700 ${isDrawing ? 'animate-[spin_2s_linear_infinite]' : 'animate-[spin_10s_linear_infinite]'}`}></div>
        <div className={`absolute inset-0 border-[1px] border-neon-blue rounded-full scale-[1.1] opacity-20 transition-all duration-700 ${isDrawing ? 'animate-[spin_3s_linear_infinite_reverse]' : 'animate-[spin_15s_linear_infinite_reverse]'}`}></div>
        
        {/* Center Card */}
        <div className={`
           relative w-full max-w-[90vw] md:max-w-lg aspect-video bg-slate-900/90 backdrop-blur-xl border-2 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden
           ${isDrawing ? 'border-slate-500 scale-100' : ''}
           ${isWinnerState ? 'border-neon-pink shadow-[0_0_100px_rgba(255,0,255,0.5)] animate-winner-reveal z-20' : ''}
           ${!isDrawing && !isWinnerState ? 'border-slate-600' : ''}
        `}>
           <div className="text-4xl md:text-8xl mb-4 opacity-10 absolute top-2 right-2 md:top-4 md:right-4 font-mono select-none">
             {/* Background decorative ID */}
             {centerContent?.id.slice(0, 4)}
           </div>

           <div className={`
             px-4 text-4xl md:text-6xl lg:text-8xl font-black text-center font-sans tracking-tight break-words w-full
             ${isDrawing ? 'text-slate-300 blur-[1px]' : 'text-transparent bg-clip-text bg-gradient-to-br from-white to-neon-blue drop-shadow-lg'}
             ${isWinnerState ? 'scale-110 transition-transform duration-500' : ''}
           `}>
              {centerContent?.name}
           </div>
           
           <div className={`text-lg md:text-2xl lg:text-3xl mt-2 md:mt-4 font-light ${isDrawing ? 'text-slate-500' : 'text-neon-pink'}`}>
              {centerContent?.department}
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-16 md:bottom-20 z-20 w-full flex justify-center px-4">
        {remainingCount > 0 ? (
           <button 
             onClick={isDrawing ? onStop : onStart}
             className={`
               group relative w-full max-w-xs md:max-w-md px-6 py-4 md:px-12 md:py-6 text-xl md:text-2xl font-bold font-display tracking-widest uppercase transition-all transform hover:scale-105 active:scale-95
               ${isDrawing 
                 ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                 : 'bg-neon-blue hover:bg-cyan-400 text-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
               }
               clip-path-polygon
             `}
             style={{
               clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)'
             }}
           >
             {isDrawing ? 'STOP' : 'START SPIN'}
           </button>
        ) : (
          <div className="text-xl md:text-2xl text-slate-500 font-display bg-slate-900/80 px-4 py-2 rounded border border-slate-700">本轮抽奖已结束</div>
        )}
      </div>

      {/* Latest Winners Ticker for this prize */}
      {currentPrizeWinners.length > 0 && (
         <div className="absolute bottom-2 md:bottom-6 w-full max-w-5xl overflow-hidden pointer-events-none px-2 z-10">
            <div className="flex gap-2 md:gap-4 justify-center flex-wrap opacity-80">
               {currentPrizeWinners.map((w, i) => (
                 <div key={i} className="bg-slate-900/90 border border-neon-blue/30 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm text-slate-300 flex items-center gap-1 md:gap-2 animate-winner-reveal shadow-lg backdrop-blur-md">
                    <span className="text-neon-pink font-bold">#{i + 1}</span>
                    <span className="font-bold text-white max-w-[80px] md:max-w-xs truncate">{w.name}</span>
                 </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};