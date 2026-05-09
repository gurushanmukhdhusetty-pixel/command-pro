import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  StickyNote, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trophy, 
  Plus, 
  Trash2, 
  Target, 
  X, 
  ChevronRight, 
  Info, 
  BarChart3, 
  Timer, 
  CalendarDays, 
  ExternalLink, 
  Link as LinkIcon, 
  Presentation, 
  Save, 
  BrainCircuit, 
  Flame, 
  Zap, 
  Coffee, 
  FileText, 
  Edit3, 
  Eye, 
  Gauge,
  AlertTriangle
} from 'lucide-react';

// --- CONFIGURATION & DATA ---

const EXAM_DATA = [
  { id: 'general', subject: 'General Strategy', color: 'bg-slate-500', type: 'Meta' },
  {
    id: 'earth',
    subject: 'Earth and Environment',
    date: '2026-05-19',
    time: '10:00 AM - 01:00 PM',
    internal: 39.5,
    needed: 0.5,
    status: 'PASS SECURED',
    color: 'bg-green-500',
    type: 'Regular',
    breakdown: [{ name: 'Assignments', max: 20, score: 13.5 }, { name: 'Midterm', max: 20, score: 16 }, { name: 'UNCC Certification', max: 10, score: 10 }]
  },
  {
    id: 'pom',
    subject: 'Principles of Management',
    date: '2026-05-20',
    time: '10:00 AM - 01:00 PM',
    internal: 45,
    needed: 0,
    status: 'PRE-EXAM PASS',
    color: 'bg-emerald-600',
    type: 'Regular',
    breakdown: [{ name: 'Participation', max: 20, score: 15 }, { name: 'Group Project', max: 50, score: 30 }]
  },
  {
    id: 'macro',
    subject: 'Macroeconomics',
    date: '2026-05-21',
    time: '10:00 AM - 01:00 PM',
    internal: 19,
    needed: 21,
    status: 'CRITICAL FOCUS',
    color: 'bg-red-500',
    type: 'Regular',
    breakdown: [{ name: 'Midterm', max: 30, score: 14 }, { name: 'Assignments', max: 20, score: 5 }]
  },
  {
    id: 'research',
    subject: 'Research Techniques',
    date: '2026-05-22',
    time: '10:00 AM - 01:00 PM',
    internal: 32,
    needed: 8,
    status: 'STUDY HARD',
    color: 'bg-orange-500',
    type: 'Regular',
    breakdown: [{ name: 'Assignment', max: 40, score: 20 }, { name: 'Quiz', max: 10, score: 7 }]
  },
  {
    id: 'finance',
    subject: 'Corporate Finance',
    date: '2026-05-23',
    time: '10:00 AM - 01:00 PM',
    internal: 34,
    needed: 6,
    status: 'STUDY HARD',
    color: 'bg-yellow-500',
    type: 'Regular',
    breakdown: [{ name: 'Quizzes', max: 30, score: 24 }, { name: 'Midterm', max: 20, score: 5 }]
  },
  {
    id: 'tools',
    subject: 'Computational Tools',
    date: '2026-05-25',
    time: '10:00 AM - 01:00 PM',
    internal: 45,
    needed: 0,
    status: 'PRE-EXAM PASS',
    color: 'bg-blue-500',
    type: 'Regular',
    breakdown: [{ name: 'Project', max: 30, score: 25 }, { name: 'Quizzes', max: 20, score: 15 }]
  },
  {
    id: 'stats',
    subject: 'Intro to Statistics (Supply)',
    date: '2026-05-25',
    time: '03:00 PM - 05:00 PM',
    needed: 20,
    status: 'CRITICAL FOCUS',
    color: 'bg-red-500',
    type: 'Backlog',
    breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }]
  },
  {
    id: 'micro',
    subject: 'Microeconomics (Supply)',
    date: '2026-05-27',
    time: '03:00 PM - 05:00 PM',
    needed: 20,
    status: 'CRITICAL FOCUS',
    color: 'bg-red-500',
    type: 'Backlog',
    breakdown: [{ name: 'Supply Exam', max: 50, score: 0 }]
  }
];

// Formatting helper for notes
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

// --- SUB-COMPONENTS (Isolated to fix re-rendering/typing bugs) ---

