import React, { useEffect, useState } from 'react';
import { User, WorkoutPlan, WorkoutExercise, WorkoutDay } from '../types';
import { db } from '../services/store';
import { LogOut, Clock, RotateCcw, X, Info, Dumbbell, Calendar, CheckCircle2, Activity, Play, Repeat } from 'lucide-react';

interface ClientPortalProps {
  user: User;
  onLogout: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ user, onLogout }) => {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  
  // State for completed exercises (List of IDs)
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  useEffect(() => {
    const loadPlan = async () => {
      if (user.assignedPlanId) {
        try {
          const p = await db.getPlanById(user.assignedPlanId);
          if (p) setPlan(p);
        } catch (err) {
          console.error(err);
        }
      }
    };

    void loadPlan();
  }, [user]);

  // Auto-select first day
  useEffect(() => {
      if (plan && plan.days && plan.days.length > 0 && !selectedDay) {
          setSelectedDay(plan.days[0]);
      }
  }, [plan]);

  const handleExerciseClick = (ex: WorkoutExercise) => {
    setSelectedExercise(ex);
  };

  const toggleExerciseStatus = (exId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCompletedExercises(prev => {
          if (prev.includes(exId)) {
              return prev.filter(id => id !== exId);
          } else {
              return [...prev, exId];
          }
      });
  };

  const isCompleted = (exId: string) => completedExercises.includes(exId);

  // Handle marking done from Modal
  const handleModalAction = () => {
      if (!selectedExercise) return;
      
      if (isCompleted(selectedExercise.id)) {
          // It was done, now undo (Repeat)
          toggleExerciseStatus(selectedExercise.id);
          // Keep modal open or close? Usually keep open to show it's undone.
      } else {
          // Mark as done
          toggleExerciseStatus(selectedExercise.id);
          setSelectedExercise(null); // Close modal on success
      }
  };

  if (!plan) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white">
              <Dumbbell size={64} className="text-zinc-800 mb-6" />
              <h1 className="text-2xl font-bold mb-2">Benvenuto, {user.fullName}</h1>
              <p className="text-zinc-500">Il tuo trainer sta preparando la tua scheda.</p>
              <button onClick={onLogout} className="mt-8 text-sm text-titan-500 font-bold uppercase tracking-wider">Esci</button>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-10">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex justify-between items-center">
         <div>
             <h1 className="text-xl font-black tracking-tighter text-white italic">TITAN<span className="text-titan-500">FIT</span></h1>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{plan.name}</p>
         </div>
         <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
            <LogOut size={18} />
         </button>
      </header>

      {/* DAY SELECTOR (Clean Tabs) */}
      <div className="bg-black border-b border-white/5 sticky top-[73px] z-30">
          <div className="flex overflow-x-auto px-4 py-3 gap-3 hide-scrollbar snap-x">
              {plan.days?.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-shrink-0 snap-start px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap border ${
                        selectedDay?.id === day.id 
                        ? 'bg-titan-600 border-titan-500 text-white shadow-[0_0_20px_rgba(13,148,136,0.3)]' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                      {day.name}
                  </button>
              ))}
          </div>
      </div>

      {/* EXERCISE LIST (Cards) */}
      <main className="p-4 max-w-xl mx-auto animate-[fadeIn_0.3s_ease-out]">
          {selectedDay ? (
              <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">{selectedDay.exercises.length} Esercizi</span>
                      </div>
                      <div className="text-xs font-mono text-titan-500">
                          {selectedDay.exercises.filter(e => isCompleted(e.id)).length} / {selectedDay.exercises.length} Completati
                      </div>
                  </div>

                  {selectedDay.exercises.map((ex, idx) => {
                      const done = isCompleted(ex.id);
                      return (
                        <div 
                            key={idx} 
                            onClick={() => handleExerciseClick(ex)}
                            className={`rounded-2xl p-1 pr-4 flex gap-4 items-center cursor-pointer group active:scale-[0.98] transition-all border ${
                                done 
                                ? 'bg-titan-900/20 border-titan-500/50' 
                                : 'bg-zinc-900 border-transparent hover:border-titan-500/30'
                            }`}
                        >
                            {/* Icon Placeholder (No GIF) */}
                            <div className={`w-24 h-24 rounded-xl flex items-center justify-center relative flex-shrink-0 transition-colors ${done ? 'bg-titan-500 text-black' : 'bg-zinc-800 text-zinc-600'}`}>
                                {done ? <CheckCircle2 size={32} /> : <Dumbbell size={32} />}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 py-2">
                                <h3 className={`font-bold text-base leading-tight mb-1 ${done ? 'text-titan-500 line-through' : 'text-white'}`}>{ex.name}</h3>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-3">{ex.muscleGroup}</p>
                                
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1.5 rounded text-xs font-mono font-bold border ${done ? 'bg-titan-500/20 text-titan-400 border-titan-500/30' : 'bg-zinc-800 text-titan-400 border-zinc-700'}`}>
                                        {ex.sets} x {ex.reps}
                                    </div>
                                    <div className="px-2 text-xs font-mono text-zinc-500 flex items-center gap-1">
                                        <Clock size={12} /> {ex.restSeconds}s
                                    </div>
                                </div>
                            </div>

                            {/* Checkbox Action */}
                            <button 
                                onClick={(e) => toggleExerciseStatus(ex.id, e)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                    done 
                                    ? 'bg-titan-500 border-titan-500 text-black' 
                                    : 'bg-transparent border-zinc-700 text-zinc-700 hover:border-titan-500 hover:text-titan-500'
                                }`}
                            >
                                <CheckCircle2 size={20} />
                            </button>
                        </div>
                      );
                  })}
                  
                  {selectedDay.exercises.length === 0 && (
                      <div className="text-center py-20 opacity-50">
                          <Dumbbell size={48} className="mx-auto mb-4 text-zinc-700" />
                          <p>Riposo o nessun esercizio.</p>
                      </div>
                  )}
              </div>
          ) : (
              <div className="text-center py-20 text-zinc-500">Seleziona un giorno</div>
          )}
      </main>

      {/* MODAL DETTAGLIO */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-[slideUp_0.2s_ease-out]">
            {/* Header / Close */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-900/50">
                <span className="text-xs font-bold bg-titan-500 text-black px-2 py-1 rounded uppercase">
                    {selectedExercise.muscleGroup}
                </span>
                <button 
                    onClick={() => setSelectedExercise(null)}
                    className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-black">
                {/* Visual Header (Icon based) */}
                <div className="h-48 bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center border-b border-white/5">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isCompleted(selectedExercise.id) ? 'bg-titan-500/20 text-titan-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        {isCompleted(selectedExercise.id) ? <CheckCircle2 size={48} /> : <Activity size={48} />}
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center px-4 leading-tight">{selectedExercise.name}</h2>
                </div>

                <div className="p-6">
                    {/* Grid Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800">
                            <div className="text-titan-500 mb-1"><RotateCcw size={20} className="mx-auto"/></div>
                            <div className="text-xl font-bold text-white">{selectedExercise.sets}</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Serie</div>
                        </div>
                        <div className="bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800">
                            <div className="text-titan-500 mb-1"><Dumbbell size={20} className="mx-auto"/></div>
                            <div className="text-xl font-bold text-white">{selectedExercise.reps}</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Reps</div>
                        </div>
                        <div className="bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800">
                            <div className="text-titan-500 mb-1"><Clock size={20} className="mx-auto"/></div>
                            <div className="text-xl font-bold text-white">{selectedExercise.restSeconds}s</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Recupero</div>
                        </div>
                    </div>

                    {/* Note */}
                    {selectedExercise.customNotes && (
                        <div className="mb-8 p-4 bg-yellow-900/10 border border-yellow-600/20 rounded-xl flex gap-3">
                            <Info className="text-yellow-600 shrink-0" size={20} />
                            <div>
                                <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Nota Trainer</p>
                                <p className="text-sm text-yellow-100/80">{selectedExercise.customNotes}</p>
                            </div>
                        </div>
                    )}

                    {/* Execution & Tips */}
                    <div className="space-y-6 pb-24">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                            <h3 className="text-sm font-bold text-titan-500 uppercase mb-2 flex items-center gap-2">
                                <Play size={14} className="fill-titan-500"/> Esecuzione
                            </h3>
                            <p className="text-zinc-300 text-sm leading-relaxed">{selectedExercise.description}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase mb-3 pl-1">Consigli Tecnici</h3>
                            <div className="space-y-2">
                                {selectedExercise.tips.map((tip, i) => (
                                    <div key={i} className="flex gap-3 items-start text-sm text-zinc-400 bg-zinc-900/30 p-3 rounded-lg border border-white/5">
                                        <CheckCircle2 size={16} className="text-titan-600 shrink-0 mt-0.5" />
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Fixed Bottom Button */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-black border-t border-white/10">
                 <button 
                    onClick={handleModalAction}
                    className={`w-full py-4 font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                        isCompleted(selectedExercise.id)
                        ? 'bg-zinc-800 text-yellow-500 hover:bg-zinc-700 border border-yellow-500/30'
                        : 'bg-titan-600 hover:bg-titan-500 text-white shadow-titan-500/20'
                    }`}
                >
                    {isCompleted(selectedExercise.id) ? (
                        <>
                            <Repeat size={20} /> RIPETI ESERCIZIO
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={20} /> SEGNA COME FATTO
                        </>
                    )}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
