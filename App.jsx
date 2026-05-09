import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, StickyNote, CheckCircle2, 
  Clock, AlertCircle, Plus, Trash2, Target, X, ChevronRight, Info, 
  BarChart3, Timer, ExternalLink, Link as LinkIcon, Presentation, Save, 
  Flame, Zap, Coffee, FileText, Edit3, Eye, Gauge, Trophy, Lock, ShieldCheck
} from 'lucide-react';

// --- CONNECTION ---
const supabaseUrl = 'https://mudpqfifjoinkaxclifr.supabase.co';
const supabaseKey = 'sb_publishable_hnBkr1rLjy0gCzyUoXruDg_Qxs5vlIu';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROADMAP DATA ---
const EXAM_DATA = [
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
    breakdown: [{ name: 'Midterm', max: 30, score: 14 }, { name: 'Group Assignments', max: 20, score: 5 }] 
  },
  { 
    id: 'research', subject: 'Research Techniques', date: '2026-05-22', time: '10:00 AM - 01:00 PM', 
    internal: 32, needed: 8, status: 'STUDY HARD', color: 'bg-orange-500',
    breakdown: [{ name: 'Group Assignment', max: 40, score: 20 }, { name: 'Participation', max: 10, score: 5 }, { name: 'Quiz', max: 10, score: 7 }] 
  },
  { 
    id: 'finance', subject: 'Corporate Finance', date: '2026-05-23', time: '10:00 AM - 01:00 PM', 
    internal: 34, needed: 6, status: 'STUDY HARD', color: 'bg-yellow-500',
    breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }, { name: 'Participation', max: 10, score: 5 }] 
  },
  { 
    id: 'tools', subject: 'Computational Tools', date: '2026-05-25', time: '10:00 AM - 01:00 PM', 
    internal: 45, needed: 0, status: 'PRE-EXAM PASS', color: 'bg-blue-500',
    breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Viva', max: 10, score: 0 }, { name: 'Quizzes', max: 20, score: 15 }, { name: 'Participation', max: 10, score: 5 }] 
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

// --- SUB-COMPONENTS ---
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
          <button onClick={() => setViewMode('edit')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Edit</button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Preview</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(localNote)} className="bg-green-600 text-white p-2 rounded-xl"><Save size={16} /></button>
          <button onClick={() => onDelete(localNote.id)} className="bg-red-600/10 text-red-500 p-2 rounded-xl hover:bg-red-600"><Trash2 size={16} /></button>
          <button onClick={onCancel} className="text-slate-500 p-2"><X size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'edit' ? (
          <div className="space-y-6">
            <input value={localNote.title || ''} onChange={(e) => setLocalNote({...localNote, title: e.target.value})} placeholder="Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none italic" />
            <textarea value={localNote.content || ''} onChange={(e) => setLocalNote({...localNote, content: e.target.value})} className="w-full h-[500px] bg-transparent text-slate-300 text-sm outline-none resize-none" placeholder="Start writing..." />
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        <div className={`p-8 ${exam.color} flex justify-between items-start shrink-0`}>
          <div>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{exam.subject}</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mt-4 inline-block tracking-widest">{exam.status}</span>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10 custom-scrollbar bg-[#0a0f18]/30">
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-7 rounded-[32px] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-black italic"><Gauge size={14} className="text-blue-500" /> Readiness</h4>
                 <span className="text-xl font-black text-blue-500 italic">{confidence[exam.id] || 0}%</span>
              </div>
              <input type="range" min="0" max="100" value={confidence[exam.id] || 0} onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)} className="w-full h-2 accent-blue-500 cursor-pointer bg-slate-800 rounded-lg appearance-none" />
            </div>
            <div className="bg-slate-900/50 p-7 rounded-[32px] border border-slate-800 space-y-6 shadow-xl">
              <div className="flex justify-between items-end">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic font-black">Intelligence</h4>
                <div className="text-right"><span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Internal sum</span><span className="text-2xl font-black text-white italic leading-none">{exam.internal || 0} Marks</span></div>
              </div>
              <div className="space-y-4">
                {exam.breakdown?.map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${exam.color} transition-all duration-1000`} style={{width: `${(b.score/b.max)*100}%`}}></div></div>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-black italic">Goal threshold</span>
                   <span className={`text-2xl font-black italic ${exam.needed === 0 ? 'text-green-500' : 'text-red-500'}`}>{exam.needed} MARKS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y
