import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, StickyNote, CheckCircle2, 
  Clock, AlertCircle, Plus, Trash2, Target, X, ChevronRight, Info, 
  BarChart3, Timer, ExternalLink, Link as LinkIcon, Presentation, Save, 
  Flame, Zap, Coffee, FileText, Edit3, Eye, Gauge
} from 'lucide-react';

// --- DATABASE CONNECTION ---
const supabaseUrl = 'https://mudpqfifjoinkaxclifr.supabase.co';
const supabaseKey = 'sb_publishable_hnBkr1rLjy0gCzyUoXruDg_Qxs5vlIu';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURATION & DATA ---
const EXAM_DATA = [
  { id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', time: '10:00 AM', internal: 39.5, needed: 0.5, status: 'PASS SECURED', color: 'bg-green-500', breakdown: [{ name: 'Assignments', max: 20, score: 13.5 }, { name: 'Midterm', max: 20, score: 16 }, { name: 'UNCC Certification', max: 10, score: 10 }] },
  { id: 'pom', subject: 'Principles of Management', date: '2026-05-20', time: '10:00 AM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-emerald-600', breakdown: [{ name: 'Participation', max: 20, score: 15 }, { name: 'Group Project', max: 50, score: 30 }] },
  { id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', time: '10:00 AM', internal: 19, needed: 21, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Midterm', max: 30, score: 14 }, { name: 'Assignments', max: 20, score: 5 }] },
  { id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM', internal: 32, needed: 8, status: 'STUDY HARD', color: 'bg-orange-500', breakdown: [{ name: 'Assignment', max: 40, score: 20 }, { name: 'Quiz', max: 10, score: 7 }] },
  { id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM', internal: 34, needed: 6, status: 'STUDY HARD', color: 'bg-yellow-500', breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }] },
  { id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-blue-500', breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Quizzes', max: 20, score: 15 }] },
  { id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] },
  { id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] }
];

const formatMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h4 key={i} className="text-white font-bold text-lg mt-4 mb-2">{line.replace('### ', '')}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="text-blue-400 font-bold text-xl mt-5 mb-2">{line.replace('## ', '')}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="text-blue-500 font-black text-2xl mt-6 mb-3 border-b border-slate-800 pb-2">{line.replace('# ', '')}</h2>;
    if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
    return <p key={i} className="text-slate-400 text-sm mb-2 leading-relaxed">{line}</p>;
  });
};

