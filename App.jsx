import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, StickyNote, CheckCircle2, 
  Clock, AlertCircle, Plus, Trash2, Target, X, ChevronRight, Info, 
  BarChart3, Timer, ExternalLink, Link as LinkIcon, Presentation, Save, 
  Flame, Zap, Coffee, FileText, Edit3, Eye, Gauge, Trophy, Lock, ShieldCheck
} from 'lucide-react';

// --- DATABASE CONNECTION ---
const supabaseUrl = 'https://mudpqfifjoinkaxclifr.supabase.co';
const supabaseKey = 'sb_publishable_hnBkr1rLjy0gCzyUoXruDg_Qxs5vlIu';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ACADEMIC DATA ---
const EXAM_DATA = [
  { id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', time: '10:00 AM - 01:00 PM', internal: 39.5, needed: 0.5, status: 'PASS SECURED', color: 'bg-green-500', breakdown: [{ name: 'Assignments', max: 20, score: 13.5 }, { name: 'Midterm', max: 20, score: 16 }, { name: 'UNCC Certification', max: 10, score: 10 }] },
  { id: 'pom', subject: 'Principles of Management', date: '2026-05-20', time: '10:00 AM - 01:00 PM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-emerald-600', breakdown: [{ name: 'Participation', max: 20, score: 15 }, { name: 'Group Project', max: 50, score: 30 }] },
  { id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', time: '10:00 AM - 01:00 PM', internal: 19, needed: 21, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Midterm', max: 30, score: 14 }, { name: 'Group Assignments', max: 20, score: 5 }] },
  { id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM - 01:00 PM', internal: 32, needed: 8, status: 'STUDY HARD', color: 'bg-orange-500', breakdown: [{ name: 'Group Assignment', max: 40, score: 20 }, { name: 'Participation', max: 10, score: 5 }, { name: 'Quiz', max: 10, score: 7 }] },
  { id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM - 01:00 PM', internal: 34, needed: 6, status: 'STUDY HARD', color: 'bg-yellow-500', breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }, { name: 'Participation', max: 10, score: 5 }] },
  { id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM - 01:00 PM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-blue-500', breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Viva', max: 10, score: 0 }, { name: 'Quizzes', max: 20, score: 15 }, { name: 'Participation', max: 10, score: 5 }] },
  { id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM - 05:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] },
  { id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM - 05:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] }
];

const formatMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h4 key={i} className="text-white font-bold text-lg mt-4 mb-2 italic">{line.replace('### ', '')}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="text-blue-400 font-bold text-xl mt-5 mb-2 italic">{line.replace('## ', '')}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="text-blue-500 font-black text-2xl mt-6 mb-3 border-b border-slate-800 pb-2 italic">{line.replace('# ', '')}</h2>;
    if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
    return <p key={i} className="text-slate-400 text-sm mb-2 leading-relaxed">{line}</p>;
  });
};

