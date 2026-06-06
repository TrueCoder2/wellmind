import React, { useState } from 'react';
import { 
  LayoutDashboard, CheckSquare, PenTool, Bot, TrendingUp, Compass, Settings, Sparkles, Home, Menu, X, Flame, ShieldAlert, BadgeAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WellnessProvider, useWellness } from './context/WellnessContext';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Journal from './pages/Journal';
import Coach from './pages/Coach';
import Analytics from './pages/Analytics';
import WellnessHub from './pages/WellnessHub';
import Profile from './pages/Profile';

function LayoutContainer() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userProfile, streak, weeklyWellnessScore } = useWellness();

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Console', icon: LayoutDashboard },
    { id: 'checkin', label: 'Check-In Form', icon: CheckSquare },
    { id: 'journal', label: 'Diary Reflection', icon: PenTool },
    { id: 'coach', label: 'AI Wellness Coach', icon: Bot },
    { id: 'analytics', label: 'KPI Analytics', icon: TrendingUp },
    { id: 'hub', label: 'Coping Hub', icon: Compass },
    { id: 'profile', label: 'Configuration', icon: Settings },
  ];

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing': return <Landing onNavigate={handleNavigate} />;
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'checkin': return <CheckIn onNavigate={handleNavigate} />;
      case 'journal': return <Journal onNavigate={handleNavigate} />;
      case 'coach': return <Coach onNavigate={handleNavigate} />;
      case 'analytics': return <Analytics onNavigate={handleNavigate} />;
      case 'hub': return <WellnessHub onNavigate={handleNavigate} />;
      case 'profile': return <Profile onNavigate={handleNavigate} />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  // If we are on landing page, display landing without the dashboard sidebar layout
  if (currentView === 'landing') {
    return <Landing onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* 1. TOP MOBILE HEADER BAR */}
      <header className="md:hidden flex justify-between items-center px-4 py-3 bg-white/45 border-b border-indigo-100/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('landing')}>
          <div className="p-1.5 bg-indigo-50/80 rounded-lg border border-indigo-100">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-800 block">MindMate</span>
            <span className="text-[8px] font-mono tracking-wider text-indigo-500 uppercase">wellness console</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg text-[10px] font-mono text-orange-500 font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" /> {streak}d
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-slate-200/60 bg-white/70 text-slate-600 hover:text-indigo-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. PERSISTENT SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white/40 backdrop-blur-md border-r border-indigo-100/60 p-5 justify-between min-h-screen sticky top-0">
        <div className="space-y-8">
          
          {/* Brand header */}
          <div className="flex items-center gap-2 cursor-pointer pb-2 border-b border-indigo-100/50" onClick={() => handleNavigate('landing')}>
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-slate-800 block">MindMate</span>
              <span className="text-[9px] font-mono tracking-wider text-indigo-500 uppercase block">Student Wellness</span>
            </div>
          </div>

          {/* Quick Aspirant Widget */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl space-y-1.5 text-left">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-mono text-slate-500 uppercase">ASPIRANT PROFILE</span>
              <span className="text-[9px] font-mono text-emerald-600 bg-emerald-100/40 rounded px-1">{weeklyWellnessScore}% score</span>
            </div>
            <h4 className="font-display font-semibold text-xs text-slate-800 truncate">{userProfile.name}</h4>
            <p className="text-[10px] font-mono text-indigo-600">{userProfile.examType} Goal</p>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-semibold' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/50'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Option */}
        <div className="space-y-3 pt-4 border-t border-indigo-100/60">
          <button 
            onClick={() => handleNavigate('landing')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono text-slate-500 hover:text-indigo-600 hover:bg-slate-100/50"
          >
            <Home className="w-4 h-4" /> Exit to Lounge
          </button>
          
          <div className="text-[10px] font-mono text-slate-400 leading-normal text-left px-2">
            Clinical Warning: Information is supportive educational advisory data only.
          </div>
        </div>
      </aside>

      {/* 3. MOBILE MENU COVER LAYOUT */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-[57px] max-h-[80vh] bg-white border-b border-indigo-100/80 z-40 p-4 space-y-4 shadow-2xl overflow-y-auto"
          >
            <div className="grid grid-cols-1 gap-2 pt-2">
              {menuItems.map((item) => {
                const isActive = currentView === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-mono transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-600 border border-slate-100 hover:bg-indigo-50/50'
                    }`}
                  >
                    <IconComp className="w-4.5 h-4.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => handleNavigate('landing')}
              className="w-full py-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Back to Entrance Lounge
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MAIN CENTRAL SCREEN CANVAS */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto h-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <WellnessProvider>
      <LayoutContainer />
    </WellnessProvider>
  );
}
