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

// --- FULL ACADEMIC DATA ---
const EXAM_DATA = [
  { id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', time: '10:00 AM - 01:00 PM', internal: 39.5, needed: 0.5, status: 'PASS SECURED', color: 'bg-green-500', breakdown: [{ name: 'Assignments', max: 20, score: 13.5 }, { name: 'Midterm', max: 20, score: 16 }, { name: 'UNCC Certification', max: 10, score: 10 }] },
  { id: 'pom', subject: 'Principles of Management', date: '2026-05-20', time: '10:00 AM - 01:00 PM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-emerald-600', breakdown: [{ name: 'Participation', max: 20, score: 15 }, { name: 'Group Project', max: 50, score: 30 }] },
  { id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', time: '10:00 AM - 01:00 PM', internal: 19, needed: 21, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Midterm', max: 30, score: 14 }, { name: 'Group Assignments', max: 20, score: 5 }] },
  { id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM - 01:00 PM', internal: 32, needed: 8, status: 'STUDY HARD', color: 'bg-orange-500', breakdown: [{ name: 'Group Assignment', max: 40, score: 20 }, { name: 'Class Participation', max: 10, score: 5 }, { name: 'Quiz', max: 10, score: 7 }] },
  { id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM - 01:00 PM', internal: 34, needed: 6, status: 'STUDY HARD', color: 'bg-yellow-500', breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }, { name: 'Class Participation', max: 10, score: 5 }] },
  { id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM - 01:00 PM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-blue-500', breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Viva', max: 10, score: 0 }, { name: 'Quizzes', max: 20, score: 15 }, { name: 'Class Participation', max: 10, score: 5 }] },
  { id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM - 05:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] },
  { id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM - 05:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] }
];

// --- COMPONENTS ---

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

const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
  const [localNote, setLocalNote] = useState(note);
  const [viewMode, setViewMode] = useState('edit');
  useEffect(() => { setLocalNote(note); }, [note.id]);
  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex gap-2">
          <button onClick={() => setViewMode('edit')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Edit</button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Preview</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(localNote)} className="bg-green-600 p-2 rounded-xl"><Save size={16} /></button>
          <button onClick={() => onDelete(localNote.id)} className="bg-red-600/10 text-red-500 p-2 rounded-xl"><Trash2 size={16} /></button>
          <button onClick={onCancel} className="text-slate-500 p-2"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'edit' ? (
          <div className="space-y-6">
            <input value={localNote.title || ''} onChange={(e) => setLocalNote({...localNote, title: e.target.value})} placeholder="Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none italic" />
            <textarea value={localNote.content || ''} onChange={(e) => setLocalNote({...localNote, content: e.target.value})} className="w-full h-[500px] bg-transparent text-slate-300 text-sm outline-none resize-none" placeholder="Start typing briefings..." />
          </div>
        ) : (
          <div className="prose prose-invert">{formatMarkdown(localNote.content)}</div>
        )}
      </div>
    </div>
  );
};

const SubjectModal = ({ exam, onClose, resources, notes, confidence, onConfidenceUpdate }) => {
  const subNotes = notes.filter(n => n.subjectId === exam.id);
  const subRes = resources.filter(r => r.subjectId === exam.id);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        <div className={`p-8 ${exam.color} flex justify-between items-start shrink-0`}>
          <div>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{exam.subject}</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-2 inline-block tracking-widest">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar bg-gradient-to-b from-[#0f172a] to-[#0a0f18]">
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge size={14} className="text-blue-500" /> Readiness: {confidence[exam.id] || 0}%</h4>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 accent-blue-500 cursor-pointer" />
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-black italic">Internal Progress</h4>
              {exam.breakdown?.map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 uppercase italic"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner"><div className={`h-full ${exam.color} transition-all duration-1000`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                </div>
              ))}
              <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End-Term Goal</span>
                <span className={`text-2xl font-black italic ${exam.needed === 0 ? 'text-green-500' : 'text-red-500'}`}>{exam.needed} MARKS</span>  };

  return (
    <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center p-6 font-sans">
      <form onSubmit={checkPass} className="bg-[#0f172a] border border-slate-800 p-10 rounded-[40px] w-full max-w-md shadow-2xl space-y-8 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shadow-xl shadow-blue-500/5">
            <Lock className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Command <span className="text-blue-500">Pro</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Security Protocol Active</p>
        </div>
        <div className="space-y-4">
          <input 
            type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(false); }}
            placeholder="Enter Access Key..."
            className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-800'} rounded-2xl p-5 text-white font-black text-center outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
          />
          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center animate-bounce">Access Denied</p>}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-500 transition-all active:scale-95">Verify Intel</button>
      </form>
    </div>
  );
};

