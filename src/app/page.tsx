"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Clock, Play, Square, Settings, Menu, CheckCircle2, Circle, Send, Award, Activity, Plus, Tag, Calendar, ListTodo, AlignLeft, Trash2, Key, Palette, Save, Gamepad2, Coins, Volume2, VolumeX, Maximize, X, Bird } from 'lucide-react';
import styles from './page.module.css';

// Types
type Priority = 'baja' | 'media' | 'alta';
type Task = { id: number, title: string, description: string, subject: string, priority: Priority, emoji: string, completed: boolean, date: string };
type MoodLog = { id: number, time: string, emoji: string, label: string, note: string };
type ThemeName = 'default' | 'forest' | 'ocean' | 'sunset' | 'lavender' | 'black' | 'light';

const TASK_EMOJIS = ['📚', '✍️', '💻', '🔬', '🎨', '📊', '📝', '⚡'];

const THEMES = {
  default: { '--bg': '#0f111a', '--bg-elevated': '#1a1d27', '--bg-card': 'rgba(26, 29, 39, 0.7)', '--text': '#ffffff', '--text-muted': '#94a3b8', '--accent': '#6366f1', '--accent-hover': '#4f46e5', '--border': 'rgba(255, 255, 255, 0.1)', '--btn-text': '#ffffff' },
  forest: { '--bg': '#0f1a14', '--bg-elevated': '#17271f', '--bg-card': 'rgba(23, 39, 31, 0.7)', '--text': '#f0fdf4', '--text-muted': '#86efac', '--accent': '#10b981', '--accent-hover': '#059669', '--border': 'rgba(255, 255, 255, 0.1)', '--btn-text': '#ffffff' },
  ocean: { '--bg': '#0f172a', '--bg-elevated': '#1e293b', '--bg-card': 'rgba(30, 41, 59, 0.7)', '--text': '#f8fafc', '--text-muted': '#94a3b8', '--accent': '#0ea5e9', '--accent-hover': '#0284c7', '--border': 'rgba(255, 255, 255, 0.1)', '--btn-text': '#ffffff' },
  sunset: { '--bg': '#2a1215', '--bg-elevated': '#3f1a1f', '--bg-card': 'rgba(63, 26, 31, 0.7)', '--text': '#fff1f2', '--text-muted': '#fecdd3', '--accent': '#f43f5e', '--accent-hover': '#e11d48', '--border': 'rgba(255, 255, 255, 0.1)', '--btn-text': '#ffffff' },
  lavender: { '--bg': '#1e1b4b', '--bg-elevated': '#2e2768', '--bg-card': 'rgba(46, 39, 104, 0.7)', '--text': '#faf5ff', '--text-muted': '#d8b4fe', '--accent': '#a855f7', '--accent-hover': '#9333ea', '--border': 'rgba(255, 255, 255, 0.1)', '--btn-text': '#ffffff' },
  black: { '--bg': '#000000', '--bg-elevated': '#0a0a0a', '--bg-card': 'rgba(0, 0, 0, 0.8)', '--text': '#ffffff', '--text-muted': '#737373', '--accent': '#ffffff', '--accent-hover': '#d4d4d4', '--border': 'rgba(255, 255, 255, 0.15)', '--btn-text': '#000000' },
  light: { '--bg': '#f8fafc', '--bg-elevated': '#ffffff', '--bg-card': 'rgba(255, 255, 255, 0.85)', '--text': '#0f172a', '--text-muted': '#64748b', '--accent': '#6366f1', '--accent-hover': '#4f46e5', '--border': 'rgba(0, 0, 0, 0.1)', '--btn-text': '#ffffff' },
};

