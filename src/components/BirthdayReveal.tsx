import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BirthdayConfig } from '../types';
import { PartyPopper, Music, Sparkles } from 'lucide-react';

interface Props {
  config: BirthdayConfig;
}

export default function BirthdayReveal({ config }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isDanceMode, setIsDanceMode] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const lyricsLines = config.lyrics ? config.lyrics.split('\n').filter(l => l.trim() !== '') : [];

  useEffect(() => {
    // Fire confetti immediately
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Attempt to play music
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("Auto-play blocked by browser, user needs to interact", e));
    }

    // Timer to switch to Dance Mode after 15 seconds
    const danceTimer = setTimeout(() => {
      setIsDanceMode(true);
      // Extra confetti for the dance mode!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(danceTimer);
    };
  }, []);

  useEffect(() => {
    if (isDanceMode && lyricsLines.length > 0) {
      // Simple karaoke: reveal a new line every 3 seconds
      const karaokeInterval = setInterval(() => {
        setCurrentLineIndex(prev => (prev + 1) % lyricsLines.length);
      }, 3000);
      return () => clearInterval(karaokeInterval);
    }
  }, [isDanceMode, lyricsLines.length]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pastel-pink/30 via-pastel-yellow/30 to-pastel-blue/30 overflow-hidden relative">
      <audio ref={audioRef} src={config.songUrl} loop />
      
      <AnimatePresence mode="wait">
        {!isDanceMode ? (
          <motion.div 
            key="wish-mode"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border-4 border-white text-center z-10"
            id="reveal-card"
          >
            <motion.div
               animate={{ rotate: [0, 10, -10, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="inline-block p-4 bg-pastel-pink/20 rounded-full mb-6"
            >
              <PartyPopper className="w-12 h-12 text-pastel-pink" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold font-rounded text-gray-800 mb-4 tracking-tighter">
              Happy Birthday, <span className="text-pastel-peach">{config.name}</span>!
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed max-w-lg mx-auto mb-10">
              {config.mainWish}
            </p>

            <div className="flex items-center justify-center gap-2 text-pastel-blue font-bold">
              <Music className="w-5 h-5 animate-bounce" />
              <span>Listening to your favorite song...</span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dance-mode"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-3xl bg-white/95 backdrop-blur-2xl p-8 md:p-12 rounded-[4rem] shadow-2xl border-8 border-pastel-pink/30 text-center z-10 max-h-[90vh] flex flex-col"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="mb-6"
            >
              <h1 className="text-7xl md:text-9xl font-black font-rounded text-pastel-pink tracking-widest drop-shadow-sm">DANCE!</h1>
            </motion.div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Sparkles className="text-pastel-yellow w-6 h-6 animate-pulse" />
              <h2 className="text-xl font-bold text-gray-700 tracking-wider">KARAOKE PARTY ACTIVE</h2>
              <Sparkles className="text-pastel-yellow w-6 h-6 animate-pulse" />
            </div>

            <div className="flex-1 bg-gray-50/80 p-8 rounded-3xl border-2 border-dashed border-pastel-blue/30 overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLineIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl md:text-4xl text-gray-700 font-bold font-rounded italic leading-relaxed text-center px-4"
                >
                  {lyricsLines[currentLineIndex] || "Ready to dance?"}
                </motion.div>
              </AnimatePresence>
              
              <div className="mt-8 flex gap-2">
                 {lyricsLines.slice(currentLineIndex + 1, currentLineIndex + 3).map((line, i) => (
                   <p key={i} className="text-gray-300 text-sm font-medium blur-[1px]">{line}</p>
                 ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-8 pb-4">
               <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl text-pastel-blue">💃</motion.div>
               <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="text-5xl text-pastel-peach">🕺</motion.div>
               <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="text-5xl text-pastel-green">🥳</motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>🎈</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🎂</div>
      <div className="absolute top-1/2 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>🎁</div>
      <div className="absolute bottom-1/2 left-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>💖</div>
    </div>
  );
}
