import { useState, useEffect, useRef, useCallback } from "react";

export type SessionType = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

export interface PomodoroState {
  timeRemaining: number;
  isActive: boolean;
  sessionType: SessionType;
  focusSessionsCompleted: number;
}

export const DURATIONS = {
  FOCUS: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

// Subtle Audio Context for notifications
// ... (Your DURATIONS block above remains untouched)

// Subtle Audio Context for notifications
let audioCtx: AudioContext | null = null;

const playSubtleChime = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.5); // C6

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 2);
};

const playToggleSound = (enabled: boolean) => {
// ... (Your playToggleSound block below remains untouched)
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    const freq = enabled ? 600 : 300;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (enabled) {
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.12);
    } else {
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.12);
    }

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (error) {
    console.warn("Failed to play toggle sound feedback", error);
  }
};

const sendBrowserNotification = (title: string, body: string) => {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch (error) {
    console.warn("Desktop Notification constructor blocked on mobile view:", error);
    // This try/catch swallows the mobile browser restriction completely,
    // stopping the unhandled crash so your screen never goes white!
  }
};

export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>({
    timeRemaining: DURATIONS.FOCUS,
    isActive: false,
    sessionType: "FOCUS",
    focusSessionsCompleted: 0,
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const persisted = localStorage.getItem("pomodoro_sound_enabled");
      return persisted !== "false";
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pomodoro_sound_enabled", String(next));
      } catch {
        // Safe fallback in environments with disabled storage
      }
      playToggleSound(next);
      return next;
    });
  };

  const isSoundEnabledRef = useRef(isSoundEnabled);
  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  const lastUpdateTimeRef = useRef<number>(0);
  const intervalIdRef = useRef<number | NodeJS.Timeout | null>(null);

  const switchSession = useCallback((currentState: PomodoroState) => {
    let nextSessionType: SessionType = "FOCUS";
    let nextCompleted = currentState.focusSessionsCompleted;

if (currentState.sessionType === "FOCUS") {
  nextCompleted += 1;
  if (nextCompleted % 3 === 0) {
    nextSessionType = "LONG_BREAK";
    sendBrowserNotification("Phenomenal Work! 🌟", "You completed 3 rounds! Enjoy a long 15-minute rest.");
  } else {
    nextSessionType = "SHORT_BREAK";
    sendBrowserNotification("Focus Session Complete! 🏆", "Take some rest for 5 minutes. Go grab a water break!");
  }
} else {
    nextSessionType = "FOCUS";
    sendBrowserNotification("Break Time Over! 🚀", "Focus Mode Activated. Let's lock in!");
  }

  // ADD THIS BLOCK RIGHT HERE TO TRIGGER YOUR WORKING CHIRP AGAIN:
  if (isSoundEnabledRef.current) {
    playSubtleChime();
  }

  return {
    ...currentState,
      sessionType: nextSessionType,
      timeRemaining: DURATIONS[nextSessionType],
      focusSessionsCompleted: nextCompleted,
    };
  }, []);

  useEffect(() => {
    if (state.isActive) {
      lastUpdateTimeRef.current = performance.now();
      
      intervalIdRef.current = setInterval(() => {
        const now = performance.now();
        const deltaSeconds = Math.floor((now - lastUpdateTimeRef.current) / 1000);
        
        if (deltaSeconds >= 1) {
          setState((prev) => {
            if (!prev.isActive) return prev;
            
            const newTimeRemaining = prev.timeRemaining - deltaSeconds;
            
            if (newTimeRemaining <= 0) {
              lastUpdateTimeRef.current = now; // reset anchor for the new session
              return switchSession(prev);
            }
            
            lastUpdateTimeRef.current = lastUpdateTimeRef.current + (deltaSeconds * 1000);
            return { ...prev, timeRemaining: newTimeRemaining };
          });
        }
      }, 250); // check 4 times a second
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current as NodeJS.Timeout);
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current as NodeJS.Timeout);
      }
    };
  }, [state.isActive, switchSession]);

 const startTimer = () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  setState(s => ({ ...s, isActive: true }));
};
  const pauseTimer = () => setState(s => ({ ...s, isActive: false }));
  const resetTimer = () => {
    setState(s => ({
      ...s,
      isActive: false,
      timeRemaining: DURATIONS[s.sessionType]
    }));
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return { state, startTimer, pauseTimer, resetTimer, isSoundEnabled, toggleSound };
}