const NoteEditor = ({ note, onSave, onCancel, onDelete }) => {
  const [localNote, setLocalNote] = useState(note);
  const [viewMode, setViewMode] = useState('edit');

  useEffect(() => { setLocalNote(note); }, [note.id]);

  const handleFieldChange = (field, val) => {
    setLocalNote(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden animate-in slide-in-from-right duration-300 shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
        <div className="flex gap-2">
          <button onClick={() => setViewMode('edit')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(localNote)} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-xl" title="Save Note"><Save className="w-4 h-4" /></button>
          <button onClick={() => onDelete(localNote.id)} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-xl transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onCancel} className="text-slate-500 hover:text-white p-2"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'edit' ? (
          <div className="space-y-6">
            <input value={localNote.title || ''} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="Note Title..." className="w-full bg-transparent text-3xl font-black text-white outline-none placeholder:text-slate-800" />
            <input value={localNote.subtitle || ''} onChange={(e) => handleFieldChange('subtitle', e.target.value)} placeholder="Subtitle or Topic..." className="w-full bg-transparent text-sm font-bold text-blue-500 uppercase tracking-widest outline-none placeholder:text-slate-800" />
            <div className="h-[1px] bg-slate-800 my-4" />
            <textarea value={localNote.content || ''} onChange={(e) => handleFieldChange('content', e.target.value)} placeholder="Type your structured notes here... # Header, ## Sub-header, - List" className="w-full h-[500px] bg-transparent text-slate-300 text-sm leading-relaxed outline-none resize-none placeholder:text-slate-800" />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-4xl font-black text-white mb-2">{localNote.title || 'Untitled Note'}</h1>
            <p className="text-sm font-black text-blue-500 uppercase tracking-widest mb-8">{localNote.subtitle || 'General Notes'}</p>
            <div className="h-[1px] bg-slate-800 mb-8" />
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05080f]/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className={`p-8 ${exam.color} flex justify-between items-start shrink-0 relative overflow-hidden`}>
           <div className="relative z-10">
              <h3 className="text-3xl font-black text-white leading-tight">{exam.subject}</h3>
              <div className="flex items-center gap-3 mt-3">
                 <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider">{exam.status}</span>
                 {exam.status === 'CRITICAL FOCUS' && <Flame className="w-4 h-4 text-white animate-pulse" />}
              </div>
           </div>
           <button onClick={onClose} className="relative z-10 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X className="w-5 h-5 text-white" /></button>
           <div className="absolute top-0 right-0 opacity-10 translate-x-10 -translate-y-10 scale-150 pointer-events-none">
              <Target className="w-48 h-48 text-white" />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10 custom-scrollbar bg-gradient-to-b from-[#0f172a] to-[#0a0f18]">
          <div className="space-y-8">
             <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gauge className="w-4 h-4 text-blue-500" /> Readiness Meter</h4>
                   <span className="text-xl font-black text-blue-500">{currentConfidence}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={currentConfidence} 
                  onChange={(e) => onConfidenceUpdate(exam.id, e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                />
             </div>

             <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Internal Breakdown</h4>
               <div className="space-y-3">
                 {exam.breakdown?.map((b, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>{b.name}</span><span>{b.score}/{b.max}</span></div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${exam.color} transition-all duration-1000`} style={{ width: `${(b.score/b.max)*100}%` }}></div></div>
                    </div>
                 ))}
                 <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-black">
                   <span className="text-slate-500 uppercase">End-Term Goal</span>
                   <span className={exam.needed === 0 ? 'text-green-500' : 'text-red-500'}>{exam.needed} MARKS</span>
                 </div>
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Material Links</h4>
               <div className="space-y-2">
                 {subRes.map(res => (
                   <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 group transition-all">
                      <span className="text-xs font-bold text-white truncate max-w-[220px]">{res.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-500" />
                   </a>
                 ))}
                 {subRes.length === 0 && <p className="text-slate-700 text-[10px] font-black italic px-2">No assets linked.</p>}
               </div>
             </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><StickyNote className="w-4 h-4" /> Knowledge Base ({subNotes.length})</h4>
            <div className="space-y-4">
              {subNotes.map(note => (
                <div key={note.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] group hover:border-blue-500/30 transition-all cursor-default shadow-lg">
                   <h5 className="text-white font-black text-lg mb-1">{note.title}</h5>
                   <p className="text-[10px] text-blue-500 font-black uppercase mb-4">{note.subtitle}</p>
                   <div className="text-xs text-slate-500 line-clamp-4 leading-relaxed font-medium italic">{note.content || 'Notes pending...'}</div>
                </div>
              ))}
              {subNotes.length === 0 && <div className="py-12 border-2 border-dashed border-slate-800 rounded-[32px] text-center opacity-20"><StickyNote className="w-8 h-8 mx-auto mb-2" /><p className="text-xs font-black uppercase tracking-widest">No entries</p></div>}
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
  
  // Forms state
  const [newTaskText, setNewTaskText] = useState('');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  // Pomodoro state
  const [timerMode, setTimerMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Persistence (LocalStorage)
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('e-tasks-v7') || '[]'));
  const [resources, setResources] = useState(() => JSON.parse(localStorage.getItem('e-res-v7') || '[]'));
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('e-notes-v7') || '[]'));
  const [confidence, setConfidence] = useState(() => JSON.parse(localStorage.getItem('e-conf-v7') || '{}'));

  useEffect(() => {
    localStorage.setItem('e-tasks-v7', JSON.stringify(tasks));
    localStorage.setItem('e-res-v7', JSON.stringify(resources));
    localStorage.setItem('e-notes-v7', JSON.stringify(notes));
    localStorage.setItem('e-conf-v7', JSON.stringify(confidence));
  }, [tasks, resources, notes, confidence]);

  // Pomodoro Interval
  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0) setIsActive(false);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const stats = useMemo(() => {
    const critical = EXAM_DATA.filter(d => d.status === 'CRITICAL FOCUS').length;
    const academicExams = EXAM_DATA.filter(e => e.id !== 'general');
    const avgReady = academicExams.length > 0 
      ? Math.round(academicExams.reduce((sum, e) => sum + (parseInt(confidence[e.id]) || 0), 0) / academicExams.length)
      : 0;
    return { critical, avgReady, noteCount: notes.length, taskDone: tasks.filter(t => t.completed).length };
  }, [notes, tasks, confidence]);

  const createNote = (subId) => {
    const newNote = { id: Date.now(), subjectId: subId || 'general', title: 'New Study Brief', subtitle: 'Chapter Concept', content: '', timestamp: new Date().toISOString() };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setActiveTab('notes');
  };

  const handleConf = (id, val) => setConfidence(prev => ({ ...prev, [id]: val }));

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 font-sans pb-24 lg:pb-0 selection:bg-blue-500/30">
      
      {/* Navigation - Sidebar (Lg) / Bottom (Sm) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18]/95 backdrop-blur-xl border-t border-slate-800 lg:top-0 lg:left-0 lg:w-20 lg:h-full lg:flex-col lg:border-r lg:border-t-0 flex justify-around items-center p-4">
        {[
          { id: 'overview', icon: <LayoutDashboard className="w-6 h-6" /> },
          { id: 'tasks', icon: <BookOpen className="w-6 h-6" /> },
          { id: 'notes', icon: <StickyNote className="w-6 h-6" /> },
          { id: 'calendar', icon: <CalendarIcon className="w-6 h-6" /> }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)} 
            className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            {item.icon}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:pl-32">
        
        {/* Header Area with Pomodoro */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
             <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">COMMAND <span className="text-blue-500">PRO</span></h1>
             <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-3">Shanmukh Dhusetty • Readiness System 2026</p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 flex items-center gap-6 shadow-2xl">
             <div className="flex flex-col items-center shrink-0 min-w-[70px]">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{timerMode} session</span>
                <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
             </div>
             <div className="flex gap-2">
                <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-slate-800 text-slate-300' : 'bg-blue-600 text-white shadow-lg'}`}>{isActive ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 rotate-45" />}</button>
                <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'work' ? 25*60 : 5*60) }} className="p-3 text-slate-500 hover:text-white" title="Reset Timer"><Timer className="w-4 h-4" /></button>
             </div>
          </div>
        </header>

        {/* --- TABS RENDERING --- */}

        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-700 space-y-12 pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: 'Critical Priority', v: stats.critical, c: 'text-red-500', i: <Flame className="w-4 h-4" /> },
                { l: 'Avg Readiness', v: stats.avgReady + '%', c: 'text-blue-500', i: <Gauge className="w-4 h-4" /> },
                { l: 'Study Briefs', v: stats.noteCount, c: 'text-purple-500', i: <StickyNote className="w-4 h-4" /> },
                { l: 'Goals Met', v: stats.taskDone, c: 'text-green-500', i: <CheckCircle2 className="w-4 h-4" /> }
              ].map((s, i) => (
                <div key={i} className="bg-[#0f172a] border border-slate-800 p-7 rounded-[32px] hover:border-slate-600 transition-all shadow-xl">
                  <div className={`flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest ${s.c}`}>{s.i} {s.l}</div>
                  <div className="text-5xl font-black text-white">{s.v}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Academic Roadmap</h2>
                   <div className="flex items-center gap-2 text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"><AlertCircle className="w-3 h-3"/> 3 HIGH STAKES</div>
                </div>
                <div className="space-y-4">
                  {EXAM_DATA.filter(e => e.id !== 'general').map(exam => (
                    <button key={exam.id} onClick={() => setSelectedExam(exam)} className={`w-full text-left bg-[#0f172a] border p-6 rounded-[36px] transition-all group flex items-center gap-6 ${exam.status === 'CRITICAL FOCUS' ? 'border-red-500/30' : 'border-slate-800'} hover:border-blue-500 shadow-xl`}>
                       <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0 shadow-lg`}>
                          <span className="text-[8px] font-black uppercase leading-none">MAY</span>
                          <span className="text-2xl font-black leading-none mt-1">{exam.date.split('-')[2]}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-white font-black group-hover:text-blue-400 transition-colors truncate text-xl leading-tight italic">{exam.subject}</h4>
                          <div className="flex items-center gap-3 mt-2">
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${exam.color} text-white`}>{exam.status}</span>
                             <div className="h-1 flex-1 max-w-[80px] bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${confidence[exam.id] || 0}%` }}></div>
                             </div>
                             <span className="text-[9px] font-black text-slate-500">{confidence[exam.id] || 0}% READY</span>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
                 
                 {/* GRID SECTION */}
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

                 {/* DETAIL PANE */}
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

      {/* --- FLOATING MODAL --- */}
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

      {/* --- BACKGROUND ACCENTS --- */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/[0.03] blur-[150px] rounded-full"></div>
         <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-600/[0.03] blur-[150px] rounded-full"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.015] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:60px_60px]"></div>
      </div>

    </div>
  );
};

export default App;