const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
  const [localNote, setLocalNote] = useState(note);
  const [viewMode, setViewMode] = useState('edit');
  useEffect(() => { setLocalNote(note); }, [note.id]);
  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex gap-2">
          <button onClick={() => setViewMode('edit')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Edit</button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Preview</button>
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
            <input value={localNote.title || ''} onChange={(e) => setLocalNote({...localNote, title: e.target.value})} placeholder="Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none" />
            <textarea value={localNote.content || ''} onChange={(e) => setLocalNote({...localNote, content: e.target.value})} className="w-full h-[500px] bg-transparent text-slate-300 text-sm outline-none resize-none" />
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`p-8 ${exam.color} flex justify-between items-start`}>
          <div>
            <h3 className="text-3xl font-black text-white italic uppercase">{exam.subject}</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-2 inline-block tracking-widest">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge size={14} className="text-blue-500" /> Readiness: {confidence[exam.id] || 0}%</h4>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 accent-blue-500 cursor-pointer" />
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={14} /> Internal Breakdown</h4>
              {exam.breakdown?.map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${exam.color}`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><LinkIcon size={14} /> Study Assets</h4>
            {subRes.map(res => <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all"><span className="text-xs font-bold text-white">{res.title}</span><ExternalLink size={12} className="text-slate-500" /></a>)}
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 flex items-center gap-2"><StickyNote size={14} /> Subject Notes</h4>
            {subNotes.map(note => <div key={note.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px]"><h5 className="text-white font-black mb-2 italic">{note.title}</h5><p className="text-xs text-slate-500 italic line-clamp-3">{note.content}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(21);
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
  }, []);

  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const stats = useMemo(() => {
    const academicExams = EXAM_DATA.filter(e => e.id !== 'general');
    const avgReady = Math.round(academicExams.reduce((sum, e) => sum + (parseInt(confidence[e.id]) || 0), 0) / academicExams.length) || 0;
    return { critical: EXAM_DATA.filter(d => d.status === 'CRITICAL FOCUS').length, avgReady, noteCount: notes.length, taskDone: tasks.filter(t => t.completed).length };
  }, [notes, tasks, confidence]);

  const createNote = (subId) => {
    const newNote = { id: Date.now(), subjectId: subId || 'general', title: 'New Study Brief', content: '' };
    const updated = [newNote, ...notes];
    setNotes(updated);
    sync('notes', updated);
    setActiveNoteId(newNote.id);
    setActiveTab('notes');
  };

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 pb-24 lg:pb-0 font-sans selection:bg-blue-500/30">
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r flex justify-around items-center p-4">
        {[{ id: 'overview', icon: <LayoutDashboard /> }, { id: 'tasks', icon: <BookOpen /> }, { id: 'notes', icon: <StickyNote /> }, { id: 'calendar', icon: <CalendarIcon /> }].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>{item.icon}</button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div><h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">COMMAND <span className="text-blue-500">PRO</span></h1><p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Readiness System 2026</p></div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6 shadow-2xl">
            <div className="flex flex-col items-center min-w-[70px]"><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Work session</span><span className="text-2xl font-black text-white tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span></div>
            <div className="flex gap-2">
              <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl ${isActive ? 'bg-slate-800' : 'bg-blue-600 text-white shadow-lg'}`}>{isActive ? <X size={16}/> : <Zap size={16}/>}</button>
              <button onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }} className="p-3 text-slate-500 hover:text-white"><Timer size={16} /></button>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[ { l: 'Critical Priority', v: stats.critical, c: 'text-red-500', i: <Flame /> }, { l: 'Avg Readiness', v: stats.avgReady + '%', c: 'text-blue-500', i: <Gauge /> }, { l: 'Study Briefs', v: stats.noteCount, c: 'text-purple-500', i: <StickyNote /> }, { l: 'Goals Met', v: stats.taskDone, c: 'text-green-500', i: <CheckCircle2 /> }].map((s, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px] hover:border-slate-600 transition-all shadow-xl">
                  <div className={`flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest ${s.c}`}>{s.i} {s.l}</div>
                  <div className="text-5xl font-black text-white">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter ml-2">Academic Roadmap</h2>
                {EXAM_DATA.filter(e => e.id !== 'general').map(exam => (
                  <button key={exam.id} onClick={() => setSelectedExam(exam)} className={`w-full text-left bg-[#0f172a] border p-6 rounded-[36px] transition-all group flex items-center gap-6 ${exam.status === 'CRITICAL FOCUS' ? 'border-red-500/30' : 'border-slate-800'} hover:border-blue-500 shadow-xl`}>
                    <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}><span className="text-[8px] font-black uppercase">MAY</span><span className="text-2xl font-black leading-none mt-1">{exam.date.split('-')[2]}</span></div>
                    <div className="flex-1 min-w-0"><h4 className="text-white font-black italic text-xl truncate group-hover:text-blue-400 transition-colors">{exam.subject}</h4><div className="flex items-center gap-3 mt-2"><div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${confidence[exam.id]||0}%`}}></div></div><span className="text-[9px] font-black text-slate-500 uppercase">{confidence[exam.id] || 0}% READY</span></div></div>
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-all" />
                  </button>
                ))}
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden shadow-2xl group">
                 <div className="w-24 h-24 bg-red-500/10 rounded-[40%] flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-500"><Target className="w-12 h-12 text-red-500" /></div>
                 <div><h3 className="text-3xl font-black text-white italic">Cloud Sync Active</h3><p className="text-slate-500 text-xs mt-4 tracking-wide font-medium">System status: Online. Database mirrored across 2026 ecosystem.</p></div>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Presentation className="w-32 h-32" /></div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-8 animate-in slide-in-from-right pb-20 max-w-4xl mx-auto">
            <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] space-y-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Subject Context</label><select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 font-black outline-none focus:ring-4 focus:ring-blue-500/10 shadow-xl">{EXAM_DATA.filter(e => e.id !== 'general').map(e => <option key={e.id} value={e.id}>{e.subject}</option>)}</select></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Action Objective</label><div className="flex gap-3"><input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && newTaskText) { const up = [{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]; setTasks(up); sync('tasks', up); setNewTaskText(''); } }} placeholder="Define goal..." className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 font-bold outline-none shadow-xl" /><button onClick={() => { if(newTaskText) { const up = [{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]; setTasks(up); sync('tasks', up); setNewTaskText(''); } }} className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl hover:bg-blue-500"><Plus/></button></div></div>
              </div>
              <div className="pt-10 border-t border-slate-800 space-y-6">
                <h3 className="text-sm font-black text-blue-500 uppercase px-3 italic tracking-[0.1em]">Material Linker</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder="Asset Title..." className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-bold outline-none" />
                  <input value={newResUrl} onChange={(e) => setNewResUrl(e.target.value)} placeholder="URL..." className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-bold outline-none" />
                  <button onClick={() => { if(newResTitle && newResUrl) { const up = [{id: Date.now(), subjectId: selectedSubjectId, title: newResTitle, url: newResUrl}, ...resources]; setResources(up); sync('resources', up); setNewResTitle(''); setNewResUrl(''); } }} className="bg-green-600 text-white font-black p-4 rounded-2xl text-xs hover:bg-green-500 transition-all shadow-lg flex items-center justify-center gap-2"><LinkIcon size={14}/> LINK ASSET</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                {EXAM_DATA.filter(e => e.id !== 'general').map(subj => {
                  const sTasks = tasks.filter(t => t.subjectId === subj.id);
                  if (sTasks.length === 0) return null;
                  return (
                    <div key={subj.id} className="p-7 bg-slate-900/40 border border-slate-800 rounded-[40px] space-y-5 shadow-xl">
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
              <NoteEditor note={notes.find(n => n.id === activeNoteId)} onSave={(upd) => { const up = notes.map(n => n.id === upd.id ? upd : n); setNotes(up); sync('notes', up); setActiveNoteId(null); }} onCancel={() => setActiveNoteId(null)} onDelete={(id) => { const up = notes.filter(n => n.id !== id); setNotes(up); sync('notes', up); setActiveNoteId(null); }} />
            ) : (
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-[320px] bg-[#0f172a] border border-slate-800 rounded-[40px] p-8 h-fit shadow-2xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 px-2 italic">Knowledge Hub</h3>
                  <div className="space-y-2">
                    {EXAM_DATA.map(subj => <button key={subj.id} onClick={() => createNote(subj.id)} className="w-full text-left p-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-between group"><div className="flex items-center gap-3 truncate"><div className={`w-2 h-2 rounded-full ${subj.color} shadow-sm shadow-black`} /><span className="text-xs font-black text-slate-400 group-hover:text-white truncate uppercase tracking-tighter">{subj.subject}</span></div><Plus size={14} className="text-slate-700 group-hover:text-blue-500 transition-colors"/></button>)}
                  </div>
                </div>
                <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar pb-32">
                  <div className="flex flex-col md:flex-row justify-between items-center bg-[#0a0f18]/90 backdrop-blur sticky top-0 py-4 border-b border-slate-800/50 z-20 gap-4">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">BRIEFING <span className="text-blue-500">LAB</span></h2>
                    <button onClick={() => createNote('general')} className="bg-blue-600 text-white px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30">+ NEW INTEL ENTRY</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {notes.map(note => (
                      <button key={note.id} onClick={() => setActiveNoteId(note.id)} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500 transition-all text-left shadow-xl h-fit group relative overflow-hidden">
                         <div className="flex items-center gap-3 mb-5"><div className={`w-2 h-8 rounded-full ${EXAM_DATA.find(e => e.id === note.subjectId)?.color}`} /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{EXAM_DATA.find(e => e.id === note.subjectId)?.subject}</span></div>
                         <h4 className="text-white font-black text-2xl mb-4 italic group-hover:text-blue-400 transition-colors">{note.title || 'Untitled Brief'}</h4>
                         <div className="text-sm text-slate-500 line-clamp-4 leading-relaxed font-medium italic border-l-2 border-slate-800 pl-4">{note.content || 'Notes pending initialization...'}</div>
                         <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-10 transition-opacity"><Edit3 size={40}/></div>
                      </button>
                    ))}
                    {notes.length === 0 && <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-10"><FileText size={80} className="mb-6"/><p className="text-xs font-black uppercase tracking-[0.5em]">Repository Offline</p></div>}
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
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 px-4 gap-6">
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">PLANNER <span className="text-blue-500">2026</span></h2>
                  <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 tracking-widest"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> CRITICAL</div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 tracking-widest"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" /> SELECTED</div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-5">
                  {['M','T','W','T','F','S','S'].map((d, i) => <div key={i} className="text-center text-[10px] font-black text-slate-700 uppercase tracking-widest mb-6">{d}</div>)}
                  {Array.from({length: 14}, (_, i) => 18 + i).map(day => {
                    const exams = EXAM_DATA.filter(e => e.date?.includes(`-05-${day}`));
                    const isSelected = selectedDate === day;
                    return (
                      <button key={`day-${day}`} onClick={() => setSelectedDate(day)} className={`relative aspect-square rounded-[38%] flex flex-col items-center justify-center transition-all border-2 ${isSelected ? 'bg-blue-600 border-blue-400 shadow-2xl scale-105 z-10' : 'bg-[#0a0f18] border-transparent hover:border-slate-800'}`}>
                        <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                        {exams.length > 0 && <div className="absolute bottom-4 flex gap-1.5">{exams.map(e => <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : e.color}`}></div>)}</div>}
                        {exams.some(e => e.status === 'CRITICAL FOCUS') && !isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full lg:w-[400px] bg-[#0f172a] border border-slate-800 rounded-[50px] p-10 h-fit shadow-2xl space-y-10 sticky top-10">
                <div className="flex items-center gap-7"><div className="w-24 h-24 bg-blue-600 rounded-[35%] flex flex-col items-center justify-center shadow-2xl shadow-blue-600/30 shrink-0"><span className="text-[10px] font-black text-white/50 uppercase leading-none mb-1">MAY</span><span className="text-5xl font-black text-white leading-none tracking-tighter">{selectedDate}</span></div><h3 className="text-2xl font-black text-white tracking-tighter italic leading-none">AGENDA<br/><span className="text-blue-500 text-sm tracking-[0.2em] font-black uppercase not-italic">Briefing</span></h3></div>
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).map(exam => (
                    <div key={exam.id} className={`p-7 rounded-[40px] border transition-all ${exam.status === 'CRITICAL FOCUS' ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0a0f18] border-slate-800'} shadow-lg group hover:border-blue-500`}>
                      <div className="flex justify-between items-start mb-6"><span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase ${exam.color} text-white shadow-xl`}>{exam.status}</span><Clock size={16} className="text-slate-700"/></div>
                      <h4 className="text-white font-black text-2xl italic mb-2 tracking-tight">{exam.subject}</h4>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">{exam.time}</p>
                      <button onClick={() => setSelectedExam(exam)} className="w-full bg-slate-800 border border-slate-700 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all">Subject Intel</button>
                    </div>
                  ))}
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).length === 0 && <div className="text-center opacity-10 py-24 flex flex-col items-center"><Coffee size={50} className="mb-4"/><p className="text-[10px] font-black uppercase tracking-[0.4em]">Self-Study Window</p></div>}
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

export default App;};

const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
  const [localNote, setLocalNote] = useState(note);
  const [viewMode, setViewMode] = useState('edit');
  useEffect(() => { setLocalNote(note); }, [note.id]);
  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex gap-2">
          <button onClick={() => setViewMode('edit')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Edit</button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Preview</button>
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
            <input value={localNote.title || ''} onChange={(e) => setLocalNote({...localNote, title: e.target.value})} placeholder="Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none" />
            <textarea value={localNote.content || ''} onChange={(e) => setLocalNote({...localNote, content: e.target.value})} className="w-full h-[500px] bg-transparent text-slate-300 text-sm outline-none resize-none" />
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`p-8 ${exam.color} flex justify-between items-start`}>
          <div>
            <h3 className="text-3xl font-black text-white italic">{exam.subject}</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-2 inline-block">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase">Readiness: {confidence[exam.id] || 0}%</h4>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 accent-blue-500 cursor-pointer" />
            </div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase">Breakdown</h4>
              {exam.breakdown?.map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${exam.color}`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase">Study Assets</h4>
            {subRes.map(res => <a key={res.id} href={res.url} target="_blank" className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all shadow-sm"><span className="text-xs font-bold text-white">{res.title}</span><ExternalLink size={12} className="text-slate-500" /></a>)}
            {subNotes.map(note => <div key={note.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px]"><h5 className="text-white font-black mb-2">{note.title}</h5><p className="text-xs text-slate-500 italic line-clamp-3">{note.content}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(21);
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
  }, []);

  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const stats = useMemo(() => {
    const academicExams = EXAM_DATA.filter(e => e.id !== 'general');
    const avgReady = Math.round(academicExams.reduce((sum, e) => sum + (parseInt(confidence[e.id]) || 0), 0) / academicExams.length) || 0;
    return { critical: EXAM_DATA.filter(d => d.status === 'CRITICAL FOCUS').length, avgReady, noteCount: notes.length, taskDone: tasks.filter(t => t.completed).length };
  }, [notes, tasks, confidence]);

  const createNote = (subId) => {
    const newNote = { id: Date.now(), subjectId: subId || 'general', title: 'New Study Brief', content: '' };
    const updated = [newNote, ...notes];
    setNotes(updated);
    sync('notes', updated);
    setActiveNoteId(newNote.id);
    setActiveTab('notes');
  };

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 pb-24 lg:pb-0">
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r flex justify-around items-center p-4">
        {[{ id: 'overview', icon: <LayoutDashboard /> }, { id: 'tasks', icon: <BookOpen /> }, { id: 'notes', icon: <StickyNote /> }, { id: 'calendar', icon: <CalendarIcon /> }].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>{item.icon}</button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div><h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">COMMAND <span className="text-blue-500">PRO</span></h1><p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Readiness System 2026</p></div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6">
            <div className="flex flex-col items-center min-w-[70px]"><span className="text-[8px] font-black text-slate-500 uppercase">Work session</span><span className="text-2xl font-black text-white tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span></div>
            <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl ${isActive ? 'bg-slate-800' : 'bg-blue-600 text-white'}`}>{isActive ? <X size={16}/> : <Zap size={16}/>}</button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-12 pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[ { l: 'Critical Priority', v: stats.critical, c: 'text-red-500', i: <Flame /> }, { l: 'Avg Readiness', v: stats.avgReady + '%', c: 'text-blue-500', i: <Gauge /> }, { l: 'Study Briefs', v: stats.noteCount, c: 'text-purple-500', i: <StickyNote /> }, { l: 'Goals Met', v: stats.taskDone, c: 'text-green-500', i: <CheckCircle2 /> }].map((s, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px]"><div className={`flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest ${s.c}`}>{s.i} {s.l}</div><div className="text-5xl font-black text-white">{s.v}</div></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase italic">Academic Roadmap</h2>
                {EXAM_DATA.filter(e => e.id !== 'general').map(exam => (
                  <button key={exam.id} onClick={() => setSelectedExam(exam)} className="w-full text-left bg-[#0f172a] border border-slate-800 p-6 rounded-[36px] hover:border-blue-500 transition-all flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}><span className="text-[8px] font-black">MAY</span><span className="text-2xl font-black">{exam.date.split('-')[2]}</span></div>
                    <div className="flex-1 min-w-0"><h4 className="text-white font-black italic text-xl truncate">{exam.subject}</h4><div className="flex items-center gap-2 mt-2"><div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${confidence[exam.id]||0}%`}}></div></div><span className="text-[9px] font-black text-slate-500">{confidence[exam.id] || 0}% READY</span></div></div>
                  </button>
                ))}
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-7 relative overflow-hidden shadow-2xl">
                 <div className="w-24 h-24 bg-red-500/10 rounded-[40%] flex items-center justify-center border border-red-500/20"><Target className="w-12 h-12 text-red-500" /></div>
                 <div><h3 className="text-3xl font-black text-white italic">Cloud Sync Active</h3><p className="text-slate-500 text-xs mt-4">Database working across all devices.</p></div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-8 animate-in slide-in-from-right pb-20">
            <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] space-y-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-2">Subject Selection</label><select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 font-black outline-none">{EXAM_DATA.filter(e => e.id !== 'general').map(e => <option key={e.id} value={e.id}>{e.subject}</option>)}</select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-2">Add Objective</label><div className="flex gap-2"><input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Actionable goal..." className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 font-bold outline-none" /><button onClick={() => { if(newTaskText) { const up = [{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]; setTasks(up); sync('tasks', up); setNewTaskText(''); } }} className="bg-blue-600 p-4 rounded-2xl"><Plus/></button></div></div>
              </div>
              <div className="pt-8 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-blue-500 uppercase px-2">Material Linker</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder="Asset Title..." className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs" />
                  <input value={newResUrl} onChange={(e) => setNewResUrl(e.target.value)} placeholder="URL..." className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs" />
                  <button onClick={() => { if(newResTitle && newResUrl) { const up = [{id: Date.now(), subjectId: selectedSubjectId, title: newResTitle, url: newResUrl}, ...resources]; setResources(up); sync('resources', up); setNewResTitle(''); setNewResUrl(''); } }} className="bg-green-600 font-black p-4 rounded-2xl text-xs">LINK ASSET</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {EXAM_DATA.filter(e => e.id !== 'general').map(subj => {
                  const sTasks = tasks.filter(t => t.subjectId === subj.id);
                  if (sTasks.length === 0) return null;
                  return (
                    <div key={subj.id} className="p-6 bg-slate-900/40 border border-slate-800 rounded-[32px] space-y-4">
                      <h4 className="font-black text-white italic text-xs uppercase">{subj.subject}</h4>
                      {sTasks.map(t => (
                        <div key={t.id} className="flex items-center gap-3 bg-slate-800/30 p-4 rounded-2xl group transition-all">
                          <button onClick={() => { const up = tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x); setTasks(up); sync('tasks', up); }} className={`w-6 h-6 rounded-lg border-2 ${t.completed ? 'bg-green-500 border-green-500' : 'border-slate-700'}`}>{t.completed && <CheckCircle2 size={14}/>}</button>
                          <span className={`text-xs font-bold flex-1 ${t.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{t.text}</span>
                          <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="opacity-0 group-hover:opacity-100"><Trash2 size={14} className="text-red-500" /></button>
                        </div>
                      ))}
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
              <NoteEditor note={notes.find(n => n.id === activeNoteId)} onSave={(upd) => { const up = notes.map(n => n.id === upd.id ? upd : n); setNotes(up); sync('notes', up); setActiveNoteId(null); }} onCancel={() => setActiveNoteId(null)} onDelete={(id) => { const up = notes.filter(n => n.id !== id); setNotes(up); sync('notes', up); setActiveNoteId(null); }} />
            ) : (
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-[320px] bg-[#0f172a] border border-slate-800 rounded-[40px] p-7 h-fit shadow-2xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase mb-8">Subject List</h3>
                  <div className="space-y-2">
                    {EXAM_DATA.map(subj => <button key={subj.id} onClick={() => createNote(subj.id)} className="w-full text-left p-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-between group"><div className="flex items-center gap-3 truncate"><div className={`w-2 h-2 rounded-full ${subj.color}`} /><span className="text-xs font-black text-slate-400 group-hover:text-white truncate">{subj.subject}</span></div><Plus size={12} className="text-slate-700"/></button>)}
                  </div>
                </div>
                <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar pb-32">
                  <div className="flex justify-between items-center bg-[#0a0f18]/80 backdrop-blur sticky top-0 py-3 border-b border-slate-800/50">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">BRIEFING <span className="text-blue-500">LAB</span></h2>
                    <button onClick={() => createNote('general')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl">+ NEW ENTRY</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {notes.map(note => (
                      <button key={note.id} onClick={() => setActiveNoteId(note.id)} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500 transition-all text-left shadow-xl h-fit">
                         <div className="flex items-center gap-3 mb-4"><div className={`w-2 h-8 rounded-full ${EXAM_DATA.find(e => e.id === note.subjectId)?.color}`} /><span className="text-[10px] font-black text-slate-500 uppercase">{EXAM_DATA.find(e => e.id === note.subjectId)?.subject}</span></div>
                         <h4 className="text-white font-black text-2xl mb-3 italic">{note.title}</h4>
                         <div className="text-sm text-slate-500 line-clamp-4 leading-relaxed font-medium italic">{note.content || 'Notes pending...'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="animate-in zoom-in-95 space-y-12 pb-20">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-[50px] p-10 shadow-2xl">
                <h2 className="text-3xl font-black text-white italic uppercase mb-12 px-2">PLANNER 2026</h2>
                <div className="grid grid-cols-7 gap-5">
                  {Array.from({length: 14}, (_, i) => 18 + i).map(day => {
                    const exams = EXAM_DATA.filter(e => e.date?.includes(`-05-${day}`));
                    const isSelected = selectedDate === day;
                    return (
                      <button key={`day-${day}`} onClick={() => setSelectedDate(day)} className={`relative aspect-square rounded-[35%] flex flex-col items-center justify-center transition-all border-2 ${isSelected ? 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-600/40' : 'bg-[#0a0f18] border-transparent hover:border-slate-800'}`}>
                        <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                        {exams.length > 0 && <div className="absolute bottom-4 flex gap-1.5">{exams.map(e => <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.color}`}></div>)}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full lg:w-[400px] bg-[#0f172a] border border-slate-800 rounded-[50px] p-10 h-fit shadow-2xl space-y-10">
                <div className="flex items-center gap-6"><div className="w-20 h-20 bg-blue-600 rounded-[35%] flex flex-col items-center justify-center shadow-xl"><span className="text-[10px] font-black text-white/50 uppercase">MAY</span><span className="text-4xl font-black text-white leading-none">{selectedDate}</span></div><h3 className="text-2xl font-black text-white tracking-tighter italic">AGENDA</h3></div>
                <div className="space-y-6">
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).map(exam => (
                    <div key={exam.id} className="p-6 bg-[#0a0f18] border border-slate-800 rounded-[32px] space-y-4">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${exam.color} text-white shadow-xl`}>{exam.status}</span>
                      <h4 className="text-white font-black text-xl italic">{exam.subject}</h4>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> {exam.time}</p>
                      <button onClick={() => setSelectedExam(exam)} className="w-full bg-slate-800 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all">Details</button>
                    </div>
                  ))}
                  {EXAM_DATA.filter(e => e.date?.includes(`-05-${selectedDate}`)).length === 0 && <div className="text-center opacity-20 py-20"><Coffee size={40} className="mx-auto mb-4"/><p className="text-[10px] font-black uppercase tracking-widest">Self-Study Window</p></div>}
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
export default App;    breakdown: [{ name: 'Assignment', max: 40, score: 20 }, { name: 'Quiz', max: 10, score: 7 }]
  },
  {
    id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM - 01:00 PM',
    internal: 34, needed: 6, status: 'STUDY HARD', color: 'bg-yellow-500', type: 'Regular',
    breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }]
  },
  {
    id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM - 01:00 PM',
    internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-blue-500', type: 'Regular',
    breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Quizzes', max: 20, score: 15 }]
  },
  {
    id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM - 05:00 PM',
    needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', type: 'Backlog',
    breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }]
  },
  {
    id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM - 05:00 PM',
    needed: 20, status: 'CRITICAL FOCUS', color: 'bg-red-500', type: 'Backlog',
    breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }]
  }
];

const formatMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h4 key={i} className="text-white font-bold text-lg mt-4 mb-2">{line.replace('### ', '')}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="text-blue-400 font-bold text-xl mt-5 mb-2">{line.replace('## ', '')}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="text-blue-500 font-black text-2xl mt-6 mb-3 border-b border-slate-800 pb-2">{line.replace('# ', '')}</h2>;
    if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
    return <p key={i} className="text-slate-400 text-sm mb-2 leading-relaxed">{line}</p>;
  });
};

const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
  const [localNote, setLocalNote] = useState(note);
  const [viewMode, setViewMode] = useState('edit');
  useEffect(() => { setLocalNote(note); }, [note.id]);
  const handleFieldChange = (field, val) => setLocalNote(prev => ({ ...prev, [field]: val }));

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden animate-in slide-in-from-right duration-300 shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
        <div className="flex gap-2">
          <button onClick={() => setViewMode('edit')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}><Edit3 className="w-3 h-3" /> Edit</button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}><Eye className="w-3 h-3" /> Preview</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(localNote)} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-xl"><Save className="w-4 h-4" /></button>
          <button onClick={() => onDelete(localNote.id)} className="bg-red-600/10 hover:bg-red-600 text-red-500 p-2 rounded-xl"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onCancel} className="text-slate-500 hover:text-white p-2"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'edit' ? (
          <div className="space-y-6">
            <input value={localNote.title || ''} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="Note Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none placeholder:text-slate-800" />
            <input value={localNote.subtitle || ''} onChange={(e) => handleFieldChange('subtitle', e.target.value)} placeholder="Subtitle..." className="w-full bg-transparent text-sm font-bold text-blue-500 uppercase outline-none" />
            <textarea value={localNote.content || ''} onChange={(e) => handleFieldChange('content', e.target.value)} placeholder="Start writing..." className="w-full h-[500px] bg-transparent text-slate-300 text-sm leading-relaxed outline-none resize-none" />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-4xl font-black text-white mb-2">{localNote.title || 'Untitled'}</h1>
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
  const currentConfidence = confidence[exam.id] || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className={`p-8 ${exam.color} flex justify-between items-start shrink-0 relative overflow-hidden`}>
           <div className="relative z-10">
              <h3 className="text-3xl font-black text-white leading-tight">{exam.subject}</h3>
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-2">{exam.status}</span>
           </div>
           <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X className="w-5 h-5 text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10 bg-gradient-to-b from-[#0f172a] to-[#0a0f18]">
          <div className="space-y-8">
             <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Gauge className="w-4 h-4 text-blue-500" /> Readiness Meter</h4>
                   <span className="text-xl font-black text-blue-500">{currentConfidence}%</span>
                </div>
                <input type="range" min="0" max="100" value={currentConfidence} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
             </div>
             <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
               <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Internal Breakdown</h4>
               <div className="space-y-3">
                 {exam.breakdown?.map((b, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${exam.color}`} style={{ width: `${(b.score/b.max)*100}%` }}></div></div>
                    </div>
                 ))}
               </div>
             </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><StickyNote className="w-4 h-4" /> Knowledge Base ({subNotes.length})</h4>
            <div className="space-y-4">
              {subNotes.map(note => (
                <div key={note.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] group hover:border-blue-500/30 transition-all">
                   <h5 className="text-white font-black text-lg mb-1">{note.title}</h5>
                   <div className="text-xs text-slate-500 line-clamp-4 leading-relaxed italic">{note.content || 'Empty...'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Cloud State
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [confidence, setConfidence] = useState({});

  // Fetch from Cloud + Realtime
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

    const channel = supabase.channel('cloud-sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'command_pro_data' }, (payload) => {
      const { id, content } = payload.new;
      if (id === 'tasks') setTasks(content);
      if (id === 'notes') setNotes(content);
      if (id === 'confidence') setConfidence(content);
      if (id === 'resources') setResources(content);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sync = async (id, content) => {
    await supabase.from('command_pro_data').upsert({ id, content });
  };

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0) setIsActive(false);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const stats = useMemo(() => {
    const critical = EXAM_DATA.filter(d => d.status === 'CRITICAL FOCUS').length;
    const avgReady = Math.round(EXAM_DATA.filter(e => e.id !== 'general').reduce((sum, e) => sum + (parseInt(confidence[e.id]) || 0), 0) / (EXAM_DATA.length-1));
    return { critical, avgReady, noteCount: notes.length, taskDone: tasks.filter(t => t.completed).length };
  }, [notes, tasks, confidence]);

  const createNote = (subId) => {
    const newNote = { id: Date.now(), subjectId: subId || 'general', title: 'New Note', content: '' };
    const updated = [newNote, ...notes];
    setNotes(updated);
    sync('notes', updated);
    setActiveNoteId(newNote.id);
    setActiveTab('notes');
  };

  const handleConf = (id, val) => {
    const updated = { ...confidence, [id]: val };
    setConfidence(updated);
    sync('confidence', updated);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans pb-24 lg:pb-0 selection:bg-blue-500/30">
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r flex justify-around items-center p-4">
        {[{ id: 'overview', icon: <LayoutDashboard /> }, { id: 'tasks', icon: <BookOpen /> }, { id: 'notes', icon: <StickyNote /> }, { id: 'calendar', icon: <CalendarIcon /> }].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800'}`}>{item.icon}</button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
             <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">COMMAND <span className="text-blue-500">PRO</span></h1>
             <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Readiness System 2026</p>
          </div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6 shadow-2xl">
             <div className="flex flex-col items-center min-w-[70px]">
                <span className="text-[8px] font-black text-slate-500 uppercase">{timerMode} session</span>
                <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
             </div>
             <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-slate-800 text-slate-300' : 'bg-blue-600 text-white shadow-lg'}`}>{isActive ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 rotate-45" />}</button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-700 space-y-12 pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[ { l: 'Critical Priority', v: stats.critical, c: 'text-red-500', i: <Flame /> }, { l: 'Avg Readiness', v: stats.avgReady + '%', c: 'text-blue-500', i: <Gauge /> }, { l: 'Study Briefs', v: stats.noteCount, c: 'text-purple-500', i: <StickyNote /> }, { l: 'Goals Met', v: stats.taskDone, c: 'text-green-500', i: <CheckCircle2 /> }].map((s, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px] hover:border-slate-600 transition-all shadow-xl">
                  <div className={`flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest ${s.c}`}>{s.i} {s.l}</div>
                  <div className="text-5xl font-black text-white">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2"><h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Academic Roadmap</h2></div>
                <div className="space-y-4">
                  {EXAM_DATA.filter(e => e.id !== 'general').map(exam => (
                    <button key={exam.id} onClick={() => setSelectedExam(exam)} className={`w-full text-left bg-[#0f172a] border p-6 rounded-[36px] transition-all group flex items-center gap-6 ${exam.status === 'CRITICAL FOCUS' ? 'border-red-500/30' : 'border-slate-800'} hover:border-blue-500 shadow-xl`}>
                       <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}>
                          <span className="text-[8px] font-black uppercase">MAY</span>
                          <span className="text-2xl font-black leading-none mt-1">{exam.date.split('-')[2]}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-white font-black group-hover:text-blue-400 transition-colors truncate text-xl leading-tight italic">{exam.subject}</h4>
                          <div className="flex items-center gap-3 mt-2">
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${exam.color} text-white`}>{exam.status}</span>
                             <div className="h-1 flex-1 max-w-[80px] bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${confidence[exam.id] || 0}%` }}></div></div>
                          </div>
                       </div>
                    </button>
                  ))}
                </div>
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 flex flex-col items-center justify-center text-center space-y-7 relative shadow-2xl">
                 <div className="w-24 h-24 bg-red-500/10 rounded-[40%] flex items-center justify-center border border-red-500/20"><Target className="w-12 h-12 text-red-500" /></div>
                 <div><h3 className="text-3xl font-black text-white italic">Focus Mode</h3><p className="text-slate-500 text-sm max-w-xs mt-4">Current Cloud Sync: Active. Your data is mirrored across all devices.</p></div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
           <div className="animate-in slide-in-from-right duration-500 space-y-12 pb-20">
              <div className="bg-[#0f172a] border border-slate-800 p-10 rounded-[50px] shadow-2xl space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Subject Selection</label>
                       <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 font-black outline-none appearance-none cursor-pointer">
                          {EXAM_DATA.filter(e => e.id !== 'general').map(e => <option key={e.id} value={e.id}>{e.subject}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Add Study Objective</label>
                       <div className="flex gap-3">
                          <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Actionable goal..." className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 font-bold outline-none" />
                          <button onClick={() => { if(newTaskText) { const up = [{id: Date.now(), subjectId: selectedSubjectId, text: newTaskText, completed: false}, ...tasks]; setTasks(up); sync('tasks', up); setNewTaskText(''); } }} className="bg-blue-600 text-white p-6 rounded-3xl"><Plus /></button>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {EXAM_DATA.filter(e => e.id !== 'general').map(subj => {
                      const sTasks = tasks.filter(t => t.subjectId === subj.id);
                      if (sTasks.length === 0) return null;
                      return (
                        <div key={subj.id} className={`space-y-6 p-7 rounded-[40px] border bg-slate-900/40 border-slate-800`}>
                           <div className="flex items-center gap-3"><div className={`w-2 h-7 rounded-full ${subj.color}`} /><h3 className="font-black text-white uppercase text-[11px] italic">{subj.subject}</h3></div>
                           <div className="space-y-3">
                              {sTasks.map(t => (
                                <div key={t.id} className="flex items-center gap-4 bg-slate-800/20 p-5 rounded-3xl border border-slate-800 group transition-all">
                                  <button onClick={() => { const up = tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x); setTasks(up); sync('tasks', up); }} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center ${t.completed ? 'bg-green-500 border-green-500' : 'border-slate-700'}`}>{t.completed && <CheckCircle2 className="w-5 h-5 text-white"/>}</button>
                                  <span className={`text-sm font-bold flex-1 ${t.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{t.text}</span>
                                  <button onClick={() => { const up = tasks.filter(x => x.id !== t.id); setTasks(up); sync('tasks', up); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
              <NoteEditor note={notes.find(n => n.id === activeNoteId)} onSave={(upd) => { const up = notes.map(n => n.id === upd.id ? upd : n); setNotes(up); sync('notes', up); setActiveNoteId(null); }} onCancel={() => setActiveNoteId(null)} onDelete={(id) => { const up = notes.filter(n => n.id !== id); setNotes(up); sync('notes', up); setActiveNoteId(null); }} />
            ) : (
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-[320px] space-y-6 shrink-0">
                  <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] p-7 shadow-2xl">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 px-2">Knowledge Base</h3>
                    <div className="space-y-1.5">
                       {EXAM_DATA.map(subj => (
                         <button key={subj.id} onClick={() => createNote(subj.id)} className="w-full text-left p-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-3 truncate min-w-0">
                               <div className={`w-2 h-2 rounded-full ${subj.color}`} />
                               <span className="text-xs font-black text-slate-400 truncate">{subj.subject}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                    {notes.map(note => (
                      <button key={note.id} onClick={() => setActiveNoteId(note.id)} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500/50 transition-all text-left group h-fit shadow-xl">
                         <div className="flex items-center gap-3 mb-5">
                            <div className={`w-2 h-8 rounded-full ${EXAM_DATA.find(e => e.id === note.subjectId)?.color}`} />
                            <span className="text-[10px] font-black text-slate-500">{EXAM_DATA.find(e => e.id === note.subjectId)?.subject}</span>
                         </div>
                         <h4 className="text-white font-black text-2xl group-hover:text-blue-400 italic mb-3">{note.title}</h4>
                         <p className="text-sm text-slate-500 line-clamp-5 leading-relaxed italic">{note.content || 'Initiating...'}</p>
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
                    <h2 className="text-3xl font-black text-white italic mb-12">PLANNER 2026</h2>
                    <div className="grid grid-cols-7 gap-5">
                       {Array.from({length: 14}, (_, i) => 18 + i).map(day => {
                          const exams = EXAM_DATA.filter(e => e.date?.includes(`-05-${day}`));
                          const isSelected = selectedDate === day;
                          return (
                            <button key={`day-${day}`} onClick={() => setSelectedDate(day)} className={`relative aspect-square rounded-[35%] flex flex-col items-center justify-center transition-all border-2 ${isSelected ? 'bg-blue-600 border-blue-400 shadow-2xl' : 'bg-[#0a0f18] border-transparent hover:border-slate-800'}`}>
                               <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                               {exams.length > 0 && <div className="absolute bottom-4 flex gap-1.5">{exams.map(e => <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.color}`}></div>)}</div>}
                            </button>
                          );
                       })}
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
