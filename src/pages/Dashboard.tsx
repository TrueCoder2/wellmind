import React, { useState } from 'react';
import { 
  Flame, Award, BookOpen, Quote, Sparkles, Plus, TrendingUp, Download, Eye, Loader2, RefreshCw, Zap, Moon, Calendar, UserCheck
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { getRandomQuote } from '../data/quotes';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { 
    userProfile, 
    checkIns, 
    streak, 
    weeklyWellnessScore, 
    aiSummary, 
    isSummaryLoading, 
    generateDynamicSummary 
  } = useWellness();

  const [quote, setQuote] = useState(getRandomQuote());
  const [downloading, setDownloading] = useState(false);

  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.name || 'Aspirant';
    const exam = userProfile?.examType || 'your exam';

    if (hour < 12) return { text: `Good morning, ${name}!`, subText: `Stay calm, stay centered. Success in your ${exam} preparation starts with daily balance.` };
    if (hour < 18) return { text: `Good afternoon, ${name}!`, subText: `Deep breath. Take a 5-minute walking pause in between your intensive ${exam} study blocks.` };
    return { text: `Good evening, ${name}!`, subText: `Excellent job today. Consolidate your memory by letting your mind rest before sleep.` };
  };

  const greeting = getGreeting();

  // Get current day's check-in status
  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = checkIns.some(ci => ci.date === todayStr);
  const latestCheckIn = checkIns[0] || null;

  // Render sleep quality label with appropriate badge color
  const getSleepQualityBadge = (quality: string) => {
    switch (quality) {
      case 'good':
        return <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 rounded-lg text-xs font-medium">Good</span>;
      case 'average':
        return <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-400 border border-yellow-400/20 rounded-lg text-xs font-medium">Average</span>;
      default:
        return <span className="px-2 py-0.5 bg-red-500/15 text-red-500 border border-red-500/20 rounded-lg text-xs font-medium">Poor</span>;
    }
  };

  // Render stress level badge/score color
  const getStressBadge = (level: number) => {
    if (level < 4) return <span className="text-emerald-400 font-bold font-mono">{level}/10 (Low Stress)</span>;
    if (level < 8) return <span className="text-amber-400 font-bold font-mono">{level}/10 (Moderate)</span>;
    return <span className="text-red-400 font-bold font-mono">{level}/10 (Severe Stress)</span>;
  };

  // CSV/JSON Export utility
  const handleExport = () => {
    setDownloading(true);
    try {
      const exportData = {
        profile: userProfile,
        wellnessScore: weeklyWellnessScore,
        streakCount: streak,
        checkIns: checkIns,
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `mindmate_wellness_history_${todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-indigo-500/5 w-64 h-64 rounded-full blur-3xl -z-10" />
        <div className="space-y-1 max-w-2xl">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {greeting.text}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {greeting.subText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasCheckedInToday ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-mono font-medium">
              <UserCheck className="w-4 h-4" /> Logged Today
            </div>
          ) : (
            <button
              id="dash-checkin-btn"
              onClick={() => onNavigate('checkin')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl shadow-lg shadow-indigo-600/30 text-xs flex items-center gap-2 font-display transition-all"
            >
              <Plus className="w-4 h-4" /> Complete Today's Log
            </button>
          )}

          <button
            id="dash-export-btn"
            onClick={handleExport}
            disabled={downloading}
            className="p-2.5 glass-panel text-slate-300 hover:text-white rounded-2xl border border-white/5 hover:border-white/10 transition-all text-xs flex items-center gap-2"
            title="Export Wellness History"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Backup</span>
          </button>
        </div>
      </div>

      {/* Main Stats Row - Streaks and Dial Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak Flame Container */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-4 -right-4 bg-orange-500/5 w-24 h-24 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-orange-400 font-semibold block">Commitment Metric</span>
              <h3 className="font-display text-lg font-bold text-white mt-1">Study-Sanity Streak</h3>
            </div>
            <div className={`p-2.5 rounded-2xl ${streak > 0 ? 'bg-orange-500/15 text-orange-400' : 'bg-slate-800 text-slate-500'} border border-orange-500/20`}>
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>

          <div className="mt-8 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-extrabold text-white">{streak}</span>
              <span className="text-sm font-mono text-slate-400">consecutive days</span>
            </div>
            <p className="text-xs text-slate-400">
              {streak > 0 
                ? "Excellent consistency! Logging your stats daily helps lock in healthy stress awareness habits."
                : "Log today's check-in to start a new streak and monitor your pressure cycles."
              }
            </p>
          </div>
        </div>

        {/* Weekly Wellness Rating */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-4 -right-4 bg-emerald-500/5 w-24 h-24 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-semibold block">Dynamic Score</span>
              <h3 className="font-display text-lg font-bold text-white mt-1">Weekly Wellness Score</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-slate-700">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="rgb(16, 185, 129)" strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 28} 
                        strokeDashoffset={2 * Math.PI * 28 * (1 - weeklyWellnessScore / 100)} 
                        fill="transparent" 
                        strokeLinecap="round" />
              </svg>
              <span className="absolute text-sm font-mono font-bold text-white">{weeklyWellnessScore}%</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white">
                {weeklyWellnessScore >= 80 ? 'Grounded & Active' : weeklyWellnessScore >= 60 ? 'Moderate Prep Strain' : 'Severe Burnout Alert'}
              </span>
              <p className="text-xs text-slate-400">
                Derived from sleeping patterns, trigger control, stress logs, and study balance.
              </p>
            </div>
          </div>
        </div>

        {/* Study Hours Tracking (v goal) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-4 -right-4 bg-indigo-500/5 w-24 h-24 rounded-full blur-xl" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-400 font-semibold block">Daily Goal Core</span>
              <h3 className="font-display text-lg font-bold text-white mt-1">Study Hours (Latest)</h3>
            </div>
            <div className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-baseline">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-extrabold text-white">{latestCheckIn ? latestCheckIn.studyHours : 0}h</span>
                <span className="text-xs font-mono text-slate-400">/ {userProfile.dailyStudyGoal}h goal</span>
              </div>
              <span className="text-xs text-indigo-400 font-mono">
                {latestCheckIn ? Math.round((latestCheckIn.studyHours / userProfile.dailyStudyGoal) * 100) : 0}% Target
              </span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${Math.min(100, latestCheckIn ? (latestCheckIn.studyHours / userProfile.dailyStudyGoal) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Server AI Insights and Quote/Latest Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Server-Side AI Wellness Summary */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-6 border border-white/5 space-y-4 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 bg-indigo-500/5 w-32 h-32 rounded-full blur-2xl" />
          
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/15 rounded-lg border border-indigo-500/25">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Gemini Wellness Analysis</h3>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">AI Generated Realtime Feed</span>
              </div>
            </div>

            <button 
              onClick={generateDynamicSummary}
              disabled={isSummaryLoading}
              className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all font-mono text-[10px] flex items-center gap-1.5 disabled:opacity-50"
              title="Re-evaluate with raw log context"
            >
              {isSummaryLoading ? <Loader2 className="w-3" /> : <RefreshCw className="w-3" />}
              Re-evaluate
            </button>
          </div>

          {isSummaryLoading ? (
            <div className="min-h-[140px] flex flex-col items-center justify-center text-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-mono text-indigo-300">Evaluating latest exam triggers & stress parameters...</p>
            </div>
          ) : (
            <div className="space-y-4 min-h-[140px] flex flex-col justify-between">
              <p className="text-slate-300 text-sm leading-relaxed font-sans italic bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                "{aiSummary || "Please wait, launching analytical summary models..."}"
              </p>
              
              <div className="flex items-center justify-between gap-4 text-xs font-mono text-slate-400 pt-2">
                <span>Subject Stress Monitor: <strong className="text-orange-400 font-medium">UPSC Burden</strong></span>
                <span>Mnemonic Accuracy Status: <strong className="text-indigo-400 font-medium">Steady</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Motivation & Latest Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Daily Quote Card */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-2 right-2 text-indigo-500/10">
              <Quote className="w-16 h-16 fill-current" />
            </div>
            
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-mono text-violet-400 font-semibold tracking-wider block">Daily Aspirant Quote</span>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed italic">
                "{quote.text}"
              </p>
            </div>

            <div className="mt-4 flex justify-between items-center text-[11px] font-mono text-slate-400 border-t border-white/5 pt-3">
              <span>— {quote.author}</span>
              <button 
                onClick={() => setQuote(getRandomQuote())}
                className="text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-400" /> New Quote
              </button>
            </div>
          </div>

          {/* Quick Latest Register logs info */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
              <span className="font-display font-bold text-slate-200">Latest Register Log</span>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><Calendar className="w-3" /> {latestCheckIn ? latestCheckIn.date : 'None'}</span>
            </div>

            {latestCheckIn ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-900/30 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 font-mono block">Mood Score</span>
                  <span className="text-white mt-0.5 block font-medium font-sans">{latestCheckIn.mood}</span>
                </div>
                <div className="p-2 bg-slate-900/30 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 font-mono block">Stress Log</span>
                  <span className="text-white mt-0.5 block font-medium font-sans">{getStressBadge(latestCheckIn.stressLevel)}</span>
                </div>
                <div className="p-2 bg-slate-900/30 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 font-mono block">Sleep quality</span>
                  <span className="text-white mt-0.5 block font-medium font-sans">{getSleepQualityBadge(latestCheckIn.sleepQuality)}</span>
                </div>
                <div className="p-2 bg-slate-900/30 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 font-mono block">Active Trigger</span>
                  <span className="text-amber-400 mt-0.5 block font-mono text-[10px] truncate">{latestCheckIn.stressTrigger}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 font-mono">
                No logs register yet. Click Complete Log to begin.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Recommended Wellness Hub Exercises Shortcut */}
      <div className="p-6 glass-panel rounded-3xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display font-bold text-white text-base">Feeling Exam Anxiety Right Now?</h4>
          <p className="text-xs text-slate-300">Take a 2-minute Guided Square Breathing exercise or trigger the Pomodoro focus timer.</p>
        </div>
        <button 
          onClick={() => onNavigate('hub')}
          className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-400 rounded-2xl text-xs font-display transition-all font-medium whitespace-nowrap cursor-pointer"
        >
          Activate Breathing Tool
        </button>
      </div>

    </div>
  );
}
