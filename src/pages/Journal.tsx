import React, { useState } from 'react';
import { 
  Sparkles, Calendar, BookOpen, PenTool, Trash2, Plus, ArrowLeft, Loader2, RefreshCw, MessageSquare
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

interface JournalProps {
  onNavigate: (view: string) => void;
}

export default function Journal({ onNavigate }: JournalProps) {
  const { journals, addJournalEntry, deleteJournal, getJournalReflection } = useWellness();

  const [activeId, setActiveId] = useState<string | null>(journals[0]?.id || null);
  const [isWriting, setIsWriting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [reflectingId, setReflectingId] = useState<string | null>(null);

  const activeJournal = journals.find(j => j.id === activeId) || null;

  const handleCreateNew = () => {
    setTitle('');
    setContent('');
    setIsWriting(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      const newId = await addJournalEntry(
        title.trim() || 'Untitled Diary Entry', 
        content.trim()
      );
      setActiveId(newId);
      setIsWriting(false);
      setTitle('');
      setContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you absolutely sure you want to delete this diary entry?')) {
      deleteJournal(id);
      if (activeId === id) {
        const remaining = journals.filter(j => j.id !== id);
        setActiveId(remaining[0]?.id || null);
      }
    }
  };

  const handleTriggerReflection = async (id: string) => {
    setReflectingId(id);
    try {
      await getJournalReflection(id);
    } catch (e) {
      console.error(e);
    } finally {
      setReflectingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-100">
      
      {/* Utility Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-all border border-white/5 bg-slate-900/30 px-3 py-1.5 rounded-xl hover:border-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </button>

        <button
          onClick={handleCreateNew}
          disabled={isWriting}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 font-display transition-all"
        >
          <Plus className="w-4 h-4" /> New Diary Entry
        </button>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: DIARY ARCHIVE */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>DIARY ARCHIVE ({journals.length})</span>
            <span>Local Index</span>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {journals.length === 0 ? (
              <div className="text-center py-10 glass-panel rounded-2xl border border-white/5">
                <PenTool className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-slate-400 font-mono">No entries recorded yet.</p>
                <button 
                  onClick={handleCreateNew}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs font-mono"
                >
                  Write Your First Log
                </button>
              </div>
            ) : (
              journals.map((entry) => {
                const isActive = entry.id === activeId && !isWriting;
                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setActiveId(entry.id);
                      setIsWriting(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer text-left transition-all relative ${
                      isActive 
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-white' 
                        : 'glass-panel border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-display font-bold text-sm truncate pr-4 text-white">
                          {entry.title}
                        </h4>
                        <button
                          onClick={(e) => handleDelete(entry.id, e)}
                          className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-all"
                          title="Purge Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 pt-1">
                        <Calendar className="w-3" /> {entry.date}
                        {entry.aiReflection && entry.aiReflection.includes('Analyzing') && (
                          <span className="text-indigo-400 animate-pulse flex items-center ml-auto">
                            <Loader2 className="w-2.5 h-2.5 animate-spin mr-1" /> Evaluating...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WRITING OR READING SCREEN */}
        <div className="lg:col-span-8">
          
          {isWriting ? (
            /* WRITER VIEW */
            <form onSubmit={handleSave} className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1">
                  <PenTool className="w-4 h-4" /> Writing Reflection
                </span>
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Give today's diary entry a title (e.g., Mock physics tension, Sleep struggles)..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 font-display font-medium text-white text-base rounded-xl glass-input"
                  maxLength={100}
                />

                <textarea
                  placeholder="Vent or analyze freely. What formulas are slipping, what stress is triggering, what did you succeed in? Let your thoughts run. AI Coach will analyze to deliver peaceful stress strategies."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={10}
                  className="w-full p-4 font-sans text-sm text-white rounded-xl glass-input leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-4 py-2 border border-white/5 bg-zinc-900/45 text-slate-300 rounded-xl text-xs font-mono"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving || !content.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 font-display disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving entry...
                    </>
                  ) : (
                    <>
                      Save & Analyze Reflection
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : activeJournal ? (
            /* READER & CO-INTEGRATED REFLECTION VIEW */
            <div className="space-y-6">
              
              {/* Journal Body card */}
              <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4 text-left">
                <div className="flex justify-between items-baseline pb-2 border-b border-white/5">
                  <h2 className="font-display font-bold text-lg text-white">{activeJournal.title}</h2>
                  <span className="text-xs font-mono text-slate-500 uppercase">{activeJournal.date}</span>
                </div>

                <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans font-light">
                  {activeJournal.content}
                </div>
              </div>

              {/* Gemini Supportive AI Reflection Insight Card */}
              <div className="glass-panel rounded-3xl p-6 border border-indigo-500/10 bg-indigo-950/15 relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 bg-indigo-500/5 w-40 h-40 rounded-l-full blur-2xl -z-10" />
                
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-sm">Empathetic AI Reflection</h3>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Gemini Cognitive Guidance</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTriggerReflection(activeJournal.id)}
                    disabled={reflectingId === activeJournal.id}
                    className="p-1 px-2.5 rounded-lg border border-indigo-500/20 text-indigo-300 hover:text-white hover:bg-indigo-500/10 transition-all font-mono text-[9px] flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    {reflectingId === activeJournal.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
                    Refresh Guide
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed markdown-body">
                    {/* Format output with subheadings highlighted premiumly */}
                    {activeJournal.aiReflection ? (
                      activeJournal.aiReflection.split('\n\n').map((paragraph, index) => {
                        if (paragraph.startsWith('**Observations:**')) {
                          return (
                            <div key={index} className="p-3 bg-indigo-950/20 border border-white/5 rounded-xl space-y-1">
                              <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase block">Observations</span>
                              <p className="text-slate-300 text-xs sm:text-sm">{paragraph.replace('**Observations:**', '').trim()}</p>
                            </div>
                          );
                        }
                        if (paragraph.startsWith('**Coaching Guidance:**')) {
                          return (
                            <div key={index} className="p-3 bg-indigo-950/20 border border-white/5 rounded-xl space-y-1">
                              <span className="text-[10px] font-mono font-bold text-violet-300 uppercase block">Coaching Guidance</span>
                              <p className="text-slate-300 text-xs sm:text-sm">{paragraph.replace('**Coaching Guidance:**', '').trim()}</p>
                            </div>
                          );
                        }
                        return <p key={index}>{paragraph}</p>;
                      })
                    ) : (
                      "Describe your daily milestones or stressors above to generate supportive advice."
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 items-start text-[9px] font-mono text-slate-500 pt-2 leading-tight">
                  <MessageSquare className="w-3 h-3 shrink-0 mt-0.5 text-zinc-500" />
                  <span>Coping feedback parses syntax triggers but is entirely educational and not qualified for psychological diagnostic clinical uses.</span>
                </div>
              </div>

            </div>
          ) : (
            /* EMPTY READ VIEW */
            <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl">
              < PenTool className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-30" />
              <h3 className="font-display font-medium text-white text-base">Select or Create a Diary Entry</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Venting your exam stress or logging mock exam blockages relieves performance anxiety instantly.</p>
              <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                Write Entry Now
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
