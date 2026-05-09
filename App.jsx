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
  { id: 'earth', subject: 'Earth and Environment', date: '2026-05-19', time: '10:00 AM - 01:00 PM', internal: 39.5, needed: 0.5, status: 'PASS SECURED', color: 'bg-emerald-500', breakdown: [{ name: 'Assignments', max: 20, score: 13.5 }, { name: 'Midterm', max: 20, score: 16 }, { name: 'UNCC Certification', max: 10, score: 10 }] },
  { id: 'pom', subject: 'Principles of Management', date: '2026-05-20', time: '10:00 AM - 01:00 PM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-cyan-500', breakdown: [{ name: 'Participation', max: 20, score: 15 }, { name: 'Group Project', max: 50, score: 30 }] },
  { id: 'macro', subject: 'Macroeconomics', date: '2026-05-21', time: '10:00 AM - 01:00 PM', internal: 19, needed: 21, status: 'CRITICAL FOCUS', color: 'bg-rose-500', breakdown: [{ name: 'Midterm', max: 30, score: 14 }, { name: 'Group Assignments', max: 20, score: 5 }] },
  { id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM - 01:00 PM', internal: 32, needed: 8, status: 'STUDY HARD', color: 'bg-amber-500', breakdown: [{ name: 'Group Assignment', max: 40, score: 20 }, { name: 'Participation', max: 10, score: 5 }, { name: 'Quiz', max: 10, score: 7 }] },
  { id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM - 01:00 PM', internal: 34, needed: 6, status: 'STUDY HARD', color: 'bg-orange-500', breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }, { name: 'Participation', max: 10, score: 5 }] },
  { id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM - 01:00 PM', internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-indigo-500', breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Viva', max: 10, score: 0 }, { name: 'Quizzes', max: 20, score: 15 }, { name: 'Participation', max: 10, score: 5 }] },
  { id: 'stats', subject: 'Intro to Statistics (Supply)', date: '2026-05-25', time: '03:00 PM - 05:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-rose-600', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] },
  { id: 'micro', subject: 'Microeconomics (Supply)', date: '2026-05-27', time: '03:00 PM - 05:00 PM', needed: 20, status: 'CRITICAL FOCUS', color: 'bg-rose-600', breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }] }
];

const formatMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h4 key={i} className="text-white font-bold text-lg mt-4 mb-2">{line.replace('### ', '')}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="text-indigo-400 font-bold text-xl mt-5 mb-2">{line.replace('## ', '')}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="text-indigo-500 font-black text-2xl mt-6 mb-3 border-b border-indigo-900/50 pb-2">{line.replace('# ', '')}</h2>;
    if (line.startsWith('- ')) return <li key={i} className="text-indigo-200/80 ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
    return <p key={i} className="text-indigo-100/60 text-sm mb-2 leading-relaxed">{line}</p>;
  });
};

