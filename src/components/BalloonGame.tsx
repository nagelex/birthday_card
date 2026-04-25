import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BirthdayConfig } from '../types';
import { PASTEL_COLORS } from '../utils';

interface Balloon {
  id: number;
  x: number;
  color: string;
  speed: number;
  size: number;
  wish: string;
  popped: boolean;
  delay: number;
  isBomb?: boolean;
}

interface Props {
  config: BirthdayConfig;
  onComplete: () => void;
}

const DUCK_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function BalloonGame({ config, onComplete }: Props) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const duckAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    duckAudio.current = new Audio(DUCK_SOUND_URL);
    
    const isHard = config.difficulty === 'hard';
    const balloonCount = config.wishes.length * (isHard ? 3 : 2);
    const bombCount = Math.floor(balloonCount / (isHard ? 2 : 3)) + (isHard ? 6 : 2);
    
    const elements: Balloon[] = [];

    // Add Balloons
    for (let i = 0; i < balloonCount; i++) {
        // Some balloons are twice as fast
        const isFast = Math.random() > (isHard ? 0.4 : 0.7);
        const baseSpeed = (isHard ? 6 : 10) + Math.random() * (isHard ? 5 : 8);
        const finalSpeed = isFast ? baseSpeed / 2 : baseSpeed;

        elements.push({
            id: i,
            x: Math.random() * 85 + 5,
            color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
            speed: finalSpeed,
            size: isHard ? 44 + Math.random() * 26 : 60 + Math.random() * 40,
            wish: config.wishes[i % config.wishes.length],
            popped: false,
            delay: (i * (isHard ? 0.5 : 0.8)) + (Math.random() * 0.5),
        });
    }

    // Add Bombs
    for (let i = 0; i < bombCount; i++) {
        elements.push({
            id: balloonCount + i,
            x: Math.random() * 85 + 5,
            color: '#333',
            speed: ((isHard ? 5 : 8) + Math.random() * 6),
            size: isHard ? 45 : 55,
            wish: '💣',
            popped: false,
            delay: Math.random() * (balloonCount * (isHard ? 0.4 : 0.6)),
            isBomb: true,
        });
    }

    setBalloons(elements);
  }, [config.wishes, config.difficulty]);

  const handlePop = (id: number, isBomb?: boolean) => {
    if (isBomb) {
      // Trigger duck sound
      if (duckAudio.current) {
        duckAudio.current.currentTime = 0;
        duckAudio.current.play().catch(() => {});
      }
      
      // Trigger confetti
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#000000', '#FFD700']
      });

      // Maybe it just vanishes or does something funny, but let's just mark as popped
      setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
      return;
    }

    setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setPoppedCount(prev => {
      const remainingBalloons = balloons.filter(b => !b.isBomb && b.id !== id && !b.popped).length;
      if (remainingBalloons === 0) {
        setTimeout(onComplete, 1500);
      }
      return prev + 1;
    });
  };

  const totalBalloonsToPop = balloons.filter(b => !b.isBomb).length;

  return (
    <div ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden bg-white cursor-crosshair select-none touch-none" id="balloon-stage">
      <div className="absolute top-4 md:top-8 left-0 w-full text-center z-20 pointer-events-none px-4">
        <h2 className="text-xl md:text-2xl font-bold font-rounded text-gray-400">Pop the balloons! ✨</h2>
        <div className="flex justify-center items-center gap-4 mt-1">
            <p className="text-gray-300 text-sm font-bold bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                🎈 {poppedCount} / {totalBalloonsToPop}
            </p>
            <p className="text-gray-300 text-xs font-medium">Watch out for bombs! 💣</p>
            {config.difficulty === 'hard' && (
              <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-red-100 rounded-md bg-red-50">Hard Mode</span>
            )}
        </div>
      </div>

      <AnimatePresence>
        {balloons.map((item) => (
          <React.Fragment key={item.id}>
            {!item.popped && (
              <motion.div
                initial={{ y: '110vh', x: 0 }}
                animate={{ 
                  y: '-20vh',
                  x: item.isBomb ? (config.difficulty === 'hard' ? [0, 80, -80, 0] : [0, 40, -40, 0]) : (config.difficulty === 'hard' ? [0, 30, -30, 0] : [0, 10, -10, 0]) 
                }}
                transition={{ 
                  y: {
                    duration: item.speed, 
                    delay: item.delay, 
                    ease: "linear",
                    repeat: Infinity
                  },
                  x: {
                    duration: item.isBomb ? (config.difficulty === 'hard' ? 1 : 1.5) : (config.difficulty === 'hard' ? 1.5 : 3),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="absolute"
                style={{ left: `${item.x}%` }}
              >
                <div
                  className="relative cursor-pointer active:scale-95 transition-transform"
                  onPointerDown={() => handlePop(item.id, item.isBomb)}
                  style={{
                    width: item.size,
                    height: item.isBomb ? item.size : item.size * 1.2,
                  }}
                >
                  {item.isBomb ? (
                    <div className="text-5xl md:text-6xl filter drop-shadow-lg">💣</div>
                  ) : (
                    <div 
                        className="w-full h-full balloon-shadow relative"
                        style={{
                            backgroundColor: item.color,
                            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                        }}
                    >
                        {/* Balloon String */}
                        <div className="absolute bottom-[-15px] left-1/2 w-[1px] h-[25px] bg-gray-400/30 -translate-x-1/2" />
                        {/* Shine */}
                        <div className="absolute top-[15%] left-[15%] w-[20%] h-[25%] bg-white/40 rounded-full blur-[2px]" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {item.popped && !item.isBomb && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 3, y: -100 }}
                transition={{ duration: 0.8 }}
                className="absolute pointer-events-none text-4xl md:text-6xl z-30"
                style={{ left: `${item.x}%`, top: '45dvh' }}
              >
                {item.wish}
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}
