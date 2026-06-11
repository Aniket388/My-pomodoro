/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Background3D } from "./components/Background3D";
import { usePomodoro, SessionType, DURATIONS } from "./lib/usePomodoro";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const SESSION_LABELS: Record<SessionType, string> = {
  FOCUS: "Focus Session",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
};

export default function App() {
  const { state, startTimer, pauseTimer, resetTimer, isSoundEnabled, toggleSound } = usePomodoro();

  const totalDuration = DURATIONS[state.sessionType];
  const progress = totalDuration > 0 ? (totalDuration - state.timeRemaining) / totalDuration : 0;
  const radius = 135;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <>
      <Background3D />
      
      <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center justify-between min-h-screen py-16 mx-auto">
        <header className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 text-white">Deep Focus Mode</span>
          </div>
          <button 
            onClick={toggleSound}
            className="flex items-center justify-center p-2 rounded-full border border-white/10 hover:bg-white hover:text-black active:scale-95 transition-all cursor-pointer text-white"
            title={isSoundEnabled ? "Mute alert audio" : "Unmute alert audio"}
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full my-8">
          <div className="mb-12 flex gap-2 p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <div className={`px-6 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${state.sessionType === "FOCUS" ? "bg-white text-black" : "text-white/40"}`}>
              Focus
            </div>
            <div className={`px-6 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${state.sessionType === "SHORT_BREAK" ? "bg-white text-black" : "text-white/40"}`}>
              Short Break
            </div>
            <div className={`px-6 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${state.sessionType === "LONG_BREAK" ? "bg-white text-black" : "text-white/40"}`}>
              Long Break
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="absolute -inset-24 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            {/* Circular Progress Ring Container */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-8">
              {/* Outer soft glassmorphic glowing circle */}
              <div className="absolute inset-2 bg-white/5 rounded-full backdrop-blur-[2px] border border-white/5 shadow-2xl"></div>
              
              {/* The SVG ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 320 320">
                <defs>
                  <linearGradient id="focus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="short-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="long-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                
                {/* Track Circle */}
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="transparent"
                  stroke="#ffffff"
                  strokeOpacity="0.04"
                  strokeWidth={strokeWidth}
                />
                
                {/* Active Indicator Progress Circle */}
                <motion.circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="transparent"
                  stroke={`url(#${state.sessionType === "FOCUS" ? "focus-grad" : state.sessionType === "SHORT_BREAK" ? "short-grad" : "long-grad"})`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  strokeLinecap="round"
                />
              </svg>

              {/* Centered Timer Text and Title inside the dynamic progress ring */}
              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  layout
                  className="text-5xl sm:text-6xl font-light tracking-tighter leading-none text-white select-text"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatTime(state.timeRemaining)}
                </motion.div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 mt-3 font-semibold">
                  {SESSION_LABELS[state.sessionType]}
                </div>
              </div>
            </div>

            {/* Play, Pause, Reset Controls */}
            <div className="flex items-center gap-12 text-white">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetTimer}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:bg-white hover:text-black transition-all group cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw size={18} />
              </motion.button>
              
              {!state.isActive ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 cursor-pointer"
                >
                  <div className="ml-1">
                     <Play size={24} fill="currentColor" />
                  </div>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseTimer}
                  className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 cursor-pointer"
                >
                  <Pause size={24} fill="currentColor" />
                </motion.button>
              )}
              
              {/* Spacer for clean symmetry */}
              <div className="w-12 h-12 opacity-0 select-none pointer-events-none"></div>
            </div>
          </div>
        </main>

        <footer className="w-full flex flex-col items-center gap-6">
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => {
              const matchesCompleted = i <= (state.focusSessionsCompleted % 3) + (state.sessionType === "FOCUS" && state.isActive ? 1 : 0);
              return (
                <div key={i} className="flex flex-col items-center gap-2 text-white">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      matchesCompleted
                        ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        : "bg-white/20"
                    }`}
                  ></div>
                  <span className="text-[8px] uppercase tracking-widest opacity-40">
                    0{i}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] tracking-[0.4em] uppercase opacity-30 text-white">
            Session {Math.min((state.focusSessionsCompleted % 3) + 1, 3)} of 3 until long break
          </p>
        </footer>
      </div>
    </>
  );
}
