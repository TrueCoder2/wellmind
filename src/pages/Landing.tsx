import React from 'react';
import { Shield, Brain, Calendar, Smile, Award, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

interface LandingProps {
  onNavigate: (view: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const { userProfile } = useWellness();

  return (
    <div className="relative min-h-screen overflow-hidden soothing-gradient py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Header Bar */}
        <header className="flex justify-between items-center pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white block">MindMate</span>
              <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase">Student Wellness</span>
            </div>
          </div>
          <button 
            id="header-cta"
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2 text-sm font-medium glass-panel text-white hover:bg-white/10 rounded-xl border border-white/10 hover:border-indigo-500/3s transition-all"
          >
            Launch Console
          </button>
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-300 text-xs font-mono">
            <Award className="w-3.5 h-3.5" /> For JEE, NEET, UPSC, Board & Graduate Aspirants
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white line-height-tight leading-none">
            Master Competitive Exams, <br />
            <span className="gradient-text">Protect Your Mental Space</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
            Standard prep prioritizes study volume. We prioritize <span className="text-indigo-300 font-medium font-display">cognitive health</span>. Log daily stress triggers, access reflective AI journaling, and get non-diagnostic wellness strategies designed for high-stakes exam schedules.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              id="cta-primary"
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all font-display flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              Start Free Check-In <Smile className="w-5 h-5" />
            </button>
            <button
              id="cta-secondary"
              onClick={() => onNavigate('hub')}
              className="px-8 py-4 glass-panel hover:bg-white/5 border border-white/10 text-slate-100 font-medium rounded-2xl transition-all font-display hover:-translate-y-0.5"
            >
              Explore Coping Hub
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-400" /> 100% Client-Side Persistence</span>
            <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-indigo-400" /> Powered by Gemini 2.5 Flash</span>
          </div>
        </section>

        {/* Dynamic Concept Visualizer Preview */}
        <section className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 bg-indigo-500/5 w-1/2 h-full rounded-r-3xl -z-10 blur-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                How MindMate Strengthens Your Daily Preparation
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                When preparing for professional exams, emotional fatigue often sneaks up as quiet procrastination or chronic headache blocks. Sleep deprivation and negative test cycles ruin performance before you even walk into the center.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <span className="p-0.5 bg-indigo-500/10 rounded-full border border-indigo-400/30 block mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
                  </span>
                  <span><strong>Assess Triggers</strong> – Track scores, sleep, and triggers in 30 seconds daily.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <span className="p-0.5 bg-indigo-500/10 rounded-full border border-indigo-400/30 block mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
                  </span>
                  <span><strong>AI Wellness Support</strong> – Unpack mock anxiety with server-secured Gemini reflections.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <span className="p-0.5 bg-indigo-500/10 rounded-full border border-indigo-400/30 block mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
                  </span>
                  <span><strong>Coping Exercises</strong> – Immediate deep stress reliefs like box breathing and Pomodoros.</span>
                </li>
              </ul>
            </div>

            {/* Quick Stats Mockup Pane */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 shadow-2xl relative">
              <span className="absolute top-4 right-4 bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 rounded-full px-2 py-0.5 text-[10px] font-mono">
                ● SIMULATION ACTIVE
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/35">
                  <Activity className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Daily Summary Insights</h4>
                  <p className="text-[10px] font-mono text-slate-400">Student Profile: {userProfile?.name || "Aspirant"}</p>
                </div>
              </div>

              <div className="space-y-2 mt-4 bg-slate-900/40 p-4 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed italic">
                "You logged severe test trigger pressure yesterday. However, maintaining 8.5 study hours with a neutral outlook shows high resilience. Avoid skipping dinner; protect your REM sleep tonight to consolidate memory banks."
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
                <div className="p-3 bg-zinc-900/30 rounded-xl border border-white/5">
                  <span className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider">Burnout Index</span>
                  <span className="block text-amber-400 font-display font-medium text-lg mt-0.5">Moderate (6/10)</span>
                </div>
                <div className="p-3 bg-zinc-900/30 rounded-xl border border-white/5">
                  <span className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider">Weekly Streak</span>
                  <span className="block text-indigo-400 font-display font-medium text-lg mt-0.5">6 Days Logged</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Designed by Cognitive Science, built for Aspirants</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Focusing exclusively on solving mock tests can lead to study-resistance. MindMate balances the scales.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 w-fit">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">Exam Anxiety Coaches</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Chat securely with our AI coach specializing in schedule stress, task compartmentalization, and high-frequency self-worth reminders.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 w-fit">
                <Calendar className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">30s Quick Check-In</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Log your sleep quality, exam triggers, academic energy levels, and hours without typing tedious logs. Perfect to keep a lightning-quick sanity score.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 w-fit">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">Trend Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                View correlation trendlines. Analyze whether an increase in study hours triggers severe stress score spikes, or if poor sleep drops memory efficiency.
              </p>
            </div>

          </div>
        </section>

        {/* Footer info indicating not general health service */}
        <footer className="text-center pt-10 border-t border-white/5 text-xs text-slate-500 space-y-3 pb-8">
          <p>
            MindMate Student Wellness provides supportive educational insights and focus strategies. It does not replace medical diagnostics, active psychotherapy, or clinical support.
          </p>
          <p className="font-mono">
            &copy; 2026 MindMate Student Wellness. Crafted with absolute student focus.
          </p>
        </footer>

      </div>
    </div>
  );
}
