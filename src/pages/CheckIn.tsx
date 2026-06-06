import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Smile, HelpCircle, Save, Moon, BookOpen, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

interface CheckInProps {
  onNavigate: (view: string) => void;
}

interface FormValues {
  mood: string;
  stressLevel: number;
  energyLevel: number;
  sleepQuality: 'poor' | 'average' | 'good';
  studyHours: number;
  stressTrigger: string;
  notes: string;
}

const MOODS = [
  { value: '😀 Great', label: 'Great', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' },
  { value: '🙂 Good', label: 'Good', bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20' },
  { value: '😐 Neutral', label: 'Neutral', bg: 'bg-zinc-800 border-zinc-700 text-slate-300 hover:bg-zinc-700' },
  { value: '😔 Low', label: 'Low', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' },
  { value: '😫 Stressed', label: 'Stressed', bg: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' },
];

const TRIGGERS = [
  { value: 'none', label: 'No Specific Stress' },
  { value: 'Academic Pressure', label: 'Heavy Syllabus / Academics' },
  { value: 'Mock Test Score', label: 'Mock Exam Scores / Performance Anxiety' },
  { value: 'Lack of Time', label: 'Inability to Complete Daily Targets' },
  { value: 'Family Expectations', label: 'Family Obligations or pressure' },
  { value: 'Peer Pressure', label: 'Comparing yourself with other peers' },
  { value: 'Sleep Deprivation', label: 'Exhaustion & Lack of Sleep' },
  { value: 'Other', label: 'Other/Private reasons' },
];

export default function CheckIn({ onNavigate }: CheckInProps) {
  const { addCheckIn, userProfile } = useWellness();

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      mood: '😐 Neutral',
      stressLevel: 5,
      energyLevel: 5,
      sleepQuality: 'average',
      studyHours: userProfile?.dailyStudyGoal || 8,
      stressTrigger: 'none',
      notes: '',
    }
  });

  const selectedMoodValue = watch('mood');
  const stressLevelValue = watch('stressLevel');
  const energyLevelValue = watch('energyLevel');
  const sleepQualityValue = watch('sleepQuality');

  const onSubmit = async (data: FormValues) => {
    await addCheckIn({
      date: new Date().toISOString().split('T')[0],
      mood: data.mood,
      stressLevel: Number(data.stressLevel),
      energyLevel: Number(data.energyLevel),
      sleepQuality: data.sleepQuality,
      studyHours: Number(data.studyHours),
      stressTrigger: data.stressTrigger,
      notes: data.notes,
    });
    // Redirect to dashboard
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-100">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-all border border-white/5 bg-slate-900/30 px-3 py-1.5 rounded-xl hover:border-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </button>
        <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500">Form Register</span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">Today's Well-being Check-In</h1>
        <p className="text-xs text-slate-400">Takes 30 seconds. Help your AI companion track your preparation balance.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 glass-panel rounded-3xl p-6 border border-white/5">
        
        {/* 1. MOOD SELECTOR */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">1. How is your overall outlook/mood today?</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {MOODS.map((mood) => {
              const isSelected = selectedMoodValue === mood.value;
              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setValue('mood', mood.value)}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${mood.bg} ${
                    isSelected 
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-102 border-indigo-400 bg-indigo-500/10 text-white' 
                      : 'border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="block text-xl mb-1">{mood.value.split(' ')[0]}</span>
                  <span className="block">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SLIDERS: STRESS & ENERGY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          
          {/* Stress Slider */}
          <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">Stress Factor</label>
              <span className={`text-xs font-mono font-bold ${stressLevelValue >= 8 ? 'text-red-400' : stressLevelValue >= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stressLevelValue} / 10
              </span>
            </div>
            <Controller
              name="stressLevel"
              control={control}
              render={({ field }) => (
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  {...field}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              )}
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Peaceful (1)</span>
              <span>Average (5)</span>
              <span>Anxious (10)</span>
            </div>
          </div>

          {/* Energy Slider */}
          <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">Brain Energy</label>
              <span className={`text-xs font-mono font-bold ${energyLevelValue <= 4 ? 'text-red-400' : energyLevelValue <= 7 ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {energyLevelValue} / 10
              </span>
            </div>
            <Controller
              name="energyLevel"
              control={control}
              render={({ field }) => (
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  {...field}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              )}
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Fatigued (1)</span>
              <span>Steady (5)</span>
              <span>Dynamic (10)</span>
            </div>
          </div>

        </div>

        {/* 3. SLEEP QUALITY SELECTOR */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">2. How was your sleep quality last night?</label>
          <div className="grid grid-cols-3 gap-3">
            {(['poor', 'average', 'good'] as const).map((quality) => {
              const isSelected = sleepQualityValue === quality;
              const style = {
                good: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/30',
                average: 'bg-zinc-800/80 border-white/5 text-slate-300 hover:border-white/10',
                poor: 'bg-red-500/10 border-red-500/20 text-red-400 hover:border-red-500/30'
              }[quality];

              return (
                <button
                  key={quality}
                  type="button"
                  onClick={() => setValue('sleepQuality', quality)}
                  className={`p-3 rounded-xl border text-xs font-medium capitalize transition-all ${style} ${
                    isSelected 
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-102 border-indigo-400 text-white' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Moon className="w-4 h-4 mx-auto mb-1 opacity-70" />
                  {quality}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. STUDY HOURS & TRIGGERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          
          {/* Study hours */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">
              3. Study Hours Tracked Today
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                {...register('studyHours', { 
                  required: 'Study hours are required', 
                  min: { value: 0, message: 'Cannot be less than 0' },
                  max: { value: 24, message: 'Cannot be more than 24' }
                })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white"
                placeholder="e.g. 7.5"
              />
            </div>
            {errors.studyHours && (
              <span className="text-[10px] text-red-400 block font-mono">
                {errors.studyHours.message}
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400 block">Exam goal: {userProfile.dailyStudyGoal} hours. Don't overdo it.</span>
          </div>

          {/* Stress Trigger */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">
              4. Primary Stress Trigger today
            </label>
            <select
              {...register('stressTrigger', { required: true })}
              className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-200 cursor-pointer bg-slate-950"
            >
              {TRIGGERS.map(t => (
                <option key={t.value} value={t.value} className="bg-slate-950 text-slate-200">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* 5. NOTES TEXTAREA */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">
            5. Optional Context Notes (private diary)
          </label>
          <textarea
            {...register('notes')}
            className="w-full p-3 rounded-xl glass-input text-xs text-white min-h-[80px]"
            placeholder="Write down any mock test failures, mental obstacles, fatigue alerts or successes here. High study quality is excellent, but emotional comfort is paramount."
          />
        </div>

        {/* SUBMISSION WORKFLOW */}
        <div className="pt-4 flex flex-col items-stretch gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-xs font-display flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Registering stats...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Today's Register Log & Evaluate AI Summary
              </>
            )}
          </button>
          
          <div className="flex gap-1.5 justify-center items-start text-[9.5px] font-mono text-slate-500 leading-normal px-2 text-center">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
            <span>MindMate logs secure data locally. Your records never traverse marketing brokers. Rest assured your privacy is 100% guarded.</span>
          </div>
        </div>

      </form>
    </div>
  );
}