// --- COMPONENTS ---
const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
  const [localNote, setLocalNote] = useState(note);
  const [viewMode, setViewMode] = useState('edit');
  useEffect(() => { setLocalNote(note); }, [note.id]);

  return (
    <div className="fixed inset-0 lg:relative z-[80] flex flex-col h-full bg-[#0f172a] lg:border border-slate-800 lg:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom lg:animate-none">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex gap-1 lg:gap-2">
          <button onClick={() => setViewMode('edit')} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Edit</button>
          <button onClick={() => setViewMode('preview')} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Preview</button>
        </div>
        <div className="flex gap-1 lg:gap-2">
          <button onClick={() => onSave(localNote)} className="bg-green-600 text-white p-2 rounded-xl active:scale-90"><Save size={16} /></button>
          <button onClick={() => onDelete(localNote.id)} className="bg-red-600/10 text-red-500 p-2 rounded-xl active:scale-90"><Trash2 size={16} /></button>
          <button onClick={onCancel} className="text-slate-500 p-2"><X size={20} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 lg:p-8 custom-scrollbar">
        {viewMode === 'edit' ? (
          <div className="space-y-4 lg:space-y-6">
            <input value={localNote.title || ''} onChange={(e) => setLocalNote({...localNote, title: e.target.value})} placeholder="Title..." className="w-full bg-transparent text-2xl lg:text-3xl font-black text-white outline-none italic" />
            <textarea value={localNote.content || ''} onChange={(e) => setLocalNote({...localNote, content: e.target.value})} className="w-full h-[60vh] bg-transparent text-slate-300 text-sm outline-none resize-none" placeholder="Start typing..." />
          </div>
        ) : (
          <div className="animate-in fade-in">
            <h1 className="text-3xl font-black text-white mb-2 italic uppercase">{localNote.title || 'Untitled'}</h1>
            <div className="prose prose-invert max-w-full">{formatMarkdown(localNote.content)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const SubjectModal = ({ exam, onClose, resources, notes, confidence, onConfidenceUpdate }) => {
  const subNotes = notes.filter(n => n.subjectId === exam.id);
  const subRes = resources.filter(r => r.subjectId === exam.id);
  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4 bg-[#05080f]/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] border-t lg:border border-slate-800 w-full max-w-4xl rounded-t-[32px] lg:rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        <div className={`p-6 lg:p-8 ${exam.color} flex justify-between items-start shrink-0`}>
          <div>
            <h3 className="text-xl lg:text-3xl font-black text-white italic uppercase">{exam.subject}</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-black text-white uppercase mt-2 inline-block">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 bg-gradient-to-b from-[#0f172a] to-[#0a0f18] custom-scrollbar">
          <div className="space-y-6 lg:space-y-8">
            <div className="bg-slate-900/50 p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-slate-800 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge size={14} className="text-blue-500" /> Readiness: {confidence[exam.id] || 0}%</h4>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-3 accent-blue-500 cursor-pointer bg-slate-800 rounded-lg appearance-none" />
            </div>
            <div className="bg-slate-900/50 p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-slate-800 space-y-6 shadow-xl">
              <div className="flex justify-between items-end">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-black">Analytics</h4>
                <div className="text-right"><span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Internal sum</span><span className="text-xl font-black text-white italic leading-none">{exam.internal || 0} Marks</span></div>
              </div>
              <div className="space-y-4">
                {exam.breakdown?.map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${exam.color} transition-all duration-1000`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Goal Threshold</span>
                   <span className={`text-lg lg:text-2xl font-black italic ${exam.needed === 0 ? 'text-green-500' : 'text-red-500'}`}>{exam.needed} MARKS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2 italic"><LinkIcon size={14} /> Materials</h4>
            <div className="space-y-3">
              {subRes.map(res => <a key={res.id} href={res.url} target="_blank" className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all shadow-lg active:scale-95"><span className="text-xs font-bold text-white italic truncate max-w-[180px]">{res.title}</span><ExternalLink size={12} className="text-slate-500" /></a>)}
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 pt-4 flex items-center gap-2 italic"><StickyNote size={14} /> Subject Briefs</h4>
            <div className="space-y-4">
              {subNotes.map(note => <div key={note.id} className="p-5 bg-slate-900 border border-slate-800 rounded-[24px] shadow-lg"><h5 className="text-white font-black mb-2 italic">{note.title}</h5><p className="text-xs text-slate-500 italic line-clamp-3 leading-relaxed">{note.content}</p></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(19);
  const [selectedSubjectId, setSelectedSubjectId] = useState('macro');
  const [newTaskText, setNewTaskText] = useState('');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [confidence, setConfidence] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      const { data } = await supabase.from('command_pro_data').select('*');
      if (data) {
        data.forEach(row => {
          if (row.id === 'tasks') setTasks(row.content || []);
          if (row.id === 'notes') setNotes(row.content || []);
          if (row.id === 'confidence') setConfidence(row.content || {});
          if (row.id === 'resources') setResources(row.content || []);
        });
      }
    };
    fetchData();
    const channel = supabase.channel('sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'command_pro_data' }, (p) => {
      if (p.new.id === 'tasks') setTasks(p.new.content);
      if (p.new.id === 'notes') setNotes(p.new.content);
      if (p.new.id === 'confidence') setConfidence(p.new.content);
      if (p.new.id === 'resources') setResources(p.new.content);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  const sync = async (id, content) => { await supabase.from('command_pro_data').upsert({ id, content }); };

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const stats = useMemo(() => {
    const academics = EXAM_DATA;
    const avgReady = Math.round(academics.reduce((sum, e) => sum + (parseInt(confidence[e.id]) || 0), 0) / academics.length) || 0;
    return { critical: EXAM_DATA.filter(d => d.status.includes('CRITICAL')).length, avgReady, noteCount: notes.length, taskDone: tasks.filter(t => t.completed).length };
  }, [notes, tasks, confidence]);

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center p-6 font-sans">
      <form onSubmit={(e) => { e.preventDefault(); if(pass === 'Foxtrot@116') setIsAuthenticated(true); }} className="bg-[#0f172a] border border-slate-800 p-8 lg:p-10 rounded-[40px] w-full max-w-md shadow-2xl space-y-8 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shadow-xl"><Lock className="text-blue-500 w-8 h-8" /></div>
          <h1 className="text-2xl font-black text-white italic uppercase">Command <span className="text-blue-500">Pro</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none italic">Security Protocol Active</p>
        </div>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Access Key..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white font-black text-center outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
        <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl hover:bg-blue-500 active:scale-95 transition-all">Verify Intel</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans pb-24 lg:pb-0 selection:bg-blue-500/30">
      
      {/* NAVIGATION - Mobile Bottom Bar / Desktop Left Sidebar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r flex justify-around items-center p-3 lg:p-4">
        {[
          { id: 'overview', icon: <LayoutDashboard size={24}/> },
          { id: 'tasks', icon: <BookOpen size={24}/> },
          { id: 'notes', icon: <StickyNote size={24}/> },
          { id: 'calendar', icon: <CalendarIcon size={24}/> }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl transition-all active:scale-90 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800'}`}>
            {item.icon}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-5 lg:px-6 py-8 lg:py-10 lg:pl-32">
        <header className="mb-8 lg:mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">COMMAND <span className="text-blue-500">PRO</span></h1>
            <p className="text-slate-500 font-black uppercase text-[9px] lg:text-[10px] tracking-[0.3em] mt-3 italic">Academic Readiness System 2026</p>
          </div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-3 lg:p-4 flex items-center gap-4 lg:gap-6 shadow-2xl">
            <div className="flex flex-col items-center min-w-[60px] lg:min-w-[70px]">
              <span className="text-[7px] lg:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Session</span>
              <span className="text-xl lg:text-2xl font-black text-white tabular-nums tracking-tighter italic">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            </div>
            <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-slate-800' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>
              {isActive ? <X size={16}/> : <Zap size={16}/>}
            </button>
          </div>
        </header>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-700 space-y-8 lg:space-y-12 pb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[ 
                { l: 'Critical', v: stats.critical, c: 'text-red-500', i: <Flame size={14}/> }, 
                { l: 'Avg Ready', v: stats.avgReady + '%', c: 'text-blue-500', i: <Gauge size={14}/> }, 
                { l: 'Briefs', v: stats.noteCount, c: 'text-purple-500', i: <StickyNote size={14}/> }, 
                { l: 'Goals', v: stats.taskDone, c: 'text-green-500', i: <CheckCircle2 size={14}/> }
              ].map((s, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 p-5 lg:p-7 rounded-[28px] lg:rounded-[32px] shadow-xl">
                  <div className={`flex items-center gap-2 mb-2 lg:mb-3 text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${s.c}`}>{s.i} {s.l}</div>
                  <div className="text-2xl lg:text-5xl font-black text-white italic leading-none">{s.v}</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <section className="space-y-5">
                <h2 className="text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter ml-2">Academic Roadmap</h2>
                <div className="space-y-3 lg:space-y-4">
                  {EXAM_DATA.map(exam => (
                    <button key={exam.id} onClick={() => setSelectedExam(exam)} className={`w-full text-left bg-[#0f172a] border p-4 lg:p-6 rounded-[28px] lg:rounded-[36px] transition-all group flex items-center gap-4 lg:gap-6 ${exam.status.includes('CRITICAL') ? 'border-red-500/30' : 'border-slate-800'} hover:border-blue-500 shadow-xl active:scale-[0.98]`}>
                       <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}>
                          <span className="text-[7px] lg:text-[8px] font-black uppercase">MAY</span>
                          <span className="text-lg lg:text-2xl font-black leading-none italic">{exam.date.split('-')[2]}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-white font-black lg:group-hover:text-blue-400 transition-colors truncate text-sm lg:text-xl leading-tight italic uppercase tracking-tighter">{exam.subject}</h4>
                          <div className="flex items-center gap-2 lg:gap-3 mt-1 lg:mt-2">
                             <div className="h-1 flex-1 max-w-[100px] bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${confidence[exam.id]||0}%`}}></div>
                             </div>
                             <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-tighter">{confidence[exam.id] || 0}% READY</span>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-slate-700" />
                    </button>
                  ))}
                </div>
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[40px] lg:rounded-[50px] p-8 lg:p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
                 <ShieldCheck className="w-12 h-12 text-blue-500 mb-2" />
                 <h3 className="text-xl lg:text-3xl font-black text-white italic uppercase tracking-tighter">Secure Ecosystem</h3>
                 <p className="text-slate-500 text-xs tracking-wide leading-relaxed italic">Intelligence data confirmed. Mirroring active on all devices.</p>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-32 h-32" /></div>
              </section>
            </div>
          </div>
        )}

        {/* --- TASKS TAB --- */}
        {activeTab === 'tasks' && (
          <div className="animate-in slide-in-from-right duration-500 space-y-6 lg:space-y-12 pb-10 max-w-4xl mx-auto">
             <div className="bg-[#0f172a] border border-slate-800 p-6 lg:p-10 rounded-[32px] lg:rounded-[50px] shadow-2xl space-y-8 lg:space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                   <div className="space-y-3">
                     <label className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Target Context</label>
                     <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 font-black outline-none appearance-none italic shadow-xl">
                        {EXAM_DATA.map(e => <option key={e.id} value={e.id}>{e.subject}</option>)}
                     </select>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Define Objective</label>
                     <div className="flex gap-2">
                        <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Actionable goal..." className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 font-bold outline-none italic shadow-md" />
                        <button onClick={() => { if(newTaskText) { const up = [{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]; setTasks(up); sync('tasks', up); setNewTaskText(''); } }} className="bg-blue-600 text-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-xl active:scale-90 transition-all"><Plus size={20}/></button>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                   {EXAM_DATA.map(subj => {
                     const sTasks = tasks.filter(t => t.subjectId === subj.id);
                     if (sTasks.length === 0) return null;
                     return (
                       <div key={subj.id} className="p-5 lg:p-7 bg-slate-900/40 border border-slate-800 rounded-[28px] lg:rounded-[40px] space-y-4 shadow-xl">
                          <div className="flex items-center gap-3"><div className={`w-1.5 h-6 rounded-full ${subj.color}`} /><h3 className="font-black text-white uppercase text-[10px] lg:text-[11px] tracking-widest italic">{subj.subject}</h3></div>
                          <div className="space-y-2 lg:space-y-3">
                            {sTasks.map(t => (
                              <div key={t.id} className="flex items-center gap-3 bg-slate-800/20 p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => { const up = tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x); setTasks(up); sync('tasks', up); }} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-green-500 border-green-500' : 'border-slate-700'}`}>{t.completed && <CheckCircle2 size={12} className="text-white"/>}</button>
                                <span className={`text-xs font-bold flex-1 italic ${t.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{t.text}</span>
                                <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={14} /></button>
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

        {/* --- NOTES TAB --- */}
        {activeTab === 'notes' && (
          <div className="animate-in slide-in-from-right h-full pb-20">
            {activeNoteId ? (
              <NoteEditor note={notes.find(n => n.id === activeNoteId)} onSave={(u) => { const n = notes.map(x => x.id === u.id ? u : x); setNotes(n); sync('notes', n); setActiveNoteId(null); }} onCancel={() => setActiveNoteId(null)} onDelete={(id) => { const n = notes.filter(x => x.id !== id); setNotes(n); sync('notes', n); setActiveNoteId(null); }} />
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                <div className="w-full lg:w-[280px] bg-[#0f172a] border border-slate-800 rounded-[32px] p-6 shadow-2xl h-fit overflow-x-auto">
                  <div className="flex lg:flex-col gap-2">
                    {EXAM_DATA.map(subj => (
                      <button key={subj.id} onClick={() => { const n = { id: Date.now(), subjectId: subj.id, title: 'New Brief', content: '' }; const up = [n, ...notes]; setNotes(up); sync('notes', up); setActiveNoteId(n.id); }} className="whitespace-nowrap lg:w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 active:scale-95">
                        <div className={`w-2 h-2 rounded-full ${subj.color}`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{subj.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                   <div className="flex justify-between items-center bg-[#0a0f18]/90 backdrop-blur sticky top-0 py-2 border-b border-slate-800 z-20">
                      <h2 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">BRIEFING <span className="text-blue-500">LAB</span></h2>
                      <button onClick={() => { const n = { id: Date.now(), subjectId: 'macro', title: 'New Note', content: '' }; const up = [n, ...notes]; setNotes(up); sync('notes', up); setActiveNoteId(n.id); }} className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase shadow-xl active:scale-90">+ Entry</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      {notes.map(note => (
                        <button key={note.id} onClick={() => setActiveNoteId(note.id)} className="bg-[#0f172a] border border-slate-800 p-6 rounded-[28px] text-left shadow-xl h-fit active:scale-[0.98] transition-all">
                           <div className="flex items-center gap-2 mb-3"><div className={`w-1.5 h-6 rounded-full ${EXAM_DATA.find(e => e.id === note.subjectId)?.color}`} /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{EXAM_DATA.find(e => e.id === note.subjectId)?.subject}</span></div>
                           <h4 className="text-white font-black text-lg mb-2 italic group-hover:text-blue-400 leading-tight uppercase">{note.title || 'Untitled'}</h4>
                           <div className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed italic border-l-2 border-slate-800 pl-3">{note.content || 'Pending initialization...'}</div>
                        </button>
                      ))}
                      {notes.length === 0 && <div className="col-span-full py-20 text-center opacity-10 flex flex-col items-center"><FileText size={60} className="mb-4"/><p className="text-[10px] font-black uppercase tracking-widest italic">Vault Offline</p></div>}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CALENDAR TAB --- */}
        {activeTab === 'calendar' && (
          <div className="animate-in zoom-in-95 duration-700 space-y-8 pb-10">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-[32px] lg:rounded-[50px] p-6 lg:p-10 shadow-2xl">
                <h2 className="text-xl lg:text-3xl font-black text-white italic uppercase tracking-tighter mb-8 lg:mb-12">Planner <span className="text-blue-500">2026</span></h2>
                <div className="grid grid-cols-7 gap-2 lg:gap-5">
                  {['M','T','W','T','F','S','S'].map((d, i) => <div key={i} className="text-center text-[8px] lg:text-[10px] font-black text-slate-700 uppercase mb-4">{d}</div>)}
                  {Array.from({length: 14}, (_, i) => 18 + i).map(day => {
                    const exams = EXAM_DATA.filter(e => e.date?.includes(`-05-${day}`));
                    const isSelected = selectedDate === day;
                    return (
                      <button key={`day-${day}`} onClick={() => setSelectedDate(day)} className={`relative aspect-square rounded-[30%] lg:rounded-[38%] flex flex-col items-center justify-center transition-all border-2 active:scale-90 ${isSelected ? 'bg-blue-600 border-blue-400 shadow-2xl scale-105 z-10' : 'bg-[#0a0f18] border-transparent hover:border-slate-800 shadow-sm'}`}>
                        <span className={`text-base lg:text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                        {exams.length > 0 && <div className="absolute bottom-2 lg:bottom-4 flex gap-1">{exams.map(e => <div key={e.id} className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${isSelected ? 'bg-white' : e.color}`}></div>)}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full lg:w-[400px] bg-[#0f172a] border border-slate-800 rounded-[32px] lg:rounded-[50px] p-6 lg:p-10 h-fit shadow-2xl space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 rounded-[30%] flex flex-col items-center justify-center shadow-2xl shrink-0 italic">
                    <span className="text-[8px] font-black text-white/50 uppercase leading-none italic">MAY</span>
                    <span className="text-3xl font-black text-white leading-none tracking-tighter italic">{selectedDate}</span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tighter italic leading-none uppercase">Agenda</h3>
                </div>
                <div className="space-y-4">
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).map(exam => (
                    <div key={exam.id} className="p-5 rounded-[28px] border bg-[#0a0f18] border-slate-800 shadow-sm space-y-4">
                      <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${exam.color} text-white`}>{exam.status}</span>
                      <h4 className="text-white font-black text-lg italic leading-tight uppercase tracking-tighter">{exam.subject}</h4>
                      <button onClick={() => setSelectedExam(exam)} className="w-full bg-slate-800 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 active:scale-95 transition-all">Details</button>
                    </div>
                  ))}
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).length === 0 && <div className="text-center opacity-10 py-10 flex flex-col items-center"><Coffee size={40} className="mb-3"/><p className="text-[9px] font-black uppercase tracking-widest italic leading-none">Study Window</p></div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedExam && <SubjectModal exam={selectedExam} onClose={() => setSelectedExam(null)} resources={resources} notes={notes} confidence={confidence} onConfidenceUpdate={handleConf} />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
export default App;
