import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, StickyNote, CheckCircle2, 
  Clock, AlertCircle, Plus, Trash2, Target, X, ChevronRight, Info, 
  BarChart3, Timer, ExternalLink, Link as LinkIcon, Presentation, Save, 
  Flame, Zap, Coffee, FileText, Edit3, Eye, Gauge
} from 'lucide-react';

// --- CONNECTION ---
const supabase = createClient('https://mudpqfifjoinkaxclifr.supabase.co', 'sb_publishable_hnBkr1rLjy0gCzyUoXruDg_Qxs5vlIu');

const EXAM_DATA = [
  { id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', time: '10:00 AM', status: 'PASS SECURED', color: 'bg-green-500' },
  { id: 'pom', subject: 'Principles of Management', date: '2026-05-20', time: '10:00 AM', status: 'PRE-EXAM PASS', color: 'bg-emerald-600' },
  { id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', time: '10:00 AM', status: 'CRITICAL FOCUS', color: 'bg-red-500' },
  { id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM', status: 'STUDY HARD', color: 'bg-orange-500' },
  { id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM', status: 'STUDY HARD', color: 'bg-yellow-500' },
  { id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM', status: 'PRE-EXAM PASS', color: 'bg-blue-500' },
  { id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM', status: 'CRITICAL FOCUS', color: 'bg-red-500' },
  { id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM', status: 'CRITICAL FOCUS', color: 'bg-red-500' }
];

// --- MODAL COMPONENT ---
const SubjectModal = ({ exam, onClose, confidence, onConfidenceUpdate }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl">
        <div className={`p-8 ${exam.color} flex justify-between items-start relative overflow-hidden`}>
           <div className="relative z-10">
              <h3 className="text-3xl font-black text-white leading-tight italic uppercase">{exam.subject}</h3>
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider mt-2">{exam.status}</span>
           </div>
           <button onClick={onClose} className="relative z-10 bg-white/20 p-2 rounded-full hover:bg-white/30"><X className="w-5 h-5 text-white" /></button>
        </div>
        <div className="p-8 space-y-8">
           <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge className="w-4 h-4 text-blue-500" /> Readiness Meter</h4>
                 <span className="text-xl font-black text-blue-500">{confidence[exam.id] || 0}%</span>
              </div>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
           </div>
           <button onClick={onClose} className="w-full py-4 bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest">Close Intel</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [confidence, setConfidence] = useState({});
  const [timerMode, setTimerMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Sync Data
  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from('command_pro_data').select('*');
      if (data) {
        data.forEach(row => {
          if (row.id === 'tasks') setTasks(row.content || []);
          if (row.id === 'confidence') setConfidence(row.content || {});
        });
      }
    };
    loadData();

    const channel = supabase.channel('realtime-sync').on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'command_pro_data' }, 
      (payload) => {
        if (payload.new.id === 'tasks') setTasks(payload.new.content);
        if (payload.new.id === 'confidence') setConfidence(payload.new.content);
      }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

  // Timer Logic
  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  const handleAddTask = (text) => {
    const updated = [{id: Date.now(), text, completed: false}, ...tasks];
    setTasks(updated);
    sync('tasks', updated);
  };

  const readyScore = Math.round(Object.values(confidence).reduce((a, b) => a + parseInt(b || 0), 0) / EXAM_DATA.length) || 0;

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans pb-24 lg:pb-0 selection:bg-blue-500/30">
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r lg:border-t-0 flex justify-around items-center p-4">
        {[
          { id: 'overview', icon: <LayoutDashboard className="w-6 h-6" /> },
          { id: 'tasks', icon: <BookOpen className="w-6 h-6" /> }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
            {item.icon}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
             <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">COMMAND <span className="text-blue-500">PRO</span></h1>
             <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Academic Readiness System 2026</p>
          </div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6 shadow-2xl">
             <div className="flex flex-col items-center min-w-[70px]">
                <span className="text-[8px] font-black text-slate-500 uppercase">{timerMode}</span>
                <span className="text-2xl font-black text-white tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
             </div>
             <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl ${isActive ? 'bg-slate-800' : 'bg-blue-600 text-white'}`}>{isActive ? <X size={16}/> : <Zap size={16}/>}</button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px]">
                  <div className="text-red-500 text-[10px] font-black uppercase mb-3 italic">High Priority</div>
                  <div className="text-5xl font-black text-white">{EXAM_DATA.filter(e => e.status.includes('CRITICAL')).length}</div>
               </div>
               <div className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px] col-span-1 lg:col-span-3 flex items-center justify-between">
                  <div>
                    <div className="text-blue-500 text-[10px] font-black uppercase mb-1">System Readiness</div>
                    <div className="text-5xl font-black text-white">{readyScore}%</div>
                  </div>
                  <Gauge className="w-12 h-12 text-slate-800" />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter ml-2">Academic Roadmap</h2>
                {EXAM_DATA.map(exam => (
                  <button key={exam.id} onClick={() => setSelectedExam(exam)} className="w-full text-left bg-[#0f172a] border border-slate-800 p-6 rounded-[36px] hover:border-blue-500 transition-all group flex items-center gap-6 shadow-xl">
                    <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0`}>
                       <span className="text-[8px] font-black">MAY</span>
                       <span className="text-2xl font-black">{exam.date.split('-')[2]}</span>
                    </div>
                    <div className="flex-1">
                       <h4 className="text-white font-black group-hover:text-blue-400 italic text-xl truncate">{exam.subject}</h4>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="text-[8px] font-black text-slate-500 uppercase">{confidence[exam.id] || 0}% Ready</span>
                          <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${confidence[exam.id]||0}%`}}></div></div>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                ))}
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group shadow-2xl">
                 <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-500"><Target className="w-10 h-10 text-blue-500" /></div>
                 <div><h3 className="text-3xl font-black text-white italic">Cloud Sync Active</h3><p className="text-slate-500 text-xs mt-4 leading-relaxed">Your data is currently syncing across your ecosystem.</p></div>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-32 h-32" /></div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
             <div className="relative">
               <input 
                 onKeyDown={(e) => { if(e.key === 'Enter' && e.target.value) { handleAddTask(e.target.value); e.target.value = ''; }}} 
                 placeholder="Initialize New Objective..." 
                 className="w-full bg-slate-900/50 p-8 rounded-[35px] border border-slate-800 outline-none focus:border-blue-500 font-bold italic shadow-2xl transition-all" 
               />
               <Plus className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700" />
             </div>
             <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="p-6 bg-slate-900/30 rounded-[30px] border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-all shadow-lg">
                    <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="font-bold text-slate-300 italic">{t.text}</span></div>
                    <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="p-2 opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5 text-red-500"/></button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {selectedExam && <SubjectModal exam={selectedExam} onClose={() => setSelectedExam(null)} confidence={confidence} onConfidenceUpdate={handleConf} />}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

export default App;        <div className="p-8 space-y-8">
           <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge className="w-4 h-4 text-blue-500" /> Readiness Meter</h4>
                 <span className="text-xl font-black text-blue-500">{confidence[exam.id] || 0}%</span>
              </div>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
           </div>
           <button onClick={onClose} className="w-full py-4 bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest">Close Intel</button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [confidence, setConfidence] = useState({});
  const [timerMode, setTimerMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // --- SYNC ---
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('command_pro_data').select('*');
      if (data) {
        data.forEach(row => {
          if (row.id === 'tasks') setTasks(row.content || []);
          if (row.id === 'confidence') setConfidence(row.content || {});
        });
      }
    };
    load();

    const channel = supabase.channel('realtime').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'command_pro_data' }, (payload) => {
      if (payload.new.id === 'tasks') setTasks(payload.new.content);
      if (payload.new.id === 'confidence') setConfidence(payload.new.content);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

  // --- LOGIC ---
  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  const handleAddTask = (text) => {
    const updated = [{id: Date.now(), text, completed: false}, ...tasks];
    setTasks(updated);
    sync('tasks', updated);
  };

  const readyScore = Math.round(Object.values(confidence).reduce((a, b) => a + parseInt(b || 0), 0) / EXAM_DATA.length) || 0;

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans pb-24 lg:pb-0 selection:bg-blue-500/30">
      
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r lg:border-t-0 flex justify-around items-center p-4">
        {[
          { id: 'overview', icon: <LayoutDashboard className="w-6 h-6" /> },
          { id: 'tasks', icon: <BookOpen className="w-6 h-6" /> }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
            {item.icon}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
             <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">COMMAND <span className="text-blue-500">PRO</span></h1>
             <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Academic Readiness System 2026</p>
          </div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6 shadow-2xl">
             <div className="flex flex-col items-center min-w-[70px]">
                <span className="text-[8px] font-black text-slate-500 uppercase">{timerMode} session</span>
                <span className="text-2xl font-black text-white tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
             </div>
             <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl ${isActive ? 'bg-slate-800' : 'bg-blue-600 text-white'}`}>{isActive ? <X size={16}/> : <Zap size={16}/>}</button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px]"><div className="text-red-500 text-[10px] font-black uppercase mb-3 italic">High Priority</div><div className="text-5xl font-black text-white">{EXAM_DATA.filter(e => e.status.includes('CRITICAL')).length}</div></div>
               <div className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px] col-span-1 lg:col-span-3 flex items-center justify-between">
                  <div><div className="text-blue-500 text-[10px] font-black uppercase mb-1">System Readiness</div><div className="text-5xl font-black text-white">{readyScore}%</div></div>
                  <Gauge className="w-12 h-12 text-slate-800" />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter ml-2">Academic Roadmap</h2>
                {EXAM_DATA.map(exam => (
                  <button key={exam.id} onClick={() => setSelectedExam(exam)} className="w-full text-left bg-[#0f172a] border border-slate-800 p-6 rounded-[36px] hover:border-blue-500 transition-all group flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}>
                       <span className="text-[8px] font-black">MAY</span>
                       <span className="text-2xl font-black">{exam.date.split('-')[2]}</span>
                    </div>
                    <div className="flex-1">
                       <h4 className="text-white font-black group-hover:text-blue-400 italic text-xl truncate">{exam.subject}</h4>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="text-[8px] font-black text-slate-500 uppercase">{confidence[exam.id] || 0}% Ready</span>
                          <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${confidence[exam.id]||0}%`}}></div></div>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                ))}
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
                 <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-500"><Target className="w-10 h-10 text-blue-500" /></div>
                 <div><h3 className="text-3xl font-black text-white italic">Cloud Sync Active</h3><p className="text-slate-500 text-xs mt-4 leading-relaxed">Your data is currently syncing across your 2026 readiness ecosystem.</p></div>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-32 h-32" /></div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
             <div className="relative"><input onKeyDown={(e) => { if(e.key === 'Enter' && e.target.value) { handleAddTask(e.target.value); e.target.value = ''; }}} placeholder="Initialize New Objective..." className="w-full bg-slate-900/50 p-8 rounded-[35px] border border-slate-800 outline-none focus:border-blue-500 font-bold italic placeholder:text-slate-800 shadow-2xl transition-all" /><Plus className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700" /></div>
             <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="p-6 bg-slate-900/30 rounded-[30px] border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-all">
                    <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="font-bold text-slate-300 italic">{t.text}</span></div>
                    <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="p-2 opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5 text-red-500"/></button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {selectedExam && <SubjectModal exam={selectedExam} onClose={() => setSelectedExam(null)} confidence={confidence} onConfidenceUpdate={handleConf} />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
export default App;    const fetchCloudData = async () => {
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