const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
  const [localNote, setLocalNote] = useState(note);
  const [viewMode, setViewMode] = useState('edit');
  useEffect(() => { setLocalNote(note); }, [note.id]);
  return (
    <div className="fixed inset-0 lg:relative z-[100] flex flex-col h-full bg-[#020617] lg:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="p-4 border-b border-indigo-900/30 flex justify-between items-center bg-[#0f172a]/50 backdrop-blur-md">
        <div className="flex bg-[#1e293b] rounded-xl p-1">
          <button onClick={() => setViewMode('edit')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'edit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-300/50'}`}>Edit</button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-300/50'}`}>Preview</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(localNote)} className="bg-emerald-600 text-white p-2.5 rounded-xl active:scale-90"><Save size={18} /></button>
          <button onClick={() => onDelete(localNote.id)} className="bg-rose-600/20 text-rose-500 p-2.5 rounded-xl active:scale-90"><Trash2 size={18} /></button>
          <button onClick={onCancel} className="text-indigo-300 p-2.5"><X size={24} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
        {viewMode === 'edit' ? (
          <div className="space-y-6">
            <input value={localNote.title || ''} onChange={(e) => setLocalNote({...localNote, title: e.target.value})} placeholder="Project Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none placeholder:text-indigo-900/30 italic" />
            <textarea value={localNote.content || ''} onChange={(e) => setLocalNote({...localNote, content: e.target.value})} className="w-full h-[60vh] bg-transparent text-indigo-100/80 text-base lg:text-sm outline-none resize-none" placeholder="Type here..." />
          </div>
        ) : (
          <div className="animate-in fade-in max-w-3xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter">{localNote.title || 'Untitled'}</h1>
            <div className="h-1 w-20 bg-indigo-600 mb-8 rounded-full" />
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
    <div className="fixed inset-0 z-[110] flex items-end lg:items-center justify-center p-0 lg:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f172a] border-t lg:border border-indigo-900/30 w-full max-w-4xl rounded-t-[32px] lg:rounded-[40px] overflow-hidden max-h-[92vh] flex flex-col shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)]">
        <div className={`p-6 lg:p-10 ${exam.color} flex justify-between items-start shrink-0 relative overflow-hidden`}>
          <div className="relative z-10">
            <h3 className="text-2xl lg:text-4xl font-black text-white italic uppercase tracking-tighter">{exam.subject}</h3>
            <span className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-3 inline-block border border-white/10">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-black/20 p-2.5 rounded-full hover:bg-black/40 transition-all border border-white/10 relative z-10"><X size={24} color="white" /></button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-[#020617] custom-scrollbar">
          <div className="space-y-8">
            <div className="bg-[#0f172a] p-6 lg:p-8 rounded-[28px] border border-indigo-900/20 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Gauge size={16} /> Readiness</h4>
                 <span className="text-2xl font-black text-white">{confidence[exam.id] || 0}%</span>
              </div>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2.5 accent-indigo-500 cursor-pointer bg-[#1e293b] rounded-lg appearance-none" />
            </div>
            <div className="bg-[#0f172a] p-6 lg:p-8 rounded-[28px] border border-indigo-900/20 space-y-6 shadow-2xl">
              <div className="flex justify-between items-end border-b border-indigo-900/20 pb-4">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 font-black italic">Intelligence</h4>
                <div className="text-right"><span className="text-[8px] font-black text-indigo-500 uppercase block mb-1">Internal sum</span><span className="text-3xl font-black text-white italic leading-none">{exam.internal || 0}</span></div>
              </div>
              <div className="space-y-5">
                {exam.breakdown?.map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-indigo-200/50 uppercase tracking-tighter"><span>{b.name}</span><span>{b.score} / {b.max}</span></div>
                    <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div className={`h-full ${exam.color} transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                  </div>
                ))}
                <div className="pt-6 border-t border-indigo-900/20 flex justify-between items-center">
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Goal Threshold</span>
                   <span className={`text-2xl font-black italic ${exam.needed === 0 ? 'text-emerald-400' : 'text-rose-500'}`}>{exam.needed} <span className="text-[10px] uppercase ml-1">Marks</span></span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 flex items-center gap-2 italic"><LinkIcon size={14} /> Material assets</h4>
            <div className="space-y-3">
              {subRes.map(res => <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-[#0f172a] border border-indigo-900/20 rounded-2xl hover:border-indigo-500 transition-all shadow-xl group active:scale-95"><span className="text-sm font-bold text-white italic group-hover:text-indigo-400 truncate max-w-[200px]">{res.title}</span><ExternalLink size={16} className="text-indigo-500 group-hover:text-white" /></a>)}
            </div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pt-4 px-2 flex items-center gap-2 italic"><StickyNote size={14} /> Subject Briefs</h4>
            <div className="space-y-4 pb-10">
              {subNotes.map(note => <div key={note.id} className="p-6 bg-[#0f172a] border border-indigo-900/20 rounded-[28px] shadow-lg"><h5 className="text-white font-black mb-2 italic text-lg">{note.title}</h5><p className="text-sm text-indigo-100/40 italic line-clamp-3 leading-relaxed">{note.content}</p></div>)}
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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
      <form onSubmit={(e) => { e.preventDefault(); if(pass === 'Foxtrot@116') setIsAuthenticated(true); }} className="bg-[#0f172a] border border-indigo-900/30 p-8 lg:p-12 rounded-[40px] w-full max-w-md shadow-[0_0_100px_-10px_rgba(99,102,241,0.2)] space-y-10 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="w-20 h-20 bg-indigo-600/10 rounded-[30%] flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]"><Lock className="text-indigo-500 w-10 h-10" /></div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Command <span className="text-indigo-500">Pro</span></h1>
            <p className="text-indigo-400/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Security Protocol Active</p>
          </div>
        </div>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Access Key..." className="w-full bg-[#020617] border border-indigo-900/50 rounded-2xl p-6 text-white font-black text-center outline
