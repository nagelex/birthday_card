import React, { useState, useRef } from 'react';
import { Copy, Check, Share2, PartyPopper, Upload, Music, Loader2 } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { DEFAULT_WISHES } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Creator() {
  const [name, setName] = useState('');
  const [mainWish, setMainWish] = useState('Hope your day is as amazing as you are!');
  const [wishes, setWishes] = useState<string[]>(DEFAULT_WISHES);
  const [songUrl, setSongUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [lyrics, setLyrics] = useState(`I'm sorry I'm not Mr. Sunshine
All jokes, 'til I start feeling like the punchline
I know that you want Mr. Optimistic, that ain't realistic
I ain't Mr. Sunshine
(Na-na-na-na)

Do my smile keep you around?
How about when it's upside down?
How about when I'm in bed four or five days
Will you love me now?
I bet money you’d smell cyanide in my honey
Watch me cry at night and then roll your eyes
'Til you decide to start runnin’

I'll be ready when you let me
Don't forget me
Maybe I ain't what I was then

I'm sorry I'm not Mr. Sunshine
All jokes, 'til I start feeling like the punchline
I know that you want Mr. Optimistic, that ain't realistic
I ain't Mr. Sunshine
(Na-na-na-na)
I'm sorry I'm not Mr. Sunshine, so low
And I might be here for a long time
I know that you want Mr. Optimistic, that ain't realistic
I ain't Mr. Sunshine
(Na-na-na-na)`);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<BirthdayConfig['difficulty']>('easy');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('song', file);

    try {
      const response = await fetch('/api/upload-song', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setSongUrl(data.url);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload song: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
  setIsGenerating(true);
  try {
    const configData = {
      name,
      mainWish,
      wishes,
      songUrl: './birthday-song.mp3', 
      lyrics,
      difficulty,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'cards'), configData);
      
      const baseUrl = window.location.origin + window.location.pathname;
      const url = new URL(baseUrl);
      url.searchParams.set('id', docRef.id);
      setGeneratedLink(url.toString());
    } catch (error) {
      console.error('Error generating card:', error);
      alert('Failed to save card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-pastel-blue/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white"
        id="creator-form"
      >
        <div className="flex items-center gap-3 mb-6 font-rounded">
          <PartyPopper className="w-8 h-8 text-pastel-peach" />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Create a Card</h1>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="name">Birthday Person's Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="e.g. Maria"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pastel-pink/30 focus:border-pastel-pink focus:outline-none transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="wish">Main Wish Message</label>
            <textarea 
              id="wish"
              placeholder="Write something sweet..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-pastel-yellow/30 focus:border-pastel-yellow focus:outline-none transition-colors resize-none h-24"
              value={mainWish}
              onChange={(e) => setMainWish(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1" htmlFor="lyrics">Song Lyrics</label>
            <textarea 
              id="lyrics"
              placeholder="Enter lyrics for the dance party!..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-pastel-pink/20 focus:border-pastel-pink focus:outline-none transition-colors resize-none h-32 text-sm"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Music (Upload or link)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://example.com/song.mp3"
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-pastel-green/30 focus:border-pastel-green focus:outline-none transition-colors text-sm"
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-pastel-green/20 hover:bg-pastel-green/30 text-pastel-green font-bold rounded-2xl transition-all flex items-center gap-2"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="audio/*"
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>
            {songUrl.startsWith('/uploads/') && (
              <div className="mt-2 flex items-center gap-2 text-xs text-pastel-green font-medium">
                <Music className="w-3 h-3" />
                <span>Custom song uploaded successfully!</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Game Difficulty</label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
              <button 
                onClick={() => setDifficulty('easy')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${difficulty === 'easy' ? 'bg-white text-pastel-green shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Easy 🎈
              </button>
              <button 
                onClick={() => setDifficulty('hard')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${difficulty === 'hard' ? 'bg-white text-red-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Hard 🔥
              </button>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={!name || isUploading || isGenerating}
            className="w-full py-4 bg-pastel-pink hover:bg-pastel-pink/80 disabled:bg-gray-200 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
            Generate Shared Link
          </motion.button>

          <AnimatePresence>
            {generatedLink && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-100"
              >
                <p className="text-sm text-gray-500 mb-2">Share this link with your friend:</p>
                <div className="flex gap-2">
                  <input 
                    readOnly
                    type="text" 
                    value={generatedLink}
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-xs text-gray-400 border border-gray-100 truncate"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 bg-pastel-green text-white rounded-xl hover:bg-pastel-green/80 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {copied && <p className="text-[10px] font-bold text-pastel-green mt-1 text-center">Copied to clipboard!</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
