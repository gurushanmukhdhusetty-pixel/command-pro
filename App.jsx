import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, StickyNote, CheckCircle2, 
  Clock, AlertCircle, Trophy, Plus, Trash2, Target, X, ChevronRight, Info, 
  BarChart3, Timer, ExternalLink, Link as LinkIcon, Presentation, Save, 
  Flame, Zap, Coffee, FileText, Edit3, Eye, Gauge
} from 'lucide-react';

// --- DATABASE CONNECTION ---
const supabaseUrl = 'https://mudpqfifjoinkaxclifr.supabase.co';
const supabaseKey = 'sb_publishable_hnBkr1rLjy0gCzyUoXruDg_Qxs5vlIu';
const supabase = createClient(supabaseUrl, supabaseKey);

const EXAM_DATA = [
  { id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', status: 'PASS SECURED', color: 'bg-green-500' },
  { id: 'pom', subject: 'Principles of Management', date: '2026-05-20', status: 'PRE-EXAM PASS', color: 'bg-emerald-600' },
  { id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', status: 'CRITICAL FOCUS', color: 'bg-red-500' },
  { id: 'research', subject: 'Research Techniques', date: '2026-05-22', status: 'STUDY HARD', color: 'bg-orange-500' },
  { id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', status: 'STUDY HARD', color: 'bg-yellow-500' },
  { id: 'tools', subject: 'Computational Tools', date: '2026-05-25', status: 'PRE-EXAM PASS', color: 'bg-blue-500' },
  { id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', status: 'CRITICAL FOCUS', color: 'bg-red-500' },
  { id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', status: 'CRITICAL FOCUS', color: 'bg-red-500' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [confidence, setConfidence] = useState({});

  // --- SYNC LOGIC ---

  useEffect(() => {
    // 1. Initial Load from Cloud
    const fetchCloudData = async () => {
      const { data } = await supabase.from('command_pro_data').select('*');
      if (data) {
        data.forEach(row => {
          if (row.id === 'tasks') setTasks(row.content || []);
          if (row.id === 'notes') setNotes(row.content || []);
          if (row.id === 'confidence') setConfidence(row.content || {});
        });
      }
    };
    fetchCloudData();

    // 2. Realtime Listener (Updates screen when database changes)
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'command_pro_data' }, 
        (payload) => {
          const { id, content } = payload.new;
          if (id === 'tasks') setTasks(content);
          if (id === 'notes') setNotes(content);
          if (id === 'confidence') setConfidence(content);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

  // --- HANDLERS ---

  const handleAddTask = (text) => {
    const updated = [{id: Date.now(), text, completed: false}, ...tasks];
    setTasks(updated);
    sync('tasks', updated);
  };

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  const stats = useMemo(() => ({
    critical: EXAM_DATA.filter(e => e.status === 'CRITICAL FOCUS').length,
    ready: Math.round(Object.values(confidence).reduce((a, b) => a + parseInt(b), 0) / EXAM_DATA.length) || 0
  }), [confidence]);

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-8 selection:bg-blue-500/30">
      <header className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">COMMAND <span className="text-blue-500">PRO</span></h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Academic Readiness System 2026</p>
      </header>

      <nav className="flex gap-4 mb-10">
        {['overview', 'tasks', 'notes'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-2xl uppercase font-black text-[10px] tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-800 hover:bg-slate-700'}`}>{t}</button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800">
            <h2 className="text-red-500 font-black mb-8 uppercase tracking-widest text-xs italic flex items-center gap-2"><Flame className="w-4 h-4"/> Critical Priority</h2>
            <div className="space-y-3">
              {EXAM_DATA.filter(e => e.status === 'CRITICAL FOCUS').map(e => (
                <div key={e.id} className="p-6 bg-black/20 rounded-[30px] flex justify-between items-center border border-white/5 group hover:border-red-500/30 transition-all">
                  <span className="font-bold italic">{e.subject}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Readiness:</span>
                    <input 
                      type="number" value={confidence[e.id] || 0} 
                      onChange={(e) => handleConf(e.id, e.target.value)}
                      className="bg-transparent text-right w-12 font-black text-blue-500 outline-none"
                    />
                    <span className="text-blue-500 font-black">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
            <Gauge className="w-20 h-20 text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-8xl font-black italic tracking-tighter">{stats.ready}%</span>
            <span className="text-slate-500 uppercase text-[10px] font-black tracking-[0.4em] mt-6">System Readiness</span>
            <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="w-32 h-32" /></div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="relative">
            <input 
              onKeyDown={(e) => { if(e.key === 'Enter' && e.target.value) { handleAddTask(e.target.value); e.target.value = ''; }}}
              placeholder="Initialize New Objective..." 
              className="w-full bg-slate-900/50 p-8 rounded-[35px] border border-slate-800 outline-none focus:border-blue-500 font-bold italic placeholder:text-slate-700 shadow-2xl transition-all"
            />
            <Plus className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700" />
          </div>
          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t.id} className="p-6 bg-slate-900/30 rounded-[30px] border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                  <span className="font-bold text-slate-300 italic">{t.text}</span>
                </div>
                <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5 text-red-500"/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MOUNTING ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
export default App;