// --- SUBJECT MODAL ---
const SubjectModal = ({ exam, onClose, resources, notes, confidence, onConfidenceUpdate }) => {
  const subNotes = notes.filter(n => n.subjectId === exam.id);
  const subRes = resources.filter(r => r.subjectId === exam.id);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        <div className={`p-8 ${exam.color} flex justify-between items-start shrink-0`}>
          <div>
            <h3 className="text-3xl font-black text-white italic uppercase leading-none">{exam.subject}</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-4 inline-block">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10 custom-scrollbar">
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-7 rounded-[32px] border border-slate-800 space-y-4 shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge size={14} className="text-blue-500" /> Readiness: {confidence[exam.id] || 0}%</h4>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 accent-blue-500 cursor-pointer" />
            </div>
            <div className="bg-slate-900/50 p-7 rounded-[32px] border border-slate-800 space-y-6 shadow-xl">
              <div className="flex justify-between items-end">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-black italic">Internal Progress</h4>
                <div className="text-right"><span className="text-[8px] font-black text-slate-500 block uppercase">Internal Sum</span><span className="text-2xl font-black text-white italic">{exam.internal || 0} Marks</span></div>
              </div>
              <div className="space-y-4">
                {exam.breakdown?.map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase italic"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner"><div className={`h-full ${exam.color} transition-all duration-1000`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">Threshold Goal</span>
                   <span className={`text-2xl font-black italic ${exam.needed === 0 ? 'text-green-500' : 'text-red-500'}`}>{exam.needed} MARKS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2 font-black italic"><LinkIcon size={14} /> Assets</h4>
            {subRes.map(res => <a key={res.id} href={res.url} target="_blank" className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all shadow-xl italic"><span className="text-xs font-bold text-white">{res.title}</span><ExternalLink size={12} className="text-slate-500" /></a>)}
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 pt-4 flex items-center gap-2 font-black italic"><StickyNote size={14} /> Notes</h4>
            {subNotes.map(note => <div key={note.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] shadow-lg"><h5 className="text-white font-black mb-2 italic">{note.title}</h5><p className="text-xs text-slate-500 italic line-clamp-3">{note.content}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(21);
  const [selectedSubjectId, setSelectedSubjectId] = useState('macro');
  const [newTaskText, setNewTaskText] = useState('');
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

    const channel = supabase.channel('sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'command_pro_data' }, (payload) => {
      const { id, content } = payload.new;
      if (id === 'tasks') setTasks(content);
      if (id === 'notes') setNotes(content);
      if (id === 'confidence') setConfidence(content);
      if (id === 'resources') setResources(content);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const stats = useMemo(() => {
    const academics = EXAM_DATA.filter(e => e.id !== 'general');
    const avgReady = Math.round(academics.reduce((sum, e) => sum + (parseInt(confidence[e.id]) || 0), 0) / academics.length) || 0;
    return { critical: EXAM_DATA.filter(d => d.status.includes('CRITICAL')).length, avgReady, noteCount: notes.length, taskDone: tasks.filter(t => t.completed).length };
  }, [notes, tasks, confidence]);

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  if (!isAuthenticated) return <PasswordWall onAuthenticated={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans pb-24 lg:pb-0 selection:bg-blue-500/30">
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r flex justify-around items-center p-4">
        {[{ id: 'overview', icon: <LayoutDashboard /> }, { id: 'tasks', icon: <BookOpen /> }, { id: 'notes', icon: <StickyNote /> }, { id: 'calendar', icon: <CalendarIcon /> }].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800'}`}>{item.icon}</button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div><h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">COMMAND <span className="text-blue-500">PRO</span></h1><p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Academic Readiness System 2026</p></div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6 shadow-2xl">
            <div className="flex flex-col items-center min-w-[70px]"><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Work session</span><span className="text-2xl font-black text-white tabular-nums italic tracking-tighter leading-none">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span></div>
            <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl ${isActive ? 'bg-slate-800' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>{isActive ? <X size={16}/> : <Zap size={16}/>}</button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[ { l: 'Critical Priority', v: stats.critical, c: 'text-red-500', i: <Flame /> }, { l: 'Avg Readiness', v: stats.avgReady + '%', c: 'text-blue-500', i: <Gauge /> }, { l: 'Study Briefs', v: stats.noteCount, c: 'text-purple-500', i: <StickyNote /> }, { l: 'Goals Met', v: stats.taskDone, c: 'text-green-500', i: <CheckCircle2 /> }].map((s, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px] hover:border-slate-600 shadow-xl"><div className={`flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest ${s.c}`}>{s.i} {s.l}</div><div className="text-5xl font-black text-white italic">{s.v}</div></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter ml-2 italic">Academic Roadmap</h2>
                <div className="space-y-4">
                  {EXAM_DATA.map(exam => (
                    <button key={exam.id} onClick={() => setSelectedExam(exam)} className={`w-full text-left bg-[#0f172a] border p-6 rounded-[36px] transition-all group flex items-center gap-6 ${exam.status.includes('CRITICAL') ? 'border-red-500/30 shadow-lg shadow-red-500/5' : 'border-slate-800'} hover:border-blue-500 shadow-xl`}>
                       <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}>
                          <span className="text-[8px] font-black uppercase">MAY</span>
                          <span className="text-2xl font-black leading-none mt-1 italic">{exam.date.split('-')[2]}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-white font-black group-hover:text-blue-400 transition-colors truncate text-xl leading-tight italic">{exam.subject}</h4>
                          <div className="flex items-center gap-3 mt-2">
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${exam.color} text-white`}>{exam.status}</span>
                             <div className="h-1 flex-1 max-w-[80px] bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${confidence[exam.id]||0}%`}}></div></div>
                             <span className="text-[9px] font-black text-slate-500 uppercase">{confidence[exam.id] || 0}% READY</span>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-700 transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden shadow-2xl group">
                 <div className="w-24 h-24 bg-red-500/10 rounded-[40%] flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-500 shadow-xl"><ShieldCheck className="w-12 h-12 text-blue-500" /></div>
                 <div><h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Secure Ecosystem Active</h3><p className="text-slate-500 text-xs mt-4 tracking-wide font-medium leading-relaxed italic">Verification complete. Intelligence data is currently mirrored across all authenticated devices.</p></div>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-40 h-40" /></div>
              </section>
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
