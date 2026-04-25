/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Creator from './components/Creator';
import BalloonGame from './components/BalloonGame';
import BirthdayReveal from './components/BirthdayReveal';
import { BirthdayConfig, AppMode } from './types';
import { decodeConfig } from './utils';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [mode, setMode] = useState<AppMode>('create');
  const [config, setConfig] = useState<BirthdayConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      const encoded = params.get('c'); // Backward compatibility

      if (id) {
        try {
          const docRef = doc(db, 'cards', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setConfig(docSnap.data() as BirthdayConfig);
            setMode('game');
          } else {
            console.error('Card not found');
          }
        } catch (error) {
          console.error('Error fetching card:', error);
        }
      } else if (encoded) {
        const decoded = decodeConfig(encoded);
        if (decoded) {
          setConfig(decoded);
          setMode('game');
        }
      }
      setLoading(false);
    };

    fetchConfig();
  }, []);

  const [hasInteracted, setHasInteracted] = useState(false);

  const showReveal = () => {
    setMode('reveal');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pastel-blue/10">
        <div className="animate-bounce text-6xl mb-4">🎈</div>
        <p className="text-gray-400 font-medium animate-pulse">Loading surprise...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen">
      <AnimatePresence mode="wait">
        {mode === 'create' && (
          <motion.div
            key="creator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Creator />
          </motion.div>
        )}

        {mode === 'game' && config && !hasInteracted && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink/20 to-pastel-blue/20 p-4 w-full"
          >
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl text-center max-w-sm border-4 border-white">
              <div className="text-6xl mb-6">🎁</div>
              <h1 className="text-3xl font-bold font-rounded text-gray-800 mb-2">A surprise for you!</h1>
              <p className="text-gray-500 mb-8">Someone sent you a special birthday card. Ready to see it?</p>
              <button 
                onClick={() => setHasInteracted(true)}
                className="w-full py-4 bg-pastel-pink text-white font-bold rounded-2xl shadow-lg hover:bg-pastel-pink/80 transition-all text-xl cursor-all-scroll"
              >
                Start the Game! ✨
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'game' && config && hasInteracted && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <BalloonGame config={config} onComplete={showReveal} />
          </motion.div>
        )}

        {mode === 'reveal' && config && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <BirthdayReveal config={config} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

