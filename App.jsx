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
  { id: 'general', subject: 'General Strategy', color: 'bg-slate-500', status: 'READY' },
  { id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', time: '10:00 AM', status: 'PASS SECURED', color: 'bg-green-500' },
  { id: 'pom', subject: 'Principles of Management', date: '2026-05-20', time: '10:00 AM', status: 'PRE-EXAM PASS', color: 'bg-emerald-600' },
  { id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', time: '10:00 AM', status: 'CRITICAL FOCUS', color: 'bg-red-500' },
  { id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM', status: 'STUDY HARD', color: 'bg-orange-500' },
  { id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM', status: 'STUDY HARD', color: 'bg-yellow-500' },
  { id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM', status: 'PRE-EXAM PASS', color: 'bg-blue-500' },
  { id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM', status: 'CRITICAL FOCUS', color: 'bg-red-500' },
  { id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM', status: 'CRITICAL FOCUS', color: 'bg-red-500' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [confidence, setConfidence] = useState({});

  // Fetch from Cloud on Start
 useEffect(() => {
  // 1. Initial Load
  const fetchCloudData = async () => {
    const { data } = await supabase.from('command_pro_data').select('*');
    if (data) {
      data.forEach(row => {
        if (row.id === 'tasks') setTasks(row.content);
        if (row.id === 'notes') setNotes(row.content);
        if (row.id === 'confidence') setConfidence(row.content);
      });
    }
  };
  fetchCloudData();

  // 2. REALTIME SYNC (The Magic Part)
  const channel = supabase
    .channel('cloud-sync')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'command_pro_data' }, 
    (payload) => {
      const { id, content } = payload.new;
      if (id === 'tasks') setTasks(content);
      if (id === 'notes') setNotes(content);
      if (id === 'confidence') setConfidence(content);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
  // Sync to Cloud
  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

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
    <div className="min-h-screen bg-[#0a0f18] text-white p-8">
      <header className="mb-12">
        <h1 className="text-5xl font-black italic uppercase">COMMAND <span className="text-blue-500">PRO</span></h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Academic Readiness System 2026</p>
      </header>

      <nav className="flex gap-4 mb-8">
        {['overview', 'tasks', 'notes'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2 rounded-xl uppercase font-black text-xs ${activeTab === t ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-800'}`}>{t}</button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800">
            <h2 className="text-red-500 font-black mb-6 uppercase tracking-tighter italic">Critical Priority</h2>
            {EXAM_DATA.filter(e => e.status === 'CRITICAL FOCUS').map(e => (
              <div key={e.id} className="p-5 bg-black/20 rounded-3xl mb-3 flex justify-between items-center border border-white/5">
                <span className="font-bold">{e.subject}</span>
                <input 
                  type="number" value={confidence[e.id] || 0} 
                  onChange={(e) => handleConf(e.id, e.target.value)}
                  className="bg-transparent text-right w-12 font-black text-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 flex flex-col items-center justify-center">
            <Gauge className="w-16 h-16 text-blue-500 mb-4" />
            <span className="text-7xl font-black italic">{stats.ready}%</span>
            <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest mt-4">System Readiness</span>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-in slide-in-from-right duration-500">
          <input 
            onKeyDown={(e) => { if(e.key === 'Enter') { handleAddTask(e.target.value); e.target.value = ''; }}}
            placeholder="Initialize New Objective..." 
            className="w-full bg-slate-900 p-6 rounded-[30px] border border-slate-800 outline-none focus:border-blue-500 font-bold"
          />
          {tasks.map(t => (
            <div key={t.id} className="p-6 bg-slate-900 rounded-[30px] border border-slate-800 flex justify-between items-center group">
              <span className="font-bold text-slate-300">{t.text}</span>
              <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5 text-red-500"/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// MOUNTING (DO NOT REMOVE)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

export default App;                       <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden group shadow-2xl">
                 <div className="w-24 h-24 bg-red-500/10 rounded-[40%] flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Target className="w-12 h-12 text-red-500" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white leading-tight italic">Focus: Critical Trio</h3>
                    <p className="text-slate-500 text-sm max-w-xs mt-4 leading-relaxed font-medium">Macro, Stats, and Micro are your high-stakes goals. Ensure you target the 20-mark threshold for Supply exams and 21 for Macro.</p>
                 </div>
                 <button onClick={() => setActiveTab('tasks')} className="bg-white text-black px-12 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl">Initialize Focus</button>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-40 h-40" /></div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
           <div className="animate-in slide-in-from-right duration-500 space-y-12 pb-20">
              <div className="bg-[#0f172a] border border-slate-800 p-10 rounded-[50px] shadow-2xl space-y-12 relative overflow-hidden">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Subject Selection</label>
                       <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 font-black outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none shadow-xl cursor-pointer">
                          {EXAM_DATA.filter(e => e.id !== 'general').map(e => <option key={e.id} value={e.id}>{e.subject} {e.status === 'CRITICAL FOCUS' ? '(!)' : ''}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Add Study Objective</label>
                       <div className="flex gap-3">
                          <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Actionable goal..." className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 font-bold outline-none focus:border-blue-500 shadow-xl" />
                          <button onClick={() => { if(newTaskText) setTasks([{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]); setNewTaskText('') }} className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl hover:bg-blue-500 transition-all"><Plus /></button>
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-800/50 space-y-6">
                    <h3 className="text-xl font-black text-white italic px-2">Link <span className="text-blue-500">Materials</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                       <input type="text" value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder="Title (e.g. L1 Slides)" className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 outline-none focus:border-blue-500 shadow-lg" />
                       <input type="text" value={newResUrl} onChange={(e) => setNewResUrl(e.target.value)} placeholder="URL..." className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 outline-none focus:border-blue-500 shadow-lg" />
                       <button onClick={() => { if(newResTitle && newResUrl) setResources([{id: Date.now(), subjectId: selectedSubjectId, title: newResTitle, url: newResUrl}, ...resources]); setNewResTitle(''); setNewResUrl('') }} className="bg-green-600 text-white font-black p-4 rounded-2xl shadow-lg hover:bg-green-500 transition-all flex items-center justify-center gap-2"><LinkIcon className="w-4 h-4"/> LINK ASSET</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {EXAM_DATA.filter(e => e.id !== 'general').map(subj => {
                      const sTasks = tasks.filter(t => t.subjectId === subj.id);
                      const sRes = resources.filter(r => r.subjectId === subj.id);
                      if (sTasks.length === 0 && sRes.length === 0) return null;
                      return (
                        <div key={subj.id} className={`space-y-6 p-7 rounded-[40px] border ${subj.status === 'CRITICAL FOCUS' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900/40 border-slate-800'} shadow-xl`}>
                           <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-3"><div className={`w-2 h-7 rounded-full ${subj.color}`} /><h3 className="font-black text-white uppercase text-[11px] tracking-[0.15em] italic">{subj.subject}</h3></div>
                              {subj.status === 'CRITICAL FOCUS' && <Flame className="w-4 h-4 text-red-500 animate-pulse" />}
                           </div>
                           <div className="space-y-3">
                              {sTasks.map(t => (
                                <div key={t.id} className="flex items-center gap-4 bg-slate-800/20 p-5 rounded-3xl border border-slate-800/50 group hover:border-blue-500/30 transition-all">
                                  <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-green-500 border-green-500' : 'border-slate-700 hover:border-blue-500'}`}>{t.completed && <CheckCircle2 className="w-5 h-5 text-white"/>}</button>
                                  <span className={`text-sm font-bold flex-1 ${t.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{t.text}</span>
                                  <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              ))}
                              {sRes.map(r => (
                                <div key={r.id} className="flex items-center gap-4 bg-blue-500/5 p-5 rounded-3xl border border-blue-500/10 group hover:border-blue-400 transition-all">
                                  <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                                  <a href={r.url} target="_blank" rel="noreferrer" className="text-xs font-black text-blue-400 hover:underline flex-1 truncate uppercase tracking-widest">{r.title}</a>
                                  <button onClick={() => setResources(resources.filter(x => x.id !== r.id))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              ))}
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'notes' && (
          <div className="animate-in slide-in-from-right duration-500 h-[calc(100vh-250px)] pb-20">
            {activeNoteId ? (
              <NoteEditor note={notes.find(n => n.id === activeNoteId)} onSave={(upd) => { setNotes(notes.map(n => n.id === upd.id ? upd : n)); setActiveNoteId(null); }} onCancel={() => setActiveNoteId(null)} onDelete={(id) => { setNotes(notes.filter(n => n.id !== id)); setActiveNoteId(null); }} />
            ) : (
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-[320px] space-y-6 shrink-0">
                  <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] p-7 shadow-2xl">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 px-2">Knowledge Base</h3>
                    <div className="space-y-1.5">
                       {EXAM_DATA.map(subj => (
                         <button key={subj.id} onClick={() => createNote(subj.id)} className="w-full text-left p-4 rounded-2xl hover:bg-slate-800 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-3 truncate min-w-0">
                               <div className={`w-2 h-2 rounded-full ${subj.color} shadow-sm shadow-black`} />
                               <span className="text-xs font-black text-slate-400 group-hover:text-white truncate">{subj.subject}</span>
                            </div>
                            <Plus className="w-4 h-4 text-slate-700 group-hover:text-blue-500" />
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex justify-between items-center bg-[#0a0f18]/80 backdrop-blur sticky top-0 z-10 py-3 border-b border-slate-800/50">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">BRIEFING <span className="text-blue-500">LAB</span></h2>
                    <button onClick={() => createNote('general')} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 flex items-center gap-2 transition-all">+ NEW ENTRY</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                    {notes.map(note => (
                      <button key={note.id} onClick={() => setActiveNoteId(note.id)} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500/50 transition-all text-left group relative overflow-hidden h-fit shadow-xl">
                         <div className="flex items-center gap-3 mb-5">
                            <div className={`w-2 h-8 rounded-full ${EXAM_DATA.find(e => e.id === note.subjectId)?.color}`} />
                            <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">{EXAM_DATA.find(e => e.id === note.subjectId)?.subject}</span>
                         </div>
                         <h4 className="text-white font-black text-2xl group-hover:text-blue-400 transition-all leading-tight mb-3 italic">{note.title}</h4>
                         <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-7">{note.subtitle}</p>
                         <div className="h-[1.5px] bg-slate-800/50 mb-7" />
                         <p className="text-sm text-slate-500 line-clamp-5 leading-relaxed font-medium italic">
                           {note.content ? note.content.replace(/[#\-]/g, '') : 'Initiating concepts...'}
                         </p>
                         <div className="absolute bottom-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity"><Edit3 className="w-16 h-16 text-white" /></div>
                      </button>
                    ))}
                    {notes.length === 0 && (
                      <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-15">
                        <FileText className="w-24 h-24 mb-6" />
                        <p className="text-sm font-black uppercase tracking-[0.4em]">Knowledge Repository Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
           <div className="animate-in zoom-in-95 duration-700 space-y-12 pb-20">
              <div className="flex flex-col lg:flex-row gap-10">
                 
                 <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-[50px] p-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-12 px-2">
                       <h2 className="text-3xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">PLANNER <span className="text-blue-500">2026</span></h2>
                       <div className="flex items-center gap-5 text-[10px] font-black text-slate-600 tracking-[0.25em]">
                          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/20" /> CRITICAL</div>
                          <div className="flex items-center gap-2 text-blue-400"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" /> SELECTED</div>
                       </div>
                    </div>
                    <div className="grid grid-cols-7 gap-5">
                       {['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d, idx) => (
                         <div key={`header-${d}-${idx}`} className="text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-8">{d}</div>
                       ))}
                       {Array.from({length: 14}, (_, i) => 18 + i).map(day => {
                          const exams = EXAM_DATA.filter(e => e.date?.includes(`-05-${day}`));
                          const isSelected = selectedDate === day;
                          const hasCritical = exams.some(e => e.status === 'CRITICAL FOCUS');
                          return (
                            <button 
                              key={`day-${day}`} 
                              onClick={() => setSelectedDate(day)} 
                              className={`relative aspect-square rounded-[35%] flex flex-col items-center justify-center transition-all border-2 ${isSelected ? 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-600/40 scale-105 z-10' : 'bg-[#0a0f18] border-transparent hover:border-slate-800'}`}
                            >
                               <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                               {exams.length > 0 && (
                                 <div className="absolute bottom-4 flex gap-1.5">
                                   {exams.map(e => <div key={`dot-${e.id}`} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : e.color}`}></div>)}
                                 </div>
                               )}
                               {hasCritical && !isSelected && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
                            </button>
                          );
                       })}
                    </div>
                 </div>

                 <div className="w-full lg:w-[400px] shrink-0">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-[50px] p-10 shadow-2xl h-full min-h-[550px] flex flex-col sticky top-28">
                       <div className="flex items-center gap-7 mb-12">
                          <div className="w-24 h-24 bg-blue-600 rounded-[35%] flex flex-col items-center justify-center shrink-0 shadow-2xl shadow-blue-600/30">
                             <span className="text-[11px] font-black text-white/50 uppercase leading-none">MAY</span>
                             <span className="text-5xl font-black text-white mt-1 leading-none tracking-tighter">{selectedDate}</span>
                          </div>
                          <div>
                             <h3 className="text-3xl font-black text-white tracking-tighter italic leading-none">FOCUS</h3>
                             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-500" /> Active Session</p>
                          </div>
                       </div>

                       <div className="space-y-7 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).map(exam => (
                             <div key={`agenda-${exam.id}`} className={`p-7 rounded-[40px] space-y-7 group hover:border-blue-500/50 transition-all border ${exam.status === 'CRITICAL FOCUS' ? 'bg-red-500/5 border-red-500/20 shadow-lg' : 'bg-[#0a0f18] border-slate-800'}`}>
                                <div className="flex justify-between items-start">
                                   <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase ${exam.color} text-white shadow-xl`}>{exam.status}</span>
                                   <Clock className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                   <h4 className="text-white font-black text-2xl group-hover:text-blue-400 transition-colors leading-tight italic">{exam.subject}</h4>
                                   <p className="text-slate-500 text-[11px] font-black mt-3 uppercase tracking-widest">{exam.time}</p>
                                </div>
                                <div className="space-y-4">
                                   <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                      <span>Readiness</span>
                                      <span className="text-white">{confidence[exam.id] || 0}%</span>
                                   </div>
                                   <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                      <div className={`h-full ${exam.color} transition-all duration-700`} style={{ width: `${confidence[exam.id] || 0}%` }} />
                                   </div>
                                </div>
                                <button onClick={() => setSelectedExam(exam)} className="w-full bg-[#1e293b] py-5 rounded-3xl text-[10px] font-black text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all border border-slate-700 uppercase tracking-[0.2em]">
                                   <Info className="w-4 h-4 text-yellow-500" /> Subject Intel
                                </button>
                             </div>
                          ))}
                          {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 text-center">
                               <Coffee className="w-14 h-14 mb-5" />
                               <p className="text-[11px] font-black uppercase tracking-[0.3em]">Self-Study Window</p>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>

      {selectedExam && (
        <SubjectModal 
          exam={selectedExam} 
          onClose={() => setSelectedExam(null)} 
          resources={resources} 
          notes={notes} 
          confidence={confidence}
          onConfidenceUpdate={handleConf}
        />
      )}

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/[0.03] blur-[150px] rounded-full"></div>
         <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-600/[0.03] blur-[150px] rounded-full"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.015] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:60px_60px]"></div>
      </div>

    </div>
  );
};

export default App;

import ReactDOM from 'react-dom/client';
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