const FOCUS_SOUNDS = [
  { id: 'rain', name: 'Lluvia', emoji: '🌧️', url: '/sounds/rain.mp3' },
  { id: 'ocean', name: 'Olas', emoji: '🌊', url: '/sounds/ocean.mp3' },
  { id: 'forest', name: 'Bosque', emoji: '🌲', url: '/sounds/forest.mp3' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'pomodoro' | 'wellness' | 'ai' | 'games' | 'mascot' | 'settings'>('tasks');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  // App UI State
  const [toast, setToast] = useState<{msg: string, type: 'info'|'error'|'success'} | null>(null);
  const [modal, setModal] = useState<{title: string, content: string} | null>(null);

  const showToast = React.useCallback((msg: string, type: 'info'|'error'|'success' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Settings State
  const [theme, setTheme] = useState<ThemeName>('default');
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  
  // Game & Pet State
  const [xp, setXp] = useState(20); 
  const [petXp, setPetXp] = useState(0); 
  const [petName, setPetName] = useState('Study Buddy');

  // Audio State
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Terminar ensayo de historia', description: 'Investigar Revolución Francesa', subject: 'Historia', priority: 'alta', emoji: '✍️', completed: false, date: new Date().toLocaleDateString() },
    { id: 2, title: 'Leer capítulo 4 y 5', description: 'Tomar notas para el examen final', subject: 'Biología', priority: 'media', emoji: '🔬', completed: false, date: new Date().toLocaleDateString() },
  ]);

  const toggleSound = (soundId: string, url: string) => {
    if (activeSound === soundId) {
      audioRef.current?.pause();
      setActiveSound(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => {
          console.error("Audio playback error:", e);
          showToast("Error reproduciendo el sonido. Posible bloqueo del navegador.", "error");
        });
        setActiveSound(soundId);
      }
    }
  };

  return (
    <div className={styles.container} style={THEMES[theme] as any}>
      
      {/* Toast Notification System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: 50, x: '-50%' }} 
            className={`${styles.toast} ${styles[`toast-${toast.type}`]}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Modal System */}
      <AnimatePresence>
        {modal && (
          <div className={styles.modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={styles.modalContent}>
              <button className={styles.modalCloseBtn} onClick={() => setModal(null)}><X size={20}/></button>
              <h3 className={styles.modalTitle}>{modal.title}</h3>
              <p className={styles.modalText}>{modal.content}</p>
              <button className={styles.primaryBtn} onClick={() => setModal(null)} style={{marginTop: '24px', width: '100%'}}>Entendido</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      {!zenMode && (
        <nav className={styles.sidebar}>
          <div className={styles.logo}>
            <Brain className={styles.logoIcon} />
            <span>StudyPulse</span>
          </div>

          <div className={styles.xpBadgeSidebar} style={{margin: '16px 24px'}}>
            <Coins size={16} /> <span>{xp} XP Disp.</span>
          </div>

          <div className={styles.navLinks}>
            <NavItem icon={<ListTodo />} label="Tareas" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
            <NavItem icon={<Clock />} label="Pomodoro" active={activeTab === 'pomodoro'} onClick={() => setActiveTab('pomodoro')} />
            <NavItem icon={<Heart />} label="Bienestar" active={activeTab === 'wellness'} onClick={() => setActiveTab('wellness')} />
            <NavItem icon={<Gamepad2 />} label="Juegos" active={activeTab === 'games'} onClick={() => setActiveTab('games')} />
            <NavItem icon={<Bird />} label="Mascota" active={activeTab === 'mascot'} onClick={() => setActiveTab('mascot')} />
            <NavItem icon={<Brain />} label="Asistente IA" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          </div>

          <div className={styles.focusSoundsWidget}>
            <div className={styles.widgetHeader}>
              <Volume2 size={14} /> <span>Sonidos de Enfoque</span>
            </div>
            <div className={styles.soundControls}>
              {FOCUS_SOUNDS.map(s => (
                <button 
                  key={s.id} 
                  className={`${styles.soundBtn} ${activeSound === s.id ? styles.soundBtnActive : ''}`}
                  onClick={() => toggleSound(s.id, s.url)}
                  title={s.name}
                >
                  {s.emoji}
                </button>
              ))}
              {activeSound && (
                <button className={styles.soundOffBtn} onClick={() => { audioRef.current?.pause(); setActiveSound(null); }} title="Apagar Sonido">
                  <VolumeX size={14} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.navBottom}>
            <NavItem icon={<Settings />} label="Ajustes" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </nav>
      )}

      {/* Mobile Header */}
      {!zenMode && (
        <header className={styles.mobileHeader}>
          <div className={styles.logo}>
            <Brain className={styles.logoIcon} />
            <span>StudyPulse</span>
          </div>
          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            <div className={styles.xpBadgeSidebar} style={{marginBottom: 0}}>
              <Coins size={14} /> <span>{xp} XP</span>
            </div>
            <button className={styles.menuButton} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu />
            </button>
          </div>
        </header>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && !zenMode && (
          <motion.div className={styles.mobileNav} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <NavItem icon={<ListTodo />} label="Tareas" active={activeTab === 'tasks'} onClick={() => { setActiveTab('tasks'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Clock />} label="Pomodoro" active={activeTab === 'pomodoro'} onClick={() => { setActiveTab('pomodoro'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Heart />} label="Bienestar" active={activeTab === 'wellness'} onClick={() => { setActiveTab('wellness'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Gamepad2 />} label="Juegos" active={activeTab === 'games'} onClick={() => { setActiveTab('games'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Bird />} label="Mascota" active={activeTab === 'mascot'} onClick={() => { setActiveTab('mascot'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Brain />} label="Asistente IA" active={activeTab === 'ai'} onClick={() => { setActiveTab('ai'); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Settings />} label="Ajustes" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} />
            
            <div className={styles.mobileSounds}>
               <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>Sonidos de Enfoque:</span>
               <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                 {FOCUS_SOUNDS.map(s => (
                    <button key={s.id} className={`${styles.soundBtn} ${activeSound === s.id ? styles.soundBtnActive : ''}`} onClick={() => toggleSound(s.id, s.url)}>
                      {s.emoji}
                    </button>
                  ))}
                  {activeSound && <button className={styles.soundOffBtn} onClick={() => { audioRef.current?.pause(); setActiveSound(null); }}><VolumeX size={14} /></button>}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`${styles.mainContent} ${zenMode ? styles.mainContentZen : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab + (zenMode ? '-zen' : '')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className={zenMode ? styles.zenWrapper : styles.contentWrapper}>
            {activeTab === 'tasks' && !zenMode && <TasksTab tasks={tasks} setTasks={setTasks} xp={xp} setXp={setXp} apiKey={apiKey} showToast={showToast} setModal={setModal} />}
            {activeTab === 'pomodoro' && <PomodoroTab tasks={tasks} xp={xp} setXp={setXp} zenMode={zenMode} setZenMode={setZenMode} showToast={showToast} />}
            {activeTab === 'wellness' && !zenMode && <WellnessTab showToast={showToast} />}
            {activeTab === 'games' && !zenMode && <GamesTab xp={xp} setXp={setXp} showToast={showToast} />}
            {activeTab === 'mascot' && !zenMode && <MascotTab xp={xp} setXp={setXp} petXp={petXp} setPetXp={setPetXp} petName={petName} setPetName={setPetName} showToast={showToast} />}
            {activeTab === 'ai' && !zenMode && <AIAssistantTab aiProvider={aiProvider} apiKey={apiKey} aiModel={aiModel} />}
            {activeTab === 'settings' && !zenMode && (
              <SettingsTab theme={theme} setTheme={setTheme} aiProvider={aiProvider} setAiProvider={setAiProvider} apiKey={apiKey} setApiKey={setApiKey} aiModel={aiModel} setAiModel={setAiModel} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <audio ref={audioRef} loop style={{ display: 'none' }} />
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button className={`${styles.navItem} ${active ? styles.navItemActive : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {active && <motion.div className={styles.activeIndicator} layoutId="activeNav" />}
    </button>
  );
}

// ----------------------------------------------------------------------
// TASKS TAB
// ----------------------------------------------------------------------
function TasksTab({ tasks, setTasks, xp, setXp, apiKey, showToast, setModal }: any) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('media');
  const [newEmoji, setNewEmoji] = useState('📚');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTasks([{ id: Date.now(), title: newTitle, description: newDesc, subject: newSubject || 'General', priority: newPriority, emoji: newEmoji, completed: false, date: new Date().toLocaleDateString() }, ...tasks]);
    setNewTitle('');
    setNewDesc('');
    setNewSubject('');
    setNewPriority('media');
    setNewEmoji('📚');
    showToast('Tarea añadida con éxito', 'success');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t: Task) => {
      if (t.id === id) {
        if (!t.completed) {
          setXp(xp + 10);
          showToast('¡Bien hecho! Ganaste 10 XP', 'success');
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const deleteTask = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setTasks(tasks.filter((t: Task) => t.id !== id));
  };

  const getPriorityColor = (p: Priority) => {
    if(p === 'alta') return 'var(--danger)';
    if(p === 'media') return 'var(--warning)';
    return 'var(--success)';
  };

  const activeTasks = tasks.filter((t: Task) => !t.completed);
  const completedTasks = tasks.filter((t: Task) => t.completed);

  const suggestTask = () => {
    if (!apiKey) {
      showToast("¡Necesitas configurar tu API Key en la sección Ajustes!", 'error');
      return;
    }
    if (activeTasks.length === 0) {
      showToast("No hay tareas pendientes.", 'info');
      return;
    }
    const highPriority = activeTasks.filter((t:Task) => t.priority === 'alta');
    const target = highPriority.length > 0 ? highPriority[0] : activeTasks[0];
    
    setModal({
      title: "Sugerencia Inteligente IA 🧠",
      content: `Según tu lista y prioridades, el sistema te recomienda enfocarte ahora mismo en:\n\n${target.emoji} ${target.title}\n\nTerminar esta tarea es la que mayor impacto generará en tus objetivos de estudio el día de hoy.`
    });
  };

  return (
    <div className={styles.dashboardGrid}>
      <div className={`${styles.glassCard} ${styles.colSpan2}`}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px'}}>
          <h2 className={styles.cardTitle} style={{marginBottom: 0}}><ListTodo className={styles.icon} /> Panel de Tareas</h2>
          <button className={styles.aiSuggestBtn} onClick={suggestTask}><Brain size={16}/> Sugerencia Inteligente</button>
        </div>
        <div style={{marginBottom: '20px', color: 'var(--text-muted)'}}>Completa tareas para ganar <strong>+10 XP</strong>. ¡Usa esa XP para alimentar a tu Mascota!</div>
        
        <form onSubmit={addTask} className={styles.advancedTaskForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{flex: 2}}>
              <label>Título de la Tarea</label>
              <input type="text" placeholder="¿Qué necesitas hacer hoy?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label>Icono</label>
              <div className={styles.emojiSelector}>
                {TASK_EMOJIS.map(em => (
                  <button key={em} type="button" className={`${styles.emojiBtn} ${newEmoji === em ? styles.emojiBtnActive : ''}`} onClick={() => setNewEmoji(em)}>{em}</button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup} style={{marginTop: '16px'}}>
            <label><AlignLeft size={14} style={{display:'inline', verticalAlign:'middle'}}/> Detalles adicionales (Opcional)</label>
            <textarea placeholder="Añade instrucciones, páginas a leer..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className={styles.textarea} rows={2} />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Categoría / Materia</label>
              <input type="text" placeholder="Ej. Matemáticas" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Prioridad</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)} className={styles.select}>
                <option value="baja">Baja - Puede esperar</option>
                <option value="media">Media - Importante</option>
                <option value="alta">Alta - Urgente</option>
              </select>
            </div>
            <button type="submit" className={styles.primaryBtn} style={{ marginTop: '24px' }}>
              <Plus size={20} /> Crear
            </button>
          </div>
        </form>

        <h3 className={styles.sectionHeading}>Tareas Pendientes ({activeTasks.length})</h3>
        <div className={styles.taskGrid}>
          <AnimatePresence>
            {activeTasks.map((task: Task) => (
              <motion.div key={task.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={styles.advancedTaskItem} onClick={() => toggleTask(task.id)}>
                <div className={styles.taskHeader}>
                  <div className={styles.taskTitleRow}>
                    <div className={styles.taskEmojiBox}>{task.emoji}</div>
                    <div style={{flex: 1}}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                    </div>
                    <button className={styles.deleteBtn} onClick={(e) => deleteTask(e, task.id)} title="Eliminar"><Trash2 size={18} /></button>
                    <Circle className={styles.checkIcon} />
                  </div>
                </div>
                <div className={styles.taskMeta}>
                  <span className={styles.tag}><Tag size={12}/> {task.subject}</span>
                  <span className={styles.priorityTag} style={{ color: getPriorityColor(task.priority), borderColor: getPriorityColor(task.priority) }}>Prioridad {task.priority}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeTasks.length === 0 && <div className={styles.emptyState}>¡Todo al día! Has completado tus tareas.</div>}
        </div>

        {completedTasks.length > 0 && (
          <>
            <h3 className={styles.sectionHeading} style={{marginTop: '40px'}}>Completadas ({completedTasks.length})</h3>
            <div className={styles.taskGrid}>
              {completedTasks.map((task: Task) => (
                <motion.div key={task.id} layout className={`${styles.advancedTaskItem} ${styles.taskItemDone}`} onClick={() => toggleTask(task.id)}>
                  <div className={styles.taskHeader}>
                    <div className={styles.taskTitleRow}>
                      <div className={styles.taskEmojiBox} style={{opacity: 0.5}}>{task.emoji}</div>
                      <div style={{flex: 1}}>
                        <span className={styles.taskTitle} style={{textDecoration: 'line-through'}}>{task.title}</span>
                      </div>
                      <button className={styles.deleteBtn} onClick={(e) => deleteTask(e, task.id)} title="Eliminar"><Trash2 size={18} /></button>
                      <CheckCircle2 className={styles.checkIcon} style={{color: 'var(--success)'}} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// POMODORO TAB
// ----------------------------------------------------------------------
function PomodoroTab({ tasks, xp, setXp, zenMode, setZenMode, showToast }: any) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customWork, setCustomWork] = useState<string>('25');
  const [customBreak, setCustomBreak] = useState<string>('5');
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60); 
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [achievements, setAchievements] = useState(0);
  
  const activeTasks = tasks.filter((t: Task) => !t.completed);
  const [selectedTask, setSelectedTask] = useState(activeTasks.length > 0 ? activeTasks[0].id : null);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) { 
      if (mode === 'work') {
        setAchievements(a => a + 1);
        setXp(xp + 15);
        showToast('¡Pomodoro completado! +15 XP', 'success');
        setMode('break');
        const nextTime = isCustomMode ? (Number(customBreak) || 5) * 60 : 5 * 60;
        setTimeLeft(nextTime);
        setInitialTime(nextTime);
      } else {
        setMode('work');
        showToast('Descanso terminado, de vuelta al trabajo.', 'info');
        const nextTime = isCustomMode ? (Number(customWork) || 25) * 60 : 25 * 60;
        setTimeLeft(nextTime);
        setInitialTime(nextTime);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, isCustomMode, customWork, customBreak, xp, setXp, showToast]);

  const applyCustomTimes = () => {
    setIsRunning(false);
    setMode('work');
    const val = (Number(customWork) || 25) * 60;
    setTimeLeft(val);
    setInitialTime(val);
  };

  const setNormalTimes = () => {
    setIsCustomMode(false);
    setIsRunning(false);
    setMode('work');
    setTimeLeft(25 * 60);
    setInitialTime(25 * 60);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialTime > 0 ? (1 - timeLeft / initialTime) : 0;
  const strokeDashoffset = 283 - (283 * progressPercent);

  if (zenMode) {
    return (
      <div className={styles.zenContainer}>
        <button className={styles.exitZenBtn} onClick={() => setZenMode(false)}>Salir del Modo Zen</button>
        <div className={styles.pomodoroContainer} style={{border: 'none', background: 'transparent', transform: 'scale(1.2)'}}>
           <div className={styles.pomodoroMode}>
              <span className={styles.modeActive} style={{padding: '10px 32px', borderRadius: 'var(--radius-pill)', fontWeight: 600}}>
                {mode === 'work' ? 'Enfoque Profundo' : 'Descanso'}
              </span>
            </div>
            
            <div className={styles.timerCircle}>
              <svg viewBox="0 0 100 100" className={styles.circularProgress}>
                <circle cx="50" cy="50" r="45" className={styles.circleBg} />
                <motion.circle cx="50" cy="50" r="45" className={styles.circleFill} initial={{ strokeDashoffset: 283 }} animate={{ strokeDashoffset }} transition={{ duration: 1 }} />
              </svg>
              <div className={styles.timerText}>{formatTime(timeLeft)}</div>
            </div>

            <div className={styles.pomodoroControls}>
              <button className={styles.playBtnLarge} onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? <Square /> : <Play />} {isRunning ? 'Pausar' : 'Iniciar'}
              </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardGrid}>
      <div className={`${styles.glassCard} ${styles.colSpan2}`}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px'}}>
          <h2 className={styles.cardTitle} style={{marginBottom: 0}}><Clock className={styles.icon} /> Focus & Pomodoro</h2>
          <button className={styles.zenToggleBtn} onClick={() => { setZenMode(true); showToast("Modo Zen activado. Cero distracciones.", "success"); }}><Maximize size={16}/> Modo Monje (Zen)</button>
        </div>
        
        <div className={styles.pomodoroHeaderOptions}>
          <button className={`${styles.pomoTypeBtn} ${!isCustomMode ? styles.pomoTypeActive : ''}`} onClick={setNormalTimes}>Clásico (25/5)</button>
          <button className={`${styles.pomoTypeBtn} ${isCustomMode ? styles.pomoTypeActive : ''}`} onClick={() => setIsCustomMode(true)}>Personalizado</button>
        </div>

        {isCustomMode && (
          <div className={styles.customPomodoroForm}>
            <div className={styles.formGroup}>
              <label>Minutos Trabajo</label>
              <input type="number" min="1" max="120" value={customWork} onChange={e => setCustomWork(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Minutos Descanso</label>
              <input type="number" min="1" max="60" value={customBreak} onChange={e => setCustomBreak(e.target.value)} className={styles.input} />
            </div>
            <button className={styles.primaryBtn} onClick={applyCustomTimes} style={{alignSelf: 'flex-end', padding: '12px 16px'}}><Save size={18}/> Aplicar</button>
          </div>
        )}
        
        <div className={styles.pomodoroLayout}>
          <div className={styles.pomodoroContainer}>
            <div className={styles.pomodoroMode}>
              <button className={`${styles.modeBtn} ${mode === 'work' ? styles.modeActive : ''}`} onClick={() => { setMode('work'); const val = isCustomMode ? (Number(customWork) || 25) * 60 : 25 * 60; setTimeLeft(val); setInitialTime(val); setIsRunning(false); }}>Enfoque Profundo</button>
              <button className={`${styles.modeBtn} ${mode === 'break' ? styles.modeActive : ''}`} onClick={() => { setMode('break'); const val = isCustomMode ? (Number(customBreak) || 5) * 60 : 5 * 60; setTimeLeft(val); setInitialTime(val); setIsRunning(false); }}>Descanso</button>
            </div>
            
            <div className={styles.timerCircle}>
              <svg viewBox="0 0 100 100" className={styles.circularProgress}>
                <circle cx="50" cy="50" r="45" className={styles.circleBg} />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  className={styles.circleFill}
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className={styles.timerText}>{formatTime(timeLeft)}</div>
            </div>

            <div className={styles.pomodoroControls}>
              <button className={styles.playBtnLarge} onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? <Square /> : <Play />} {isRunning ? 'Pausar Sesión' : 'Iniciar Sesión'}
              </button>
            </div>
          </div>

          <div className={styles.focusTaskContainer}>
            <div className={styles.achievementsBoxBig}>
              <Award className={styles.achievementIconBig} size={32} />
              <div>
                <span className={styles.achievementsLabel}>Logros Pomodoro</span>
                <span className={styles.achievementsValue}>{achievements} Sesiones (+15 XP c/u)</span>
              </div>
            </div>

            <div className={styles.focusTaskSelector}>
              <h3>¿En qué vas a enfocarte?</h3>
              {activeTasks.length > 0 ? (
                <div className={styles.focusTaskList}>
                  {activeTasks.map((t: Task) => (
                    <div key={t.id} className={`${styles.focusTaskItem} ${selectedTask === t.id ? styles.focusTaskSelected : ''}`} onClick={() => setSelectedTask(t.id)}>
                      <span className={styles.focusEmoji}>{t.emoji}</span>
                      <span className={styles.focusTitle}>{t.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No tienes tareas pendientes.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// WELLNESS TAB
// ----------------------------------------------------------------------
const MOODS = [
  { emoji: '🤩', label: 'Increíble', score: 100 },
  { emoji: '😊', label: 'Bien', score: 80 },
  { emoji: '😐', label: 'Neutral', score: 50 },
  { emoji: '😔', label: 'Triste', score: 30 },
  { emoji: '😫', label: 'Agotado', score: 20 },
  { emoji: '😡', label: 'Estresado', score: 10 },
];

function WellnessTab({ showToast }: any) {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [note, setNote] = useState('');

  const handleSaveMood = () => {
    if(!selectedMood) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs([{ id: Date.now(), time: timeString, emoji: selectedMood.emoji, label: selectedMood.label, note: note.trim() }, ...logs]);
    setSelectedMood(null);
    setNote('');
    showToast('Estado emocional registrado.', 'success');
  };

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.glassCard}>
        <h2 className={styles.cardTitle}><Activity className={styles.icon} /> Check-in Emocional</h2>
        <p className={styles.subtitle}>¿Cómo te sientes en este momento?</p>
        <div className={styles.moodGrid}>
          {MOODS.map(mood => (
            <button key={mood.label} className={`${styles.moodBtn} ${selectedMood?.label === mood.label ? styles.moodSelected : ''}`} onClick={() => setSelectedMood(mood)}>
              <span className={styles.moodEmoji}>{mood.emoji}</span>
              <span className={styles.moodLabel}>{mood.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {selectedMood && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={styles.moodNoteContainer}>
              <label>Nota opcional (¿Qué causó este estado?)</label>
              <textarea className={styles.textarea} placeholder="Ej. Mucho estrés por el examen de mañana..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
              <button className={styles.primaryBtn} onClick={handleSaveMood} style={{width: '100%'}}>Guardar registro</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.glassCard}>
        <h2 className={styles.cardTitle}><Calendar className={styles.icon} /> Historial de hoy</h2>
        <div className={styles.historyList}>
          {logs.length === 0 ? (
            <p className={styles.emptyState}>No has registrado tu estado de ánimo hoy.</p>
          ) : (
            logs.map((log) => (
              <motion.div key={log.id} className={styles.historyItem} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className={styles.historyTime}>{log.time}</div>
                <div className={styles.historyEmoji}>{log.emoji}</div>
                <div className={styles.historyContent}>
                  <strong>{log.label}</strong>
                  {log.note && <p className={styles.historyNote}>{log.note}</p>}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MASCOT TAB
// ----------------------------------------------------------------------
function MascotTab({ xp, setXp, petXp, setPetXp, petName, setPetName, showToast }: any) {
  const [hearts, setHearts] = useState<{id: number, x: number}[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(petName);
  
  const getMascot = (pxp: number) => {
    if (pxp < 50) return { emoji: '🥚', name: 'Huevo Misterioso', desc: 'Sigue dándole semillas para que eclosione.' };
    if (pxp < 150) return { emoji: '🐣', name: 'Pollito Bebé', desc: 'Acaba de nacer. Tiene mucha hambre.' };
    if (pxp < 400) return { emoji: '🐥', name: 'Pajarito', desc: '¡Ya puede caminar y cantar!' };
    return { emoji: '🦅', name: 'Águila Sabia', desc: 'Tu compañero definitivo de estudio.' };
  };

  const mascot = getMascot(petXp);
  const FEED_COST = 5;

  const feedPet = () => {
    if (xp >= FEED_COST) {
      setXp(xp - FEED_COST);
      setPetXp(petXp + FEED_COST);
      
      const id = Date.now();
      const randomX = Math.random() * 80 - 40; 
      setHearts(prev => [...prev, {id, x: randomX}]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== id));
      }, 1500);
    } else {
      showToast('No tienes suficiente XP para comprar semillas.', 'error');
    }
  };

  const handleSaveName = () => {
    if (xp >= 5) {
      setXp(xp - 5);
      setPetName(tempName || 'Mascota');
      setIsEditingName(false);
      showToast('Nombre actualizado exitosamente (-5 XP)', 'success');
    } else {
      showToast('Necesitas 5 XP para cambiar el nombre', 'error');
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      <div className={`${styles.glassCard} ${styles.colSpan2}`} style={{textAlign: 'center', position: 'relative', padding: '60px 20px', minHeight: '500px'}}>
        <h2 className={styles.cardTitle} style={{justifyContent: 'center'}}><Bird className={styles.icon}/> Tu Mascota Virtual</h2>
        <p className={styles.subtitle}>Aliméntala con semillas usando tu XP para que evolucione.</p>
        
        <div style={{position: 'relative', display: 'inline-block', margin: '40px 0'}}>
          <div className={styles.bigMascot}>
            {mascot.emoji}
          </div>
          <AnimatePresence>
            {hearts.map(h => (
              <motion.div 
                key={h.id} 
                initial={{ opacity: 1, y: 0, x: h.x, scale: 0.5 }} 
                animate={{ opacity: 0, y: -120, scale: 1.5 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ position: 'absolute', top: '10%', left: '40%', fontSize: '42px', pointerEvents: 'none', zIndex: 10 }}
              >
                ❤️
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isEditingName ? (
          <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px'}}>
            <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className={styles.input} style={{width: '200px'}} autoFocus />
            <button className={styles.primaryBtn} onClick={handleSaveName}>Guardar (5 XP)</button>
            <button className={styles.primaryBtn} onClick={() => setIsEditingName(false)} style={{background: 'var(--border)'}}>X</button>
          </div>
        ) : (
          <h3 style={{fontSize: '24px', marginBottom: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'}} onClick={() => { setTempName(petName); setIsEditingName(true); }} title="Editar nombre">
            {petName} <span style={{fontSize: '14px', color: 'var(--text-muted)'}}>✏️</span>
          </h3>
        )}

        <p style={{color: 'var(--text-muted)', marginBottom: '32px'}}>Especie: {mascot.name} - {mascot.desc}</p>
        
        <div style={{background: 'rgba(128,128,128,0.1)', padding: '24px', borderRadius: '16px', display: 'inline-flex', flexDirection: 'column', gap: '16px', alignItems: 'center'}}>
          <div style={{fontWeight: 'bold', fontSize: '18px', color: 'var(--accent)'}}>Progreso: {petXp} exp</div>
          <button className={styles.primaryBtn} onClick={feedPet} disabled={xp < FEED_COST} style={{padding: '16px 32px', fontSize: '16px'}}>
            Dar Semillas 🌾 (Cuesta {FEED_COST} XP)
          </button>
          <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Tienes {xp} XP disponibles</div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// GAMES TAB (SNAKE, TIC TAC TOE, MEMORY, MATH, HANGMAN, REACTION)
// ----------------------------------------------------------------------
function GamesTab({ xp, setXp, showToast }: any) {
  const [game, setGame] = useState<'none' | 'snake' | 'tictactoe' | 'memory' | 'math' | 'hangman' | 'reaction'>('none');
  const GAME_COST = 2;

  const startGame = (type: 'snake' | 'tictactoe' | 'memory' | 'math' | 'hangman' | 'reaction') => {
    if (xp >= GAME_COST) {
      setXp(xp - GAME_COST);
      setGame(type);
      showToast(`-2 XP gastados para jugar`, 'info');
    } else {
      showToast("No tienes suficiente XP. ¡Completa tareas para ganar más!", 'error');
    }
  }

  return (
    <div className={styles.dashboardGrid}>
      <div className={`${styles.glassCard} ${styles.colSpan2}`}>
        <h2 className={styles.cardTitle}><Gamepad2 className={styles.icon} /> Recompensas y Juegos</h2>
        
        {game === 'none' && (
          <>
            <p className={styles.subtitle}>Usa tu experiencia (XP) para jugar y desconectar un momento. Tienes <strong>{xp} XP</strong>.</p>
            <div className={styles.gamesList}>
              <div className={styles.gameCard}>
                <div className={styles.gameEmoji}>🐍</div>
                <h3>Snake (Clásico)</h3>
                <p>El clásico juego de la serpiente.</p>
                <button className={styles.primaryBtn} onClick={() => startGame('snake')} disabled={xp < GAME_COST}>
                  Jugar (Costo: 2 XP)
                </button>
              </div>
              <div className={styles.gameCard}>
                <div className={styles.gameEmoji}>❌⭕</div>
                <h3>Tic-Tac-Toe</h3>
                <p>Juega contra la IA.</p>
                <button className={styles.primaryBtn} onClick={() => startGame('tictactoe')} disabled={xp < GAME_COST}>
                  Jugar (Costo: 2 XP)
                </button>
              </div>
              <div className={styles.gameCard}>
                <div className={styles.gameEmoji}>🃏</div>
                <h3>Memorama</h3>
                <p>Encuentra los pares ocultos.</p>
                <button className={styles.primaryBtn} onClick={() => startGame('memory')} disabled={xp < GAME_COST}>
                  Jugar (Costo: 2 XP)
                </button>
              </div>
              <div className={styles.gameCard}>
                <div className={styles.gameEmoji}>🔢</div>
                <h3>Math Sprint</h3>
                <p>Resuelve rápido en 30s.</p>
                <button className={styles.primaryBtn} onClick={() => startGame('math')} disabled={xp < GAME_COST}>
                  Jugar (Costo: 2 XP)
                </button>
              </div>
              <div className={styles.gameCard}>
                <div className={styles.gameEmoji}>🔤</div>
                <h3>Ahorcado</h3>
                <p>Adivina la palabra secreta.</p>
                <button className={styles.primaryBtn} onClick={() => startGame('hangman')} disabled={xp < GAME_COST}>
                  Jugar (Costo: 2 XP)
                </button>
              </div>
              <div className={styles.gameCard}>
                <div className={styles.gameEmoji}>⚡</div>
                <h3>Prueba de Reflejos</h3>
                <p>Haz clic lo más rápido posible.</p>
                <button className={styles.primaryBtn} onClick={() => startGame('reaction')} disabled={xp < GAME_COST}>
                  Jugar (Costo: 2 XP)
                </button>
              </div>
            </div>
          </>
        )}

        {game !== 'none' && (
          <button className={styles.primaryBtn} onClick={() => setGame('none')} style={{marginBottom: '16px'}}>Salir del juego</button>
        )}

        {game === 'snake' && <SnakeGame />}
        {game === 'tictactoe' && <TicTacToeGame showToast={showToast} />}
        {game === 'memory' && <MemoryGame showToast={showToast} />}
        {game === 'math' && <MathGame showToast={showToast} />}
        {game === 'hangman' && <HangmanGame showToast={showToast} />}
        {game === 'reaction' && <ReactionGame showToast={showToast} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// HANGMAN GAME
// ----------------------------------------------------------------------
const HANGMAN_WORDS = ['ESTUDIO', 'CEREBRO', 'ENFOQUE', 'DISCIPLINA', 'MEMORIA', 'APRENDER', 'CONOCIMIENTO', 'EXAMEN', 'LOGRO', 'ESFUERZO', 'OBJETIVO', 'UNIVERSIDAD', 'LECTURA', 'PRODUCTIVIDAD'];

function HangmanGame({showToast}: any) {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setWord(HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)]);
    setGuessed([]);
    setMistakes(0);
  };

  const maxMistakes = 6;
  const isWinner = word && word.split('').every(l => guessed.includes(l));
  const isLoser = mistakes >= maxMistakes;

  useEffect(() => {
    if(isWinner) showToast("¡Adivinaste la palabra!", "success");
    if(isLoser) showToast(`Perdiste. La palabra era: ${word}`, "error");
  }, [isWinner, isLoser, showToast, word]);

  const guess = (l: string) => {
    if(isWinner || isLoser || guessed.includes(l)) return;
    setGuessed([...guessed, l]);
    if(!word.includes(l)) {
      setMistakes(m => m + 1);
    }
  };

  const keyboard = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split('');

  return (
    <div className={styles.gameArea} style={{textAlign: 'center'}}>
      <h3>Ahorcado - Errores: {mistakes} / {maxMistakes}</h3>
      <div style={{fontSize: '36px', letterSpacing: '8px', margin: '30px 0', fontFamily: 'monospace', fontWeight: 'bold'}}>
        {word.split('').map((l, i) => (guessed.includes(l) || isLoser) ? l : '_').join('')}
      </div>
      
      {(isWinner || isLoser) && <button className={styles.primaryBtn} onClick={initGame} style={{marginBottom:'20px'}}>Jugar de nuevo</button>}

      <div style={{display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center', maxWidth:'500px', margin:'0 auto', marginTop: '20px'}}>
        {keyboard.map(l => (
          <button 
            key={l} 
            disabled={guessed.includes(l) || isWinner || isLoser}
            onClick={() => guess(l)}
            style={{
              padding:'10px 14px', borderRadius:'6px', border:'none', 
              background: guessed.includes(l) ? (word.includes(l) ? 'var(--success)' : 'var(--danger)') : 'var(--bg-elevated)',
              color: 'var(--text)', fontWeight: 'bold', cursor: 'pointer',
              opacity: guessed.includes(l) ? 0.7 : 1
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// REACTION GAME
// ----------------------------------------------------------------------
function ReactionGame({showToast}: any) {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);

  useEffect(() => {
    let t: any;
    if(gameState === 'waiting') {
      const delay = Math.floor(Math.random() * 3000) + 1500;
      t = setTimeout(() => {
        setGameState('ready');
        setStartTime(Date.now());
      }, delay);
    }
    return () => clearTimeout(t);
  }, [gameState]);

  const handleClick = () => {
    if(gameState === 'idle' || gameState === 'result') {
      setGameState('waiting');
    } else if (gameState === 'waiting') {
      showToast("¡Muy pronto! Espera el color verde.", "error");
      setGameState('idle');
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState('result');
      if (time < 250) showToast("¡Reflejos de rayo!", "success");
    }
  }

  const getBgColor = () => {
    if(gameState === 'idle') return 'var(--bg-elevated)';
    if(gameState === 'waiting') return 'var(--danger)';
    if(gameState === 'ready') return 'var(--success)';
    return 'var(--accent)';
  }

  return (
    <div className={styles.gameArea} style={{textAlign: 'center'}}>
      <h3 style={{marginBottom: '20px'}}>Prueba de Reflejos</h3>
      <div 
        onClick={handleClick}
        style={{
          background: getBgColor(),
          height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          borderRadius: '12px', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold',
          transition: gameState === 'ready' ? 'none' : 'background 0.2s',
          userSelect: 'none'
        }}
      >
        {gameState === 'idle' && "Haz clic aquí para empezar"}
        {gameState === 'waiting' && "Espera al color verde..."}
        {gameState === 'ready' && "¡CLIC AHORA!"}
        {gameState === 'result' && `¡${reactionTime} ms! Clic para intentar de nuevo`}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// MEMORY GAME
// ----------------------------------------------------------------------
const MEMORY_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
function MemoryGame({showToast}: any) {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const deck = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({id: i, emoji: e}));
    setCards(deck);
  }, []);

  const handleClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || solved.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setSolved([...solved, first, second]);
        setFlipped([]);
        if (solved.length + 2 === cards.length) showToast(`¡Ganaste en ${moves+1} movimientos!`, 'success');
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };
  return (
    <div className={styles.gameArea}>
      <h3 style={{marginBottom: '12px'}}>Memoria - Movimientos: {moves}</h3>
      <div className={styles.memoryGrid}>
        {cards.map((c, i) => (
          <div key={c.id} className={`${styles.memoryCard} ${flipped.includes(i) || solved.includes(i) ? styles.memoryCardFlipped : ''}`} onClick={() => handleClick(i)}>
            {flipped.includes(i) || solved.includes(i) ? c.emoji : '❓'}
          </div>
        ))}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// MATH SPRINT
// ----------------------------------------------------------------------
function MathGame({showToast}: any) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState({a: 1, b: 1, op: '+'});
  const [answer, setAnswer] = useState('');
  const [started, setStarted] = useState(false);

  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;
    if (op === '*') { a = Math.floor(Math.random() * 5) + 1; b = Math.floor(Math.random() * 5) + 1; }
    if (op === '-') { if (b > a) { let tmp = a; a = b; b = tmp; } }
    setQuestion({a, b, op});
  }

  useEffect(() => {
    if (started && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
      return () => clearTimeout(t);
    }
    if (started && timeLeft === 0) {
      showToast(`¡Tiempo terminado! Puntaje: ${score}`, 'info');
      setStarted(false);
    }
  }, [started, timeLeft, showToast, score]);

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setStarted(true);
    generateQuestion();
    setAnswer('');
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if(!started) return;
    const {a, b, op} = question;
    let correct = 0;
    if(op==='+') correct = a+b;
    if(op==='-') correct = a-b;
    if(op==='*') correct = a*b;

    if (parseInt(answer) === correct) {
      setScore(s => s + 1);
      setAnswer('');
      generateQuestion();
    } else {
      setAnswer('');
    }
  }

  return (
    <div className={styles.gameArea} style={{textAlign: 'center'}}>
      <h3>Reto Matemático (30s)</h3>
      {!started ? (
        <button className={styles.primaryBtn} onClick={start} style={{marginTop:'20px'}}>Comenzar</button>
      ) : (
        <div style={{marginTop: '20px'}}>
          <div style={{fontSize:'32px', fontWeight:'bold', marginBottom:'20px'}}>
            {question.a} {question.op} {question.b} = ?
          </div>
          <form onSubmit={handleSubmit}>
            <input type="number" autoFocus value={answer} onChange={e => setAnswer(e.target.value)} className={styles.input} style={{fontSize:'24px', textAlign:'center', width:'150px'}} />
          </form>
          <div style={{marginTop:'20px', display:'flex', justifyContent:'space-between'}}>
            <span style={{fontSize:'18px'}}>Puntuación: <strong>{score}</strong></span>
            <span style={{fontSize:'18px', color:'var(--danger)'}}>Tiempo: <strong>{timeLeft}s</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}

function SnakeGame() {
  const gridSize = 20;
  const initialSnake = [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}];
  const [snake, setSnake] = useState(initialSnake);
  
  const generateFood = (currentSnake: {x:number, y:number}[]) => {
    let newFood: {x: number, y: number};
    while (true) {
      newFood = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const [food, setFood] = useState({x: 5, y: 5});
  const [dir, setDir] = useState({x: 0, y: -1});
  const [lastRenderedDir, setLastRenderedDir] = useState({x: 0, y: -1});
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setFood(generateFood(initialSnake));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp': if(lastRenderedDir.y === 0) setDir({x: 0, y: -1}); break;
        case 'ArrowDown': if(lastRenderedDir.y === 0) setDir({x: 0, y: 1}); break;
        case 'ArrowLeft': if(lastRenderedDir.x === 0) setDir({x: -1, y: 0}); break;
        case 'ArrowRight': if(lastRenderedDir.x === 0) setDir({x: 1, y: 0}); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastRenderedDir]);

  useEffect(() => {
    if(gameOver) return;
    const move = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = {x: head.x + dir.x, y: head.y + dir.y};
        
        if(newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
          setGameOver(true); return prev;
        }
        if(prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true); return prev;
        }

        const newSnake = [newHead, ...prev];
        if(newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }
        
        setLastRenderedDir(dir);
        return newSnake;
      });
    }, 150);
    return () => clearInterval(move);
  }, [dir, food, gameOver]);

  return (
    <div className={styles.gameArea}>
      <h3 style={{marginBottom: '12px'}}>Puntuación: {score}</h3>
      <div className={styles.snakeGrid} style={{gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
        {Array.from({length: gridSize * gridSize}).map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return <div key={i} className={`${styles.snakeCell} ${isSnake ? styles.snakeBody : ''} ${isFood ? styles.snakeFood : ''}`} />
        })}
      </div>
      {gameOver && <p style={{color: 'var(--danger)', fontWeight: 'bold', marginTop: '12px'}}>¡Juego Terminado!</p>}
    </div>
  );
}

function TicTacToeGame({ showToast }: any) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [scores, setScores] = useState({ player: 0, cpu: 0, draws: 0 });

  const checkWinner = (squares: any[]) => {
    const lines = [ [0,1,2],[3,4,5],[6,7,8], [0,3,6],[1,4,7],[2,5,8], [0,4,8],[2,4,6] ];
    for(let line of lines) {
      const [a,b,c] = line;
      if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if(squares.every(s => s !== null)) return 'Empate';
    return null;
  };

  const minimax = (squares: any[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    if(result === 'O') return 10 - depth;
    if(result === 'X') return depth - 10;
    if(result === 'Empate') return 0;

    if(isMaximizing) {
      let bestScore = -Infinity;
      for(let i=0; i<9; i++) {
        if(!squares[i]) {
          squares[i] = 'O';
          let score = minimax(squares, depth+1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for(let i=0; i<9; i++) {
        if(!squares[i]) {
          squares[i] = 'X';
          let score = minimax(squares, depth+1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const cpuMove = (currentBoard: any[]) => {
    let move = -1;

    if(difficulty === 'facil' || (difficulty === 'medio' && Math.random() > 0.5)) {
      const emptyIndices = currentBoard.map((val, i) => val === null ? i : null).filter(val => val !== null);
      if (emptyIndices.length > 0) {
        move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)] as number;
      }
    } else {
      let bestScore = -Infinity;
      for(let i=0; i<9; i++) {
        if(!currentBoard[i]) {
          currentBoard[i] = 'O';
          let score = minimax(currentBoard, 0, false);
          currentBoard[i] = null;
          if(score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
    }

    if(move !== -1) {
      const newBoard = [...currentBoard];
      newBoard[move] = 'O';
      setBoard(newBoard);
      setIsPlayerTurn(true);
      const res = checkWinner(newBoard);
      setWinner(res);
      if (res) updateScore(res);
    }
  };

  useEffect(() => {
    if(!isPlayerTurn && !winner) {
      const timeout = setTimeout(() => {
        cpuMove(board);
      }, 600); 
      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, winner]);

  const updateScore = (res: string) => {
    if(res === 'X') {
      setScores(s => ({...s, player: s.player + 1}));
      showToast("¡Ganaste la partida!", "success");
    } else if(res === 'O') {
      setScores(s => ({...s, cpu: s.cpu + 1}));
      showToast("La computadora ha ganado", "error");
    } else if(res === 'Empate') {
      setScores(s => ({...s, draws: s.draws + 1}));
      showToast("¡Empate!", "info");
    }
  };

  const handlePlayerClick = (index: number) => {
    if(board[index] || winner || !isPlayerTurn) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    const res = checkWinner(newBoard);
    setWinner(res);
    if (res) updateScore(res);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  return (
    <div className={styles.gameArea}>
      <h3 style={{marginBottom: '8px'}}>Tic-Tac-Toe</h3>
      
      <div className={styles.tttScoreboard}>
        <div>👤 Tú: {scores.player}</div>
        <div>➖ Empates: {scores.draws}</div>
        <div>🤖 IA: {scores.cpu}</div>
      </div>
      
      {!winner && board.every(s => s === null) && (
        <div style={{marginBottom: '20px', display: 'flex', gap: '8px'}}>
          <button className={`${styles.tag} ${difficulty === 'facil' ? styles.tagActive : ''}`} onClick={() => setDifficulty('facil')}>Fácil</button>
          <button className={`${styles.tag} ${difficulty === 'medio' ? styles.tagActive : ''}`} onClick={() => setDifficulty('medio')}>Medio</button>
          <button className={`${styles.tag} ${difficulty === 'dificil' ? styles.tagActive : ''}`} onClick={() => setDifficulty('dificil')}>Difícil</button>
        </div>
      )}

      <div className={styles.tictactoeGrid}>
        {board.map((cell, i) => (
          <div key={i} className={styles.tttCell} onClick={() => handlePlayerClick(i)}>
            <AnimatePresence>
              {cell && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ color: cell === 'X' ? 'var(--accent)' : 'var(--danger)' }}
                >
                  {cell}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      {winner && (
        <div style={{marginTop: '20px', textAlign: 'center'}}>
          <p style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '12px'}}>
            {winner === 'Empate' ? '¡Es un Empate!' : winner === 'X' ? '¡Ganaste!' : '¡Perdiste!'}
          </p>
          <button className={styles.primaryBtn} onClick={resetGame}>Jugar otra vez</button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// AI ASSISTANT TAB
// ----------------------------------------------------------------------
function AIAssistantTab({ aiProvider, apiKey, aiModel }: { aiProvider: string, apiKey: string, aiModel: string }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: '¡Hola! Soy tu asistente de IA de StudyPulse. Puedo ayudarte a resumir textos, crear preguntas de estudio o darte consejos. ¿En qué te ayudo?' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    
    setTimeout(() => {
      if(!apiKey.trim()) {
        setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Atención: No has configurado tu API Key en la sección de Ajustes. Para respuestas reales de ${aiProvider.toUpperCase()} (${aiModel}), por favor ingresa tu clave.` }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `[Simulación exitosa usando ${aiProvider} / ${aiModel}]: He procesado tu mensaje: "${currentInput}". Esto requeriría una llamada real a la API con tu clave configurada.` }]);
      }
    }, 1500);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <Brain className={styles.icon} />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Tutor Inteligente ({aiProvider})</h2>
          {apiKey ? (
            <span style={{ fontSize: '12px', color: 'var(--success)' }}>En línea - Modelo: {aiModel}</span>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--danger)' }}>Falta API Key</span>
          )}
        </div>
      </div>
      <div className={styles.chatMessages}>
        {messages.map((msg, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.messageUserWrapper : ''}`}>
            {msg.role === 'ai' && <div className={styles.aiAvatar}><Brain size={16}/></div>}
            <div className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAI}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendMessage} className={styles.chatInputForm}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregúntame sobre cualquier tema..." className={styles.chatInput} />
        <button type="submit" className={styles.chatSendBtn}><Send size={18} /></button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// SETTINGS TAB
// ----------------------------------------------------------------------
function SettingsTab({ theme, setTheme, aiProvider, setAiProvider, apiKey, setApiKey, aiModel, setAiModel }: any) {
  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.glassCard}>
        <h2 className={styles.cardTitle}><Palette className={styles.icon} /> Apariencia</h2>
        <p className={styles.subtitle}>Personaliza el tema y los colores de la interfaz.</p>
        
        <div className={styles.formGroup}>
          <label>Tema de Colores</label>
          <div className={styles.themeSelector}>
            <button className={`${styles.themeBtn} ${theme === 'default' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('default')}>Índigo</button>
            <button className={`${styles.themeBtn} ${theme === 'forest' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('forest')}>Bosque</button>
            <button className={`${styles.themeBtn} ${theme === 'ocean' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('ocean')}>Océano</button>
            <button className={`${styles.themeBtn} ${theme === 'sunset' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('sunset')}>Atardecer</button>
            <button className={`${styles.themeBtn} ${theme === 'lavender' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('lavender')}>Lavanda</button>
            <button className={`${styles.themeBtn} ${theme === 'black' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('black')}>Negro Puro</button>
            <button className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('light')}>Claro</button>
          </div>
        </div>
      </div>

      <div className={styles.glassCard}>
        <h2 className={styles.cardTitle}><Key className={styles.icon} /> Inteligencia Artificial</h2>
        <p className={styles.subtitle}>Conecta tu propia API Key.</p>

        <div className={styles.formGroup} style={{marginBottom: '16px'}}>
          <label>Proveedor de IA</label>
          <select value={aiProvider} onChange={e => {setAiProvider(e.target.value); setAiModel(e.target.value === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash')}} className={styles.select}>
            <option value="openai">OpenAI (ChatGPT)</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        <div className={styles.formGroup} style={{marginBottom: '16px'}}>
          <label>API Key ({aiProvider})</label>
          <input type="password" placeholder={`Ingresa tu ${aiProvider === 'openai' ? 'sk-...' : 'AIzaSy...'} API Key`} value={apiKey} onChange={e => setApiKey(e.target.value)} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label>Modelo Preferido</label>
          <select value={aiModel} onChange={e => setAiModel(e.target.value)} className={styles.select}>
            {aiProvider === 'openai' ? (
              <>
                <option value="gpt-4o-mini">GPT-4o Mini (Recomendado)</option>
                <option value="gpt-4o">GPT-4o</option>
              </>
            ) : (
              <>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-3-flash">Gemini 3 Flash</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
