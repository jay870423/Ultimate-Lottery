import React, { useState, useEffect, useRef } from 'react';
import { AppState, Participant, Prize, WinnersMap, RiggedMap } from './types';
import { MOCK_PARTICIPANTS, DEFAULT_PRIZES } from './constants';
import { pickWinner, triggerConfetti } from './utils/lotteryUtils';
import { LotteryScreen } from './components/LotteryScreen';
import { AdminPanel } from './components/AdminPanel';

// Sound Assets
const SOUND_URLS = {
  spin: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3', // Drum roll
  win: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',  // Fanfare / Applause
};

const App: React.FC = () => {
  // State
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [winners, setWinners] = useState<WinnersMap>({});
  const [riggedMatches, setRiggedMatches] = useState<RiggedMap>({});
  const [currentPrizeId, setCurrentPrizeId] = useState<string>(DEFAULT_PRIZES[0].id);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [lastWinner, setLastWinner] = useState<Participant | null>(null);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    spinAudioRef.current = new Audio(SOUND_URLS.spin);
    spinAudioRef.current.loop = true; // Loop the spin sound
    
    winAudioRef.current = new Audio(SOUND_URLS.win);
    
    // Cleanup
    return () => {
      spinAudioRef.current?.pause();
      winAudioRef.current?.pause();
    };
  }, []);

  // Handle Mute Toggle
  useEffect(() => {
    if (spinAudioRef.current) spinAudioRef.current.muted = isMuted;
    if (winAudioRef.current) winAudioRef.current.muted = isMuted;
  }, [isMuted]);

  // Derived
  const currentPrizeIndex = prizes.findIndex(p => p.id === currentPrizeId);
  const currentPrize = prizes[currentPrizeIndex] || prizes[0];

  const handleStart = () => {
    setIsDrawing(true);
    setLastWinner(null);
    
    // Play Spin Sound
    if (spinAudioRef.current) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.play().catch(e => console.warn("Audio play blocked:", e));
    }
  };

  const handleStop = () => {
    // Stop Spin Sound
    if (spinAudioRef.current) {
      spinAudioRef.current.pause();
      spinAudioRef.current.currentTime = 0;
    }

    // Determine winner
    const winner = pickWinner(participants, winners, currentPrize.id, riggedMatches);
    
    if (winner) {
      setLastWinner(winner);
      setWinners(prev => ({
        ...prev,
        [currentPrize.id]: [...(prev[currentPrize.id] || []), winner]
      }));
      triggerConfetti();
      
      // Play Win Sound
      if (winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(e => console.warn("Audio play blocked:", e));
      }
    } else {
      alert('没有更多参与者了!');
    }
    
    setIsDrawing(false);
  };

  const handleReset = () => {
    if (confirm("确定要重置所有中奖记录吗？")) {
      setWinners({});
      setLastWinner(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden flex flex-col relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black">
      
      {/* Background Grid Animation */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      {/* Navbar / Prize Selector */}
      <header className="z-40 h-16 md:h-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur flex items-center px-4 md:px-6 justify-between shrink-0">
         <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-neon-blue to-neon-purple rounded-lg flex items-center justify-center font-bold text-lg md:text-xl font-display shadow-[0_0_15px_rgba(189,0,255,0.5)]">
              N
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-wider hidden md:block font-display">NEON<span className="text-neon-blue">LUCK</span></h1>
         </div>

         <div className="flex-1 max-w-[50vw] md:max-w-3xl mx-2 md:mx-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {prizes.map((p) => {
                const isSelected = p.id === currentPrizeId;
                const winnerCount = (winners[p.id] || []).length;
                const isComplete = winnerCount >= p.count;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (!isDrawing) {
                        setCurrentPrizeId(p.id);
                        setLastWinner(null);
                      }
                    }}
                    disabled={isDrawing}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all whitespace-nowrap
                      ${isSelected 
                        ? 'bg-neon-blue/10 border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(0,255,255,0.3)]' 
                        : isComplete
                          ? 'bg-slate-800/50 border-slate-700 text-slate-500'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }
                    `}
                  >
                    <span className="text-base md:text-lg">{p.image}</span>
                    <span className="text-xs md:text-sm font-bold max-w-[80px] md:max-w-xs truncate">{p.name}</span>
                    <span className={`text-[10px] md:text-xs ml-1 px-1.5 py-0.5 rounded ${isComplete ? 'bg-slate-700 text-slate-400' : 'bg-slate-700 text-white'}`}>
                      {winnerCount}/{p.count}
                    </span>
                  </button>
                );
              })}
            </div>
         </div>

         <div className="flex items-center gap-2 md:gap-4">
            {/* Mute Button */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full transition ${isMuted ? 'text-red-400 bg-red-900/20' : 'text-neon-blue bg-neon-blue/10'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
               {isMuted ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" x2="1" y1="1" y2="23"/></svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
               )}
            </button>

            {/* Admin Button */}
            <button 
              onClick={() => setShowAdmin(true)}
              className="p-2 text-slate-400 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
         </div>
      </header>

      {/* Main Stage */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <LotteryScreen 
          participants={participants}
          currentPrize={currentPrize}
          winners={winners}
          isDrawing={isDrawing}
          onStart={handleStart}
          onStop={handleStop}
          lastWinner={lastWinner}
        />
      </main>

      {/* Footer / Author Credit */}
      <footer className="z-30 w-full py-1.5 text-center text-slate-600/60 text-[10px] md:text-xs font-mono bg-black/20 backdrop-blur-sm border-t border-slate-800/30">
        原创作者：jay &nbsp;|&nbsp; 谷歌及qq账号：695274107@qq.com
      </footer>

      {/* Admin Modal */}
      <AdminPanel 
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        participants={participants}
        setParticipants={setParticipants}
        prizes={prizes}
        setPrizes={setPrizes}
        riggedMatches={riggedMatches}
        setRiggedMatches={setRiggedMatches}
        winners={winners}
        resetWinners={handleReset}
      />
    </div>
  );
};

export default App;