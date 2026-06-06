import React from 'react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  ArrowLeft, Brain, Calendar, BookOpen, Smile, Award, Activity, HelpCircle, Moon 
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

interface AnalyticsProps {
  onNavigate: (view: string) => void;
}

export default function Analytics({ onNavigate }: AnalyticsProps) {
  const { checkIns, userProfile } = useWellness();

  // Prepare chronological list (oldest to newest) for chart progression
  const reversedLogs = [...checkIns]
    .sort((a, b) => a.timestamp - b.timestamp);

  const chartData = reversedLogs.map(ci => {
    // Mood string values mapped to a 5-point scale
    let moodScore = 3;
    if (ci.mood.includes('Great')) moodScore = 5;
    else if (ci.mood.includes('Good')) moodScore = 4;
    else if (ci.mood.includes('Neutral')) moodScore = 3;
    else if (ci.mood.includes('Low')) moodScore = 2;
    else if (ci.mood.includes('Stressed')) moodScore = 1;

    // Sleep quality mapped to score
    let sleepScore = 2;
    if (ci.sleepQuality === 'good') sleepScore = 3;
    if (ci.sleepQuality === 'average') sleepScore = 2;
    if (ci.sleepQuality === 'poor') sleepScore = 1;

    // Format readable date label (e.g., 'Jun 6')
    const dateObj = new Date(ci.date);
    const dateLabel = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' });

    return {
      date: ci.date,
      dateLabel,
      moodScore,
      moodName: ci.mood,
      stressLevel: ci.stressLevel,
      energyLevel: ci.energyLevel,
      sleepScore,
      sleepName: ci.sleepQuality,
      studyHours: ci.studyHours,
      trigger: ci.stressTrigger,
    };
  });

  // Calculate high-yield aggregates
  const calculateStats = () => {
    if (checkIns.length === 0) {
      return { avgStudy: 0, avgStress: 0, peakTrigger: 'None', sleepGoodPct: 0 };
    }

    const totalStudy = checkIns.reduce((sum, item) => sum + item.studyHours, 0);
    const avgStudy = Math.round((totalStudy / checkIns.length) * 10) / 10;

    const totalStress = checkIns.reduce((sum, item) => sum + item.stressLevel, 0);
    const avgStress = Math.round((totalStress / checkIns.length) * 10) / 10;

    // Trigger frequencies
    const frequencies: Record<string, number> = {};
    checkIns.forEach(ci => {
      if (ci.stressTrigger !== 'none') {
        frequencies[ci.stressTrigger] = (frequencies[ci.stressTrigger] || 0) + 1;
      }
    });

    let peakTrigger = 'None';
    let maxFreq = 0;
    Object.entries(frequencies).forEach(([trig, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        peakTrigger = trig;
      }
    });

    const goodSleeps = checkIns.filter(ci => ci.sleepQuality === 'good').length;
    const sleepGoodPct = Math.round((goodSleeps / checkIns.length) * 100);

    return { avgStudy, avgStress, peakTrigger, sleepGoodPct };
  };

  const stats = calculateStats();

  // Custom tooltips to make them blend professionally with dark slate
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-950/90 border border-white/10 rounded-xl text-left text-xs font-mono space-y-1.5 shadow-2xl">
          <p className="text-white font-semibold">{data.dateLabel}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }} className="flex items-center gap-1.5">
              <span>{item.name}:</span>
              <strong>{item.value}</strong>
            </p>
          ))}
          {data.trigger && data.trigger !== 'none' && (
            <p className="text-amber-400 text-[10px] border-t border-white/5 pt-1 mt-1">
              Trigger: {data.trigger}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-all border border-white/5 bg-slate-900/30 px-3 py-1.5 rounded-xl hover:border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight pt-2">Wellness Analytics</h1>
        </div>

        <span className="text-[10px] uppercase font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-xl h-fit">
          Analyzing {checkIns.length} recorded days
        </span>
      </div>

      {checkIns.length === 0 ? (
        <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl space-y-4">
          <Activity className="w-16 h-16 text-slate-500 mx-auto opacity-30 animate-pulse" />
          <h3 className="font-display font-medium text-white text-lg">No Checklist Records Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">Complete your first daily student check-in form to unlock professional Recharts analytics trend logs.</p>
          <button
            onClick={() => onNavigate('checkin')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl font-display transition-all"
          >
            Check In Now
          </button>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-4 glass-panel rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Avg Study Hours
              </span>
              <span className="block text-2xl font-display font-bold text-white mt-1">{stats.avgStudy}h</span>
              <span className="text-[9px] font-mono text-slate-500 block">Goal: {userProfile.dailyStudyGoal}h daily</span>
            </div>

            <div className="p-4 glass-panel rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-red-400" /> Avg Stress Factor
              </span>
              <span className="block text-2xl font-display font-bold text-white mt-1">{stats.avgStress}/10</span>
              <span className={`text-[9px] font-mono block ${stats.avgStress >= 7 ? 'text-red-400' : stats.avgStress >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stats.avgStress >= 7 ? 'Severe overload' : stats.avgStress >= 4 ? 'Moderate strain' : 'Steady balance'}
              </span>
            </div>

            <div className="p-4 glass-panel rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-orange-400" /> Major Exam Trigger
              </span>
              <span className="block text-sm font-display font-bold text-white mt-1.5 truncate">{stats.peakTrigger}</span>
              <span className="text-[9px] font-mono text-slate-500 block">Demands proactive breaks</span>
            </div>

            <div className="p-4 glass-panel rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-emerald-400" /> Good睡眠 Quality
              </span>
              <span className="block text-2xl font-display font-bold text-white mt-1">{stats.sleepGoodPct}%</span>
              <span className="text-[9px] font-mono text-slate-500 block">Consolidates memory</span>
            </div>

          </div>

          {/* Recharts Area: 4 Required Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. MOOD TREND CHART */}
            <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-indigo-400 font-semibold tracking-wider block">Progression index</span>
                <h3 className="font-display font-bold text-white text-base">Weekly Mood Progression</h3>
              </div>
              <div className="h-[230px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f6ff6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#4f6ff6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="dateLabel" stroke="rgba(255,255,255,0.3)" fontSize={10} fontStyle="italic" />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(val) => {
                      if (val === 5) return '😀';
                      if (val === 4) return '🙂';
                      if (val === 3) return '😐';
                      if (val === 2) return '😔';
                      return '😫';
                    }} stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="moodScore" name="Outlook Score" stroke="#4f6ff6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMood)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. STRESS TREND CHART */}
            <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-violet-400 font-semibold tracking-wider block">Physiological load</span>
                <h3 className="font-display font-bold text-white text-base">Stress & Energy Cycles</h3>
              </div>
              <div className="h-[230px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="dateLabel" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis domain={[1, 10]} ticks={[2, 4, 6, 8, 10]} stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <Line type="monotone" dataKey="stressLevel" name="Stress Level" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="energyLevel" name="Brain Energy" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. SLEEP TREND CHART */}
            <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold tracking-wider block">Recovery index</span>
                <h3 className="font-display font-bold text-white text-base">Sleep Quality Track</h3>
              </div>
              <div className="h-[230px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="dateLabel" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(val) => {
                      if (val === 3) return 'Good';
                      if (val === 2) return 'Avg';
                      if (val === 1) return 'Poor';
                      return '';
                    }} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sleepScore" name="Sleep Quality" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. STUDY HOURS CHART */}
            <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold tracking-wider block">Preparation quantity</span>
                <h3 className="font-display font-bold text-white text-base">Logged Daily Study Hours</h3>
              </div>
              <div className="h-[230px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="dateLabel" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="studyHours" name="Study Hours" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Scientific study layout tip */}
          <div className="p-4 bg-zinc-900/35 border border-white/5 text-xs text-slate-400 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-0.5 leading-relaxed text-left">
              <span className="font-mono text-[9px] uppercase text-indigo-400 font-bold block">Scientific Insights Corner</span>
              <p>Highly inconsistent study hours (e.g. 12 hours followed by 2 hours) is often a sign of <strong>intensity anxiety cycles</strong>. Target consistent, modest study goals ({userProfile.dailyStudyGoal}h) coupled with solid REM sleep to generate optimal neural pathways.</p>
            </div>
            <button 
              onClick={() => onNavigate('hub')}
              className="px-4 py-2 border border-slate-700 bg-slate-900/50 text-slate-300 hover:text-white rounded-xl text-xs whitespace-nowrap align-self-end md:align-self-auto font-mono transition-all"
            >
              Get tips
            </button>
          </div>
        </>
      )}

    </div>
  );
}
