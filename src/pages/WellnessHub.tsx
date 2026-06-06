import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Wind, ShieldAlert, Sparkles, Brain, Award, Clock, ArrowLeft, CheckCircle2, ChevronRight 
} from 'lucide-react';

interface WellnessHubProps {
  onNavigate: (view: string) => void;
}

export default function WellnessHub({ onNavigate }: WellnessHubProps) {
  
  // --- BREATHING EXERCISE STATE ---
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (breathingActive) {
      breathingTimerRef.current = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            // Shift to next phase in Box Breathing (4 seconds for each)
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'inhale') return 'hold1';
              if (currentPhase === 'hold1') return 'exhale';
              if (currentPhase === 'exhale') return 'hold2';
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingTimerRef.current) {
        clearInterval(breathingTimerRef.current);
      }
    }

    return () => {
      if (breathingTimerRef.current) {
        clearInterval(breathingTimerRef.current);
      }
    };
  }, [breathingActive]);

  const handleBreathingToggle = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathCount(4);
      setBreathPhase('inhale');
    } else {
      setBreathingActive(true);
    }
  };

  const getBreathingInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return { text: 'Inhale Deeply', sub: 'Fill your lungs with cool oxygen...', color: 'text-emerald-400', size: 'scale-110' };
      case 'hold1': return { text: 'Hold Breath', sub: 'Let your nervous system stabilize...', color: 'text-indigo-400', size: 'scale-105' };
      case 'exhale': return { text: 'Exhale Slow', sub: 'Release all cognitive tension out...', color: 'text-amber-400', size: 'scale-95' };
      case 'hold2': return { text: 'Hold and Empty', sub: 'Feel the deep stillness of this second...', color: 'text-violet-400', size: 'scale-100' };
    }
  };

  const phaseDetails = getBreathingInstruction();

  // --- POMODORO STATES ---
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoSeconds, setPomoSeconds] = useState(1500); // 25 Minutes Default
  const [pomoMode, setPomoMode] = useState<'study' | 'break'>('study');
  const pomoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pomoActive) {
      pomoTimerRef.current = setInterval(() => {
        setPomoSeconds((prev) => {
          if (prev <= 1) {
            // Trigger sound warning (conceptual)
            if (pomoMode === 'study') {
              setPomoMode('break');
              setPomoSeconds(300); // 5 minute recovery
            } else {
              setPomoMode('study');
              setPomoSeconds(1500);
            }
            return pomoMode === 'study' ? 300 : 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    }

    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoActive, pomoMode]);

  const togglePomo = () => {
    setPomoActive(!pomoActive);
  };

  const resetPomo = () => {
    setPomoActive(false);
    setPomoMode('study');
    setPomoSeconds(1500);
  };

  const formatPomoTime = () => {
    const mins = Math.floor(pomoSeconds / 60);
    const secs = pomoSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100 text-left">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-all border border-white/5 bg-slate-900/30 px-3 py-1.5 rounded-xl hover:border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight pt-2">Exam Coping Tools</h1>
        </div>

        <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-white/5">
          Active Cognitive Interventions
        </span>
      </div>

      {/* Grid: Live Interactive Interventions (Breathing + Pomodoro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* INTERACTIVE BOX BREATHER (4-4-4-4) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500/5 w-32 h-32 rounded-full blur-2xl -z-10" />
          
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">Heart Rate Decelerator</span>
            <h3 className="font-display font-bold text-white text-base">Box Breathing Assistant</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Used by astronauts to instantly arrest high exam panic. Paces inhaled oxygen in symmetrical 4-second stages inside your parasympathetic system.
            </p>
          </div>

          {/* Visual animation ring */}
          <div className="my-6 flex flex-col items-center justify-center p-6 bg-slate-950/20 rounded-2xl border border-white/5 min-h-[180px]">
            <div className={`w-28 h-28 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center transition-all duration-1000 ${breathingActive ? phaseDetails.size + ' shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/10 border-emerald-400/50' : 'scale-100'}`}>
              <Wind className="w-6 h-6 text-emerald-300 animate-pulse" />
              {breathingActive ? (
                <span className="text-lg font-mono font-bold text-white mt-1">{breathCount}s</span>
              ) : (
                <span className="text-xs font-mono text-slate-500 mt-1">Ready</span>
              )}
            </div>

            <div className="text-center mt-4 space-y-0.5">
              <h4 className={`font-display font-bold text-sm tracking-tight ${breathingActive ? phaseDetails.color : 'text-slate-400'}`}>
                {breathingActive ? phaseDetails.text : 'Click Start to Pace Breathing'}
              </h4>
              <p className="text-[10.5px] text-slate-400">{breathingActive ? phaseDetails.sub : 'Sit upright, hands resting on your chest.'}</p>
            </div>
          </div>

          <button
            onClick={handleBreathingToggle}
            className={`w-full py-2.5 text-xs font-mono rounded-xl font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              breathingActive 
                ? 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {breathingActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {breathingActive ? 'Arrest Exercise' : 'Activate 4-4-4-4 Breather'}
          </button>
        </div>

        {/* STUDY FOCUS TIMER (POMODORO) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500/5 w-32 h-32 rounded-full blur-2xl -z-10" />

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold block">Temporal Focus Grid</span>
            <h3 className="font-display font-bold text-white text-base">Pomodoro Study Ritual</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Guards against long, exhausting cramming routines. Alternate between 25 minutes of deep target study and 5 minutes of total brain detachment.
            </p>
          </div>

          {/* Time display block */}
          <div className="my-6 flex flex-col items-center justify-center p-6 bg-slate-950/20 rounded-2xl border border-white/5 min-h-[180px]">
            <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-lg mb-2 border ${pomoMode === 'study' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {pomoMode === 'study' ? '📚 Active Study Target' : '☕ Passive Detach Break'}
            </span>
            <span className="text-4xl font-mono font-bold text-white tracking-widest">{formatPomoTime()}</span>
            <p className="text-[10.5px] text-slate-400 mt-2 text-center max-w-[200px]">
              {pomoActive ? 'Mute tab, close other notes, focus on 1 page.' : 'Prepare books and click activate.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={togglePomo}
              className={`flex-1 py-2.5 text-xs font-mono rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                pomoActive 
                  ? 'bg-zinc-800 border-white/5 text-amber-400' 
                  : 'bg-indigo-600 border-indigo-500/20 text-white'
              }`}
            >
              {pomoActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {pomoActive ? 'Halt Clock' : 'Activate' }
            </button>
            <button
              onClick={resetPomo}
              className="p-2.5 border border-white/5 hover:border-white/10 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Reset Clock"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Tactical Exam Relief Tips section */}
      <section className="space-y-4">
        <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" /> Cognitive Relief Handbooks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tip Card 1 */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
            <span className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-fit block">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h4 className="font-display font-medium text-white text-sm">Exam Night Insomnia Tips</h4>
            <ul className="text-slate-400 text-xs space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>No late tests</strong> – Stop reading 2 hours before bed; do not take mocks after 6 PM.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Sensory cool</strong> – Screens mimic solar signals, fooling melatonin. Switch off screens.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Accept rest</strong> – Simply lying down darkens your neural cache. It is 80% as restorative as actual sleep.</span>
              </li>
            </ul>
          </div>

          {/* Tip Card 2 */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
            <span className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl w-fit block">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-display font-medium text-white text-sm">Mock Score Trauma</h4>
            <ul className="text-slate-400 text-xs space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Data mode</strong> – View wrong questions as "debugging data tags" rather than a measure of value.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Compartmentalize</strong> – A poor mock score does not forecast Sunday's exam performance.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Micro-revision</strong> – Do one direct fix of a slipped formula instantly to regain chemical agency.</span>
              </li>
            </ul>
          </div>

          {/* Tip Card 3 */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit block">
              <Award className="w-4 h-4" />
            </span>
            <h4 className="font-display font-medium text-white text-sm">Burnout Prevention Tips</h4>
            <ul className="text-slate-400 text-xs space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Guilt-free pauses</strong> – Scheduled recovery prevents "rebellious procrastination."</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Limit inputs</strong> – Block peer chat rooms discussing syllabus completion percentages.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-1">•</span>
                <span><strong>Walk outside</strong> – Natural panoramas reset "convergent tunnel fatigue" in optical neurons.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
}
