import React, { useState } from 'react';
import { 
  User, BookOpen, AlertCircle, Save, Check, RefreshCw, Trash2, KeyRound, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWellness } from '../context/WellnessContext';

interface ProfileProps {
  onNavigate: (view: string) => void;
}

const EXAMS = [
  'UPSC Civil Services',
  'JEE Mains & Advanced',
  'NEET (Medical)',
  'GATE',
  'CAT (Management)',
  'CUET',
  'Class 10/12 Board Exams',
  'Other Competitive Exams'
];

export default function Profile({ onNavigate }: ProfileProps) {
  const { userProfile, updateProfile, resetAll } = useWellness();

  const [name, setName] = useState(userProfile.name);
  const [examType, setExamType] = useState(userProfile.examType);
  const [targetYear, setTargetYear] = useState(userProfile.targetYear);
  const [dailyStudyGoal, setDailyStudyGoal] = useState(userProfile.dailyStudyGoal);

  const [saved, setSaved] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Aspirant',
      examType,
      targetYear: targetYear.trim() || '2026',
      dailyStudyGoal: Number(dailyStudyGoal) || 8,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTriggerWipe = () => {
    resetAll();
    setShowWipeModal(false);
    setConfirmText('');
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in text-slate-100 text-left">
      
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">Console Configuration</h1>
        <p className="text-xs text-slate-400">Tailor your exam objectives and manage student profile parameters securely.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* PROFILE SETTINGS FORM */}
        <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 border border-white/5 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <User className="w-5 h-5 text-indigo-400" />
            <span className="font-display font-bold text-white text-base">Aspirant Metadata</span>
          </div>

          <div className="space-y-4">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                placeholder="Candidate name"
                required
              />
            </div>

            {/* Grid for parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Exam type */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">Target Competitive Exam</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-200 bg-slate-950 cursor-pointer"
                >
                  {EXAMS.map(ex => (
                    <option key={ex} value={ex} className="bg-slate-950 text-slate-200">{ex}</option>
                  ))}
                </select>
              </div>

              {/* Target Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">Target Examination Year</label>
                <input
                  type="text"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-white animate-pulse"
                  placeholder="e.g. 2026, 2027"
                  maxLength={10}
                  required
                />
              </div>

            </div>

            {/* Goal Study hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider block">Daily Study Goal Hours</label>
              <input
                type="number"
                min="1"
                max="18"
                value={dailyStudyGoal}
                onChange={(e) => setDailyStudyGoal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                required
              />
              <span className="text-[10px] font-mono text-slate-500 block">We recommend setting this between 6 and 9 hours. Excess study hours are statistically connected to higher dropout triggers.</span>
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs font-display flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Changes Consolidated
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Configuration Parameters
              </>
            )}
          </button>
        </form>

        {/* API KEY CONFIG INSTRUCTIONS */}
        <div className="glass-panel rounded-3xl p-6 border border-indigo-500/10 bg-indigo-950/5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <span className="font-display font-bold text-white text-base">Gemini API Key Guide</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            This applet routes callouts securely through server-side Express handlers, requiring no developer-facing credentials in client bundles. To activate AI Coach dialogue and Journal reflections:
          </p>
          <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4 font-mono">
            <li>Open the <strong>Settings</strong> button at the top-right in the AI Studio editor window.</li>
            <li>Proceed to the <strong>Secrets</strong> panel.</li>
            <li>Add a variable exactly named <code className="text-indigo-300 font-bold bg-white/5 px-1 rounded">GEMINI_API_KEY</code>.</li>
            <li>Paste your standard model key as the value.</li>
          </ol>
        </div>

        {/* FACTORY RESET CARD */}
        <div className="glass-panel rounded-3xl p-6 border border-red-500/15 bg-red-500/5 space-y-4">
          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-red-500 text-sm">Zone of Devastation</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Hard-purges all recorded diaries, daily checklists, streaks, and settings from local databases, re-establishing blank templates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowWipeModal(true)}
            className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Hard Reset Applet Storage
          </button>
        </div>

      </div>

      <AnimatePresence>
        {showWipeModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="wipe-dialog-title" aria-describedby="wipe-dialog-desc">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-indigo-100/50 text-left"
            >
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 id="wipe-dialog-title" className="font-display font-bold text-lg text-slate-800">Dangerous Action Warning</h3>
              </div>
              <p id="wipe-dialog-desc" className="text-xs text-slate-600 leading-relaxed mb-4">
                This will irretrievably wipe your custom journaling reflection datasets, study checklist history, and active statistics. 
                <br /><br />
                To proceed, type <strong className="font-mono text-red-600 select-all">CONFIRM</strong> in the field below.
              </p>
              
              <div className="space-y-2 mb-4">
                <label htmlFor="confirm-wipe-input" className="text-[10px] font-mono font-bold text-slate-500 block">VERIFICATION ENTRY</label>
                <input 
                  id="confirm-wipe-input"
                  type="text"
                  placeholder="CONFIRM"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono uppercase bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => {
                    setShowWipeModal(false);
                    setConfirmText('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTriggerWipe}
                  disabled={confirmText !== 'CONFIRM'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-35 text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
                >
                  Wipe & Reseed Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
