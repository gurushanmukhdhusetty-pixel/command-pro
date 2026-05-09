import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, StickyNote, CheckCircle2, 
  Clock, AlertCircle, Plus, Trash2, Target, X, ChevronRight, Info, 
  BarChart3, Timer, ExternalLink, Link as LinkIcon, Presentation, Save, 
  Flame, Zap, Coffee, FileText, Edit3, Eye, Gauge, Trophy
} from 'lucide-react';

// --- DATABASE CONNECTION ---
const supabaseUrl = 'https://mudpqfifjoinkaxclifr.supabase.co';
const supabaseKey = 'sb_publishable_hnBkr1rLjy0gCzyUoXruDg_Qxs5vlIu';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- FULL ACADEMIC CONFIGURATION ---
const EXAM_DATA = [
  { id: 'general', subject: 'General Strategy', color: 'bg-slate-500', type: 'Meta' },
  {
    id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', time: '10:00 AM - 01:00 PM',
    internal: 39.5, needed: 0.5, status: 'PASS SECURED', color: 'bg-green-500',
    breakdown: [{ name: 'Assignments', max: 20, score: 13.5 }, { name: 'Midterm', max: 20, score: 16 }, { name: 'UNCC Certification', max: 10, score: 10 }]
  },
  {
    id: 'pom', subject: 'Principles of Management', date: '2026-05-20', time: '10:00 AM - 01:00 PM',
    internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-emerald-600',
    breakdown: [{ name: 'Participation', max: 20, score: 15 }, { name: 'Group Project', max: 50, score: 30 }]
  },
  {
    id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', time: '10:00 AM - 01:00 PM',
    internal: 19, needed: 21, status: 'CRITICAL FOCUS', color: 'bg-red-500',
    breakdown: [{ name: 'Midterm', max: 30, score: 14 }, { name: 'Assignments', max: 20, score: 5 }]
  },
  {
    id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM - 01:00 PM',
    internal: 32, needed: 8, status: 'STUDY HARD', color: 'bg-orange-500',
    breakdown: [{ name: 'Assignment', max: 40, score: 20 }, { name: 'Quiz', max: 10, score: 7 }]
  },
  {
    id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM - 01:00 PM',
    internal: 34, needed: 6, status: 'STUDY HARD', color: 'bg-yellow-500',
    breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }]
  },
  {
    id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM - 01:00 PM',
    internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-blue-500',
    breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Quizzes', max: 20, score: 15 }]
  },
  {
    id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM - 05:00 PM',
    needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500',
    breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }]
  },
  {
    id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM - 05:00 PM',
    needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500',
    breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }]
  }
];

const formatMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h4 key={i} className="text-white font-bold text-lg mt-4 mb-2 italic tracking-tight">{line.replace('### ', '')}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="text-blue-400 font-bold text-xl mt-5 mb-2 italic tracking-tighter">{line.replace('## ', '')}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="text-blue-500 font-black text-2xl mt-6 mb-3 border-b border-slate-800 pb-2 italic uppercase tracking-tighter">{line.replace('# ', '')}</h2>;
    if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
    return <p key={i} className="text-slate-400 text-sm mb-2 leading-relaxed">{line}</p>;
  });
};

// --- SUB-COMPONENTS ---

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
          <button onClick={() => onSave(localNote)} className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-500 transition-all"><Save size={16} /></button>
          <button onClick={() => onDelete(localNote.id)} className="bg-red-600/10 text-red-500 p-2 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
          <button onClick={onCancel} className="text-slate-500 p-2 hover:text-white"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'edit' ? (
          <div className="space-y-6">
            <input value={localNote.title || ''} onChange={(e) => setLocalNote({...localNote, title: e.target.value})} placeholder="Brief Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none italic placeholder:text-slate-800" />
            <input value={localNote.subtitle || ''} onChange={(e) => setLocalNote({...localNote, subtitle: e.target.value})} placeholder="Category..." className="w-full bg-transparent text-sm font-bold text-blue-500 uppercase tracking-widest outline-none" />
            <textarea value={localNote.content || ''} onChange={(e) => setLocalNote({...localNote, content: e.target.value})} className="w-full h-[500px] bg-transparent text-slate-300 text-sm outline-none resize-none" placeholder="Initialize concepts..." />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
             <h1 className="text-4xl font-black text-white italic mb-2 uppercase tracking-tighter">{localNote.title || 'Untitled'}</h1>
             <p className="text-sm font-black text-blue-500 uppercase tracking-widest mb-8">{localNote.subtitle || 'Uncategorized'}</p>
             <div className="prose prose-invert">{formatMarkdown(localNote.content)}</div>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        <div className={`p-8 ${exam.color} flex justify-between items-start shrink-0`}>
          <div>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{exam.subject}</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-4 inline-block tracking-widest">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10 custom-scrollbar bg-[#0a0f18]/30">
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-7 rounded-[32px] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge size={14} className="text-blue-500" /> Readiness Meter</h4>
                 <span className="text-xl font-black text-blue-500 italic">{confidence[exam.id] || 0}%</span>
              </div>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 accent-blue-500 cursor-pointer bg-slate-800 rounded-lg appearance-none" />
            </div>
            <div className="bg-slate-900/50 p-7 rounded-[32px] border border-slate-800 space-y-6 shadow-xl">
              <div className="flex justify-between items-end">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={14} /> Intelligence</h4>
                <div className="text-right"><span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Internal Grade</span><span className="text-2xl font-black text-white italic leading-none">{exam.internal || 0}/50</span></div>
              </div>
              <div className="space-y-4">
                {exam.breakdown?.map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${exam.color} transition-all duration-1000`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Trophy size={12}/> Goal Threshold</span>
                   <span className={`text-2xl font-black italic ${exam.needed === 0 ? 'text-green-500' : 'text-red-500'}`}>{exam.needed} MARKS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2"><LinkIcon size={14} /> Material Assets</h4>
            <div className="space-y-3">
              {subRes.map(res => <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all shadow-lg group"><span className="text-xs font-bold text-white italic group-hover:text-blue-400">{res.title}</span><ExternalLink size={12} className="text-slate-500 group-hover:text-blue-500" /></a>)}
              {subRes.length === 0 && <div className="p-8 border-2 border-dashed border-slate-800/50 rounded-3xl text-center opacity-30 text-[10px] font-black uppercase">No Assets Linked</div>}
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2"><StickyNote size={14} /> Subject Briefs</h4>
            <div className="space-y-4">
              {subNotes.map(note => <div key={note.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] shadow-lg group hover:border-slate-700 transition-all"><h5 className="text-white font-black mb-2 italic">{note.title}</h5><p className="text-xs text-slate-500 italic line-clamp-3 leading-relaxed">{note.content}</p></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(21);
  const [selectedSubjectId, setSelectedSubjectId] = useState('macro');
  const [newTaskText, setNewTaskText] = useState('');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [timerMode, setTimerMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Persistence State
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [confidence, setConfidence] = useState({});

  // Sync Logic
  useEffect(() => {
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
      const { id, content } = p.new;
      if (id === 'tasks') setTasks(content);
      if (id === 'notes') setNotes(content);
      if (id === 'confidence') setConfidence(content);
      if (id === 'resources') setResources(content);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sync = async (id, content) => { await supabase.from('command_pro_data').upsert({ id, content }); };

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0) { setIsActive(false); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const stats = useMemo(() => {
    const academics = EXAM_DATA.filter(e => e.id !== 'general');
    const avgReady = Math.round(academics.reduce((sum, e) => sum + (parseInt(confidence[e.id]) || 0), 0) / academics.length) || 0;
    return { critical: EXAM_DATA.filter(d => d.status === 'CRITICAL FOCUS').length, avgReady, noteCount: notes.length, taskDone: tasks.filter(t => t.completed).length };
  }, [notes, tasks, confidence]);

  const createNote = (subId) => {
    const newNote = { id: Date.now(), subjectId: subId || 'general', title: 'New Brief', content: '' };
    const up = [newNote, ...notes];
    setNotes(up);
    sync('notes', up);
    setActiveNoteId(newNote.id);
    setActiveTab('notes');
  };

  const handleConf = (id, val) => {
    const up = { ...confidence, [id]: val };
    setConfidence(up);
    sync('confidence', up);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans pb-24 lg:pb-0 selection:bg-blue-500/30">
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r flex justify-around items-center p-4">
        {[{ id: 'overview', icon: <LayoutDashboard /> }, { id: 'tasks', icon: <BookOpen /> }, { id: 'notes', icon: <StickyNote /> }, { id: 'calendar', icon: <CalendarIcon /> }].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800'}`}>{item.icon}</button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div><h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">COMMAND <span className="text-blue-500">PRO</span></h1><p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Academic Readiness System 2026</p></div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6 shadow-2xl">
            <div className="flex flex-col items-center min-w-[70px]"><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{timerMode} session</span><span className="text-2xl font-black text-white tabular-nums italic">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span></div>
            <div className="flex gap-2">
              <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-slate-800' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>{isActive ? <X size={16}/> : <Zap size={16}/>}</button>
              <button onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }} className="p-3 text-slate-500 hover:text-white transition-colors"><Timer size={16} /></button>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-700 space-y-12 pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[ { l: 'Critical Priority', v: stats.critical, c: 'text-red-500', i: <Flame /> }, { l: 'Avg Readiness', v: stats.avgReady + '%', c: 'text-blue-500', i: <Gauge /> }, { l: 'Study Briefs', v: stats.noteCount, c: 'text-purple-500', i: <StickyNote /> }, { l: 'Goals Met', v: stats.taskDone, c: 'text-green-500', i: <CheckCircle2 /> }].map((s, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px] hover:border-slate-600 transition-all shadow-xl"><div className={`flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest ${s.c}`}>{s.i} {s.l}</div><div className="text-5xl font-black text-white italic">{s.v}</div></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter ml-2">Academic Roadmap</h2>
                {EXAM_DATA.filter(e => e.id !== 'general').map(exam => (
                  <button key={exam.id} onClick={() => setSelectedExam(exam)} className={`w-full text-left bg-[#0f172a] border p-6 rounded-[36px] transition-all group flex items-center gap-6 ${exam.status === 'CRITICAL FOCUS' ? 'border-red-500/30' : 'border-slate-800'} hover:border-blue-500 shadow-xl`}>
                    <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}><span className="text-[8px] font-black uppercase">MAY</span><span className="text-2xl font-black leading-none mt-1">{exam.date.split('-')[2]}</span></div>
                    <div className="flex-1 min-w-0"><h4 className="text-white font-black italic text-xl truncate group-hover:text-blue-400 transition-colors leading-tight">{exam.subject}</h4><div className="flex items-center gap-3 mt-2"><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${exam.color} text-white`}>{exam.status}</span><div className="h-1 flex-1 max-w-[80px] bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${confidence[exam.id]||0}%`}}></div></div><span className="text-[9px] font-black text-slate-500 uppercase">{confidence[exam.id] || 0}% READY</span></div></div>
                  </button>
                ))}
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden shadow-2xl group">
                 <div className="w-24 h-24 bg-red-500/10 rounded-[40%] flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-500"><Target className="w-12 h-12 text-red-500" /></div>
                 <div><h3 className="text-3xl font-black text-white italic leading-tight">Cloud Sync Active</h3><p className="text-slate-500 text-xs mt-4 tracking-wide font-medium">System status: Online. Database mirrored across ecosystem.</p></div>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-32 h-32" /></div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-8 animate-in slide-in-from-right pb-20 max-w-4xl mx-auto">
            <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] space-y-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest italic">Subject Selection</label><select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 font-black outline-none focus:ring-4 focus:ring-blue-500/10 shadow-xl cursor-pointer italic">{EXAM_DATA.filter(e => e.id !== 'general').map(e => <option key={e.id} value={e.id}>{e.subject}</option>)}</select></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest italic">Action Objective</label><div className="flex gap-3"><input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && newTaskText) { const up = [{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]; setTasks(up); sync('tasks', up); setNewTaskText(''); } }} placeholder="Define goal..." className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 font-bold outline-none italic shadow-xl" /><button onClick={() => { if(newTaskText) { const up = [{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]; setTasks(up); sync('tasks', up); setNewTaskText(''); } }} className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl hover:bg-blue-500 transition-all"><Plus/></button></div></div>
              </div>
              <div className="pt-10 border-t border-slate-800 space-y-6">
                <h3 className="text-sm font-black text-blue-500 uppercase px-3 italic tracking-widest">Material Linker</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder="Asset Title..." className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-bold outline-none italic shadow-md" />
                  <input value={newResUrl} onChange={(e) => setNewResUrl(e.target.value)} placeholder="URL..." className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-bold outline-none shadow-md" />
                  <button onClick={() => { if(newResTitle && newResUrl) { const up = [{id: Date.now(), subjectId: selectedSubjectId, title: newResTitle, url: newResUrl}, ...resources]; setResources(up); sync('resources', up); setNewResTitle(''); setNewResUrl(''); } }} className="bg-green-600 text-white font-black p-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg flex items-center justify-center gap-2"><LinkIcon size={14}/> LINK ASSET</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                {EXAM_DATA.filter(e => e.id !== 'general').map(subj => {
                  const sTasks = tasks.filter(t => t.subjectId === subj.id);
                  if (sTasks.length === 0) return null;
                  return (
                    <div key={subj.id} className="p-7 bg-slate-900/40 border border-slate-800 rounded-[40px] space-y-5 shadow-xl transition-all hover:border-slate-700">
                      <div className="flex items-center gap-3 px-1"><div className={`w-2 h-7 rounded-full ${subj.color}`} /><h4 className="font-black text-white italic text-[11px] uppercase tracking-widest">{subj.subject}</h4></div>
                      <div className="space-y-3">
                        {sTasks.map(t => (
                          <div key={t.id} className="flex items-center gap-4 bg-slate-800/30 p-5 rounded-3xl border border-slate-800 group transition-all hover:border-blue-500/30">
                            <button onClick={() => { const up = tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x); setTasks(up); sync('tasks', up); }} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-green-500 border-green-500' : 'border-slate-700 hover:border-blue-500'}`}>{t.completed && <CheckCircle2 size={16} className="text-white"/>}</button>
                            <span className={`text-sm font-bold flex-1 italic ${t.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{t.text}</span>
                            <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="opacity-0 group-hover:opacity-100 p-2"><Trash2 size={16} className="text-red-500 hover:scale-110 transition-transform" /></button>
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
          <div className="animate-in slide-in-from-right h-[calc(100vh-250px)] pb-20">
            {activeNoteId ? (
              <NoteEditor note={notes.find(n => n.id === activeNoteId)} onSave={(u) => { const n = notes.map(x => x.id === u.id ? u : x); setNotes(n); sync('notes', n); setActiveNoteId(null); }} onCancel={() => setActiveNoteId(null)} onDelete={(id) => { const n = notes.filter(x => x.id !== id); setNotes(n); sync('notes', n); setActiveNoteId(null); }} />
            ) : (
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-[320px] bg-[#0f172a] border border-slate-800 rounded-[40px] p-8 h-fit shadow-2xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 px-2 italic">Intelligence Hub</h3>
                  <div className="space-y-2">
                    {EXAM_DATA.map(subj => <button key={subj.id} onClick={() => createNote(subj.id)} className="w-full text-left p-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-between group"><div className="flex items-center gap-3 truncate"><div className={`w-2 h-2 rounded-full ${subj.color} shadow-sm shadow-black`} /><span className="text-xs font-black text-slate-400 group-hover:text-white truncate uppercase tracking-tighter leading-none italic">{subj.subject}</span></div><Plus size={14} className="text-slate-700 group-hover:text-blue-500"/></button>)}
                  </div>
                </div>
                <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar pb-32">
                  <div className="flex flex-col md:flex-row justify-between items-center bg-[#0a0f18]/90 backdrop-blur sticky top-0 py-4 border-b border-slate-800 z-20 gap-4">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">BRIEFING <span className="text-blue-500">LAB</span></h2>
                    <button onClick={() => createNote('general')} className="bg-blue-600 text-white px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all">+ NEW INTEL ENTRY</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {notes.map(note => (
                      <button key={note.id} onClick={() => setActiveNoteId(note.id)} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500 transition-all text-left shadow-xl h-fit group relative overflow-hidden">
                         <div className="flex items-center gap-3 mb-5"><div className={`w-2 h-8 rounded-full ${EXAM_DATA.find(e => e.id === note.subjectId)?.color}`} /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">{EXAM_DATA.find(e => e.id === note.subjectId)?.subject}</span></div>
                         <h4 className="text-white font-black text-2xl mb-4 italic group-hover:text-blue-400 transition-colors leading-tight">{note.title || 'Untitled Brief'}</h4>
                         <div className="text-sm text-slate-500 line-clamp-4 leading-relaxed font-medium italic border-l-2 border-slate-800 pl-4">{note.content || 'Notes pending...'}</div>
                      </button>
                    ))}
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
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-12">Planner <span className="text-blue-500">2026</span></h2>
                <div className="grid grid-cols-7 gap-5">
                  {Array.from({length: 14}, (_, i) => 18 + i).map(day => {
                    const exams = EXAM_DATA.filter(e => e.date?.includes(`-05-${day}`));
                    const isSelected = selectedDate === day;
                    return (
                      <button key={`day-${day}`} onClick={() => setSelectedDate(day)} className={`relative aspect-square rounded-[38%] flex flex-col items-center justify-center transition-all border-2 ${isSelected ? 'bg-blue-600 border-blue-400 shadow-2xl scale-105 z-10' : 'bg-[#0a0f18] border-transparent hover:border-slate-800'}`}>
                        <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                        {exams.length > 0 && <div className="absolute bottom-4 flex gap-1.5">{exams.map(e => <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : e.color}`}></div>)}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full lg:w-[400px] bg-[#0f172a] border border-slate-800 rounded-[50px] p-10 h-fit shadow-2xl space-y-10">
                <div className="flex items-center gap-7"><div className="w-24 h-24 bg-blue-600 rounded-[35%] flex flex-col items-center justify-center shadow-2xl shadow-blue-600/30 shrink-0"><span className="text-[10px] font-black text-white/50 uppercase leading-none mb-1">MAY</span><span className="text-5xl font-black text-white leading-none tracking-tighter">{selectedDate}</span></div><h3 className="text-2xl font-black text-white tracking-tighter italic leading-none uppercase">Agenda<br/><span className="text-blue-500 text-sm tracking-[0.2em] font-black uppercase not-italic">Intel Briefing</span></h3></div>
                <div className="space-y-6">
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).map(exam => (
                    <div key={exam.id} className={`p-7 rounded-[40px] border transition-all ${exam.status === 'CRITICAL FOCUS' ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0a0f18] border-slate-800'} shadow-lg group hover:border-blue-500`}>
                      <div className="flex justify-between items-start mb-6"><span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase ${exam.color} text-white shadow-xl`}>{exam.status}</span><Clock size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors"/></div>
                      <h4 className="text-white font-black text-2xl italic mb-2 tracking-tight leading-tight">{exam.subject}</h4>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 leading-none italic">{exam.time}</p>
                      <button onClick={() => setSelectedExam(exam)} className="w-full bg-slate-800 border border-slate-700 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-blue-600 transition-all shadow-md active:scale-95">Subject Detail</button>
                    </div>
                  ))}
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).length === 0 && <div className="text-center opacity-10 py-24 flex flex-col items-center"><Coffee size={50} className="mb-4"/><p className="text-[10px] font-black uppercase tracking-[0.4em] leading-none italic">Self-Study Window</p></div>}
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

// --- MOUNTING ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

export default App;
