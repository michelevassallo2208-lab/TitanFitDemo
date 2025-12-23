import React, { useState, useEffect } from 'react';
import { User, WorkoutPlan, Role, WorkoutExercise, WorkoutDay, Exercise } from '../types';
import { db } from '../services/store';
import { Users, Dumbbell, Plus, Trash2, Save, LogOut, CheckCircle, Edit2, Key, UserCog, ListPlus, X, Search, History, ChevronRight, ChevronDown, Clock, Activity } from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'plans'>('users');
  
  // Modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState<User | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false); // Mobile exercise picker
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false); // Create custom ex

  // Plan Builder State
  const [planName, setPlanName] = useState('');
  const [targetUserForPlan, setTargetUserForPlan] = useState<User | null>(null);
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [exerciseSearch, setExerciseSearch] = useState('');

  // User Management State
  const [newUser, setNewUser] = useState<Partial<User>>({ role: Role.USER });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Custom Exercise Creator State
  const [newCustomEx, setNewCustomEx] = useState<Partial<Exercise>>({
      tips: [''],
      videoUrl: '' // Empty by default now
  });

  useEffect(() => {
    void refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [fetchedUsers, fetchedPlans, fetchedExercises] = await Promise.all([
        db.getUsers(),
        db.getPlans(),
        db.getAllExercises(),
      ]);
      setUsers(fetchedUsers.filter(u => u.role === Role.USER));
      setPlans(fetchedPlans);
      setAllExercises(fetchedExercises);
    } catch (err) {
      console.error(err);
    }
  };

  // --- EXERCISE MANAGEMENT ---

  const handleAddExerciseToPlan = (exerciseId: string) => {
    const stdExercise = allExercises.find(e => e.id === exerciseId);
    if (!stdExercise) return;
    if (days.length === 0) return; 

    const newExercise: WorkoutExercise = {
      ...stdExercise,
      sets: 3,
      reps: '10',
      restSeconds: 60,
    };

    const newDays = [...days];
    newDays[activeDayIndex].exercises.push(newExercise);
    setDays(newDays);
    setShowAddExerciseModal(false); // Close mobile picker if open
  };

  const handleCreateCustomExercise = async () => {
      if(!newCustomEx.name || !newCustomEx.muscleGroup) return;
      const ex: Exercise = {
          id: `custom-${Date.now()}`,
          name: newCustomEx.name,
          muscleGroup: newCustomEx.muscleGroup,
          videoUrl: '', // No GIF
          description: newCustomEx.description || 'Esecuzione personalizzata',
          tips: newCustomEx.tips || [],
          isCustom: true
      };
      try {
        await db.saveCustomExercise(ex);
        await refreshData();
        setShowCreateExerciseModal(false);
        setNewCustomEx({ tips: [''] });
      } catch (err) {
        console.error(err);
      }
  }

  // --- PLAN MANAGEMENT ---

  const handleUpdateExerciseDetail = (dayIndex: number, exIndex: number, field: keyof WorkoutExercise, value: any) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exIndex] = { 
        ...newDays[dayIndex].exercises[exIndex], 
        [field]: value 
    };
    setDays(newDays);
  };

  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
      const newDays = [...days];
      newDays[dayIndex].exercises.splice(exIndex, 1);
      setDays(newDays);
  }

  const addNewDay = () => {
      const newDayNumber = days.length + 1;
      const newDay: WorkoutDay = {
          id: `day-${Date.now()}`,
          name: `Giorno ${newDayNumber}`,
          exercises: []
      };
      setDays([...days, newDay]);
      setActiveDayIndex(days.length);
  };

  const removeDay = (index: number) => {
      if (days.length <= 1) return;
      const newDays = [...days];
      newDays.splice(index, 1);
      setDays(newDays);
      setActiveDayIndex(prev => prev >= newDays.length ? newDays.length - 1 : prev);
  };

  const openPlanModal = async (user: User | null = null) => {
      setTargetUserForPlan(user);
      setExerciseSearch('');
      if (user) {
          setPlanName(`Scheda: ${user.fullName}`);
          if (user.assignedPlanId) {
              const existing = await db.getPlanById(user.assignedPlanId);
              if (existing) {
                  setPlanName(existing.name);
                  setDays(existing.days && existing.days.length > 0 ? existing.days : [{id: 'd1', name: 'Giorno 1', exercises: (existing as any).exercises || []}]);
              } else {
                  setDays([{id: 'd1', name: 'Giorno 1', exercises: []}]);
              }
          } else {
              setDays([{id: 'd1', name: 'Giorno 1', exercises: []}]);
          }
      } else {
          setPlanName('');
          setDays([{id: 'd1', name: 'Giorno 1', exercises: []}]);
      }
      setActiveDayIndex(0);
      setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
    const totalExercises = days.reduce((acc, d) => acc + d.exercises.length, 0);
    if (!planName || totalExercises === 0) return;
    
    // Create new plan object
    const plan: WorkoutPlan = {
      id: targetUserForPlan && targetUserForPlan.assignedPlanId ? targetUserForPlan.assignedPlanId : `plan-${Date.now()}`,
      name: planName,
      description: `Scheda con ${days.length} giorni di allenamento`,
      days: days,
      createdAt: new Date().toISOString(),
    };
    
    await db.savePlan(plan);

    if (targetUserForPlan) {
        let updatedUser = { ...targetUserForPlan };
        updatedUser.assignedPlanId = plan.id;
        await db.updateUser(updatedUser);
    }

    await refreshData();
    setShowPlanModal(false);
    setPlanName('');
    setDays([]);
    setTargetUserForPlan(null);
  };

  const handleArchiveCurrentPlan = async (user: User) => {
      if(!user.assignedPlanId) return;
      
      const currentPlan = await db.getPlanById(user.assignedPlanId);
      if(!currentPlan) return;

      const archived: any = {
          planId: currentPlan.id,
          planName: currentPlan.name,
          archivedAt: new Date().toISOString()
      };

      const history = user.planHistory ? [...user.planHistory, archived] : [archived];
      const updatedUser = { 
          ...user, 
          assignedPlanId: undefined, // Clear active
          planHistory: history 
      };
      
      await db.updateUser(updatedUser);
      await refreshData();
  }

  // --- USER MGMT ---

  const handleSaveUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.fullName) return;
    const user: User = {
      id: `user-${Date.now()}`,
      username: newUser.username,
      password: newUser.password,
      fullName: newUser.fullName,
      role: Role.USER,
      assignedPlanId: newUser.assignedPlanId,
      goals: newUser.goals
    };
    try {
      await db.saveUser(user);
      await refreshData();
      setShowUserModal(false);
      setNewUser({ role: Role.USER });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
      if (!editingUser) return;
      try {
        await db.updateUser(editingUser);
        await refreshData();
        setShowEditUserModal(false);
        setEditingUser(null);
      } catch (err) {
        console.error(err);
      }
  }

  const handleDeleteUser = async (id: string) => {
      if(confirm('Eliminare cliente?')) {
          try {
            await db.deleteUser(id);
            await refreshData();
          } catch (err) {
            console.error(err);
          }
      }
  }

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Eliminare scheda?')) {
      try {
        await db.deletePlan(planId);
        await refreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filtered Exercises
  const filteredExercises = allExercises.filter(ex => 
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || 
      ex.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER / NAV */}
      <div className="md:hidden bg-dark-800 border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-20">
          <h1 className="font-bold text-xl">TITAN<span className="text-titan-500">ADMIN</span></h1>
          <button onClick={onLogout}><LogOut size={20} className="text-red-400"/></button>
      </div>

      {/* MOBILE TABS */}
      <div className="md:hidden flex border-b border-white/5 bg-dark-900 sticky top-[60px] z-10">
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'users' ? 'text-titan-500 border-b-2 border-titan-500' : 'text-gray-500'}`}>CLIENTI</button>
          <button onClick={() => setActiveTab('plans')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'plans' ? 'text-titan-500 border-b-2 border-titan-500' : 'text-gray-500'}`}>SCHEDE</button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-r border-white/5 flex-col">
        <div className="p-6 border-b border-white/5">
           <h1 className="text-2xl font-bold tracking-tight">TITAN<span className="text-titan-500">ADMIN</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users' ? 'bg-titan-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
            <Users size={20} /> Clienti
          </button>
          <button onClick={() => setActiveTab('plans')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'plans' ? 'bg-titan-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
            <Dumbbell size={20} /> Schede
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2">
            <LogOut size={18} /> Esci
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="hidden md:flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">{activeTab === 'users' ? 'Gestione Clienti' : 'Libreria Schede'}</h2>
          <button onClick={() => activeTab === 'users' ? setShowUserModal(true) : openPlanModal(null)} className="flex items-center gap-2 bg-white text-dark-900 px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg">
            <Plus size={20} /> {activeTab === 'users' ? 'Nuovo Cliente' : 'Crea Scheda'}
          </button>
        </header>

        {/* FAB for Mobile */}
        <button 
            onClick={() => activeTab === 'users' ? setShowUserModal(true) : openPlanModal(null)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-titan-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform"
        >
            <Plus size={28} />
        </button>

        {/* USERS LIST (Responsive Cards) */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 gap-4">
            {users.map(user => (
                <div key={user.id} className="bg-dark-800 rounded-xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-titan-900/50 flex items-center justify-center text-titan-400 font-bold text-lg border border-titan-500/20">
                            {user.fullName.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-white text-lg">{user.fullName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span>{user.username}</span>
                                {user.assignedPlanId ? (
                                    <span className="text-titan-500 flex items-center gap-1"><CheckCircle size={10}/> Scheda Attiva</span>
                                ) : <span className="text-yellow-600">Nessuna Scheda</span>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                         {/* History Button */}
                         <button onClick={() => setShowHistoryModal(user)} className="p-2 text-gray-400 hover:text-white bg-dark-900 rounded-lg border border-white/5">
                            <History size={18} />
                        </button>
                        
                        {/* Manage Plan */}
                        <button onClick={() => openPlanModal(user)} className="px-4 py-2 bg-titan-600/10 text-titan-400 hover:bg-titan-600 hover:text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border border-titan-500/20">
                            <Dumbbell size={16} /> Scheda
                        </button>
                        
                        {/* Edit User */}
                        <button onClick={() => { setEditingUser(user); setShowEditUserModal(true); }} className="p-2 text-blue-400 hover:text-white hover:bg-blue-900/30 rounded-lg transition-colors">
                            <UserCog size={18} />
                        </button>
                        
                        {/* Delete */}
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-400 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
             {users.length === 0 && <div className="text-center p-10 text-gray-500">Nessun cliente. Clicca + per aggiungere.</div>}
          </div>
        )}

        {/* PLANS LIST */}
        {activeTab === 'plans' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-dark-800 rounded-xl border border-white/5 p-5 relative group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            <button onClick={() => handleDeletePlan(plan.id)} className="text-gray-600 hover:text-red-400 p-1"><Trash2 size={16}/></button>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">{new Date(plan.createdAt).toLocaleDateString()}</p>
                        <div className="bg-dark-900 p-3 rounded-lg text-sm text-gray-400">
                             <span className="text-titan-500 font-bold">{plan.days.length}</span> Giorni di allenamento
                        </div>
                    </div>
                ))}
             </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Storico Schede</h3>
                      <button onClick={() => setShowHistoryModal(null)}><X size={24} className="text-gray-500"/></button>
                  </div>
                  
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {/* Active Plan */}
                      {showHistoryModal.assignedPlanId && (
                          <div className="bg-titan-900/20 border border-titan-500/30 p-4 rounded-xl">
                              <div className="text-xs text-titan-500 font-bold uppercase mb-1">Scheda Attiva</div>
                              <div className="font-bold text-white">{plans.find(plan => plan.id === showHistoryModal.assignedPlanId)?.name || 'Nome non disponibile'}</div>
                              <button 
                                onClick={() => handleArchiveCurrentPlan(showHistoryModal)}
                                className="mt-3 w-full py-2 bg-dark-900 text-xs text-gray-400 rounded border border-white/10 hover:text-white"
                              >
                                  Archivia Scheda Corrente
                              </button>
                          </div>
                      )}

                      {/* Archived Plans */}
                      {showHistoryModal.planHistory && showHistoryModal.planHistory.length > 0 ? (
                          showHistoryModal.planHistory.map((h, i) => (
                              <div key={i} className="bg-dark-900 p-4 rounded-xl border border-white/5 opacity-70">
                                  <div className="font-bold text-gray-300">{h.planName}</div>
                                  <div className="text-xs text-gray-500 mt-1">Archiviata il: {new Date(h.archivedAt).toLocaleDateString()}</div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center text-gray-500 text-sm py-4">Nessuna scheda in archivio.</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* PLAN BUILDER MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-dark-900 z-50 flex flex-col md:flex-row">
            {/* Header Mobile */}
            <div className="md:hidden bg-dark-800 p-4 flex justify-between items-center border-b border-white/10">
                <h3 className="font-bold text-white">Editor Scheda</h3>
                <button onClick={() => setShowPlanModal(false)} className="text-gray-400">Chiudi</button>
            </div>

            {/* LEFT SIDE: EXERCISES (Desktop) */}
            <div className="hidden md:flex w-1/4 border-r border-white/5 flex-col bg-dark-800/50">
                <div className="p-4 border-b border-white/5">
                    <h4 className="font-bold text-titan-500 text-sm uppercase mb-2">Libreria</h4>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cerca esercizio..." 
                            className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2 pl-9 text-sm text-white focus:border-titan-500 outline-none"
                            value={exerciseSearch}
                            onChange={(e) => setExerciseSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowCreateExerciseModal(true)}
                        className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded border border-white/5 flex items-center justify-center gap-1"
                    >
                        <Plus size={12}/> Crea Esercizio Manuale
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredExercises.map(ex => (
                        <button 
                            key={ex.id}
                            onClick={() => handleAddExerciseToPlan(ex.id)}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex items-center gap-3 group border border-transparent hover:border-white/5 transition-all"
                        >
                            {/* Icon instead of GIF */}
                             <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-gray-400">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200 group-hover:text-titan-400">{ex.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase">{ex.muscleGroup}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CENTER: BUILDER */}
            <div className="flex-1 flex flex-col bg-dark-900 overflow-hidden">
                {/* Top Bar */}
                <div className="p-4 border-b border-white/5 flex flex-col gap-4">
                    <input 
                        type="text" 
                        className="bg-transparent text-2xl font-bold text-white placeholder-gray-600 outline-none"
                        placeholder="Nome della Scheda (es. Ipertrofia)"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                    />
                    
                    {/* Days Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                        {days.map((day, index) => (
                            <button
                                key={day.id}
                                onClick={() => setActiveDayIndex(index)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeDayIndex === index ? 'bg-titan-600 text-white' : 'bg-dark-800 text-gray-500'}`}
                            >
                                {day.name}
                                {days.length > 1 && <X size={12} onClick={(e) => {e.stopPropagation(); removeDay(index)}} className="hover:text-red-300"/>}
                            </button>
                        ))}
                        <button onClick={addNewDay} className="px-3 py-2 bg-dark-800 rounded-lg text-gray-500 hover:text-white"><Plus size={16}/></button>
                    </div>
                </div>

                {/* Day Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {days[activeDayIndex]?.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-dark-800 rounded-xl p-4 border border-white/5 relative">
                             <button onClick={() => handleRemoveExercise(activeDayIndex, exIdx)} className="absolute top-3 right-3 text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                             <div className="font-bold text-white mb-2">{ex.name} <span className="text-xs font-normal text-gray-500 bg-black/20 px-2 py-0.5 rounded ml-2">{ex.muscleGroup}</span></div>
                             <div className="grid grid-cols-3 gap-2">
                                 <input type="number" placeholder="Sets" className="bg-dark-900 border border-gray-700 rounded p-2 text-white text-sm" value={ex.sets} onChange={(e) => handleUpdateExerciseDetail(activeDayIndex, exIdx, 'sets', e.target.value)} />
                                 <input type="text" placeholder="Reps" className="bg-dark-900 border border-gray-700 rounded p-2 text-white text-sm" value={ex.reps} onChange={(e) => handleUpdateExerciseDetail(activeDayIndex, exIdx, 'reps', e.target.value)} />
                                 <input type="number" placeholder="Rest (s)" className="bg-dark-900 border border-gray-700 rounded p-2 text-white text-sm" value={ex.restSeconds} onChange={(e) => handleUpdateExerciseDetail(activeDayIndex, exIdx, 'restSeconds', e.target.value)} />
                             </div>
                             <input type="text" placeholder="Note / Consigli aggiuntivi..." className="w-full mt-2 bg-transparent border-b border-gray-700 text-yellow-500 text-sm py-1 outline-none focus:border-yellow-500" value={ex.customNotes || ''} onChange={(e) => handleUpdateExerciseDetail(activeDayIndex, exIdx, 'customNotes', e.target.value)} />
                        </div>
                    ))}
                    
                    {/* Add Exercise Button (Mobile & Desktop inside content area) */}
                    <button 
                        onClick={() => setShowAddExerciseModal(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-titan-500 hover:text-titan-500 font-bold flex flex-col items-center justify-center gap-2"
                    >
                        <Plus size={24}/> Aggiungi Esercizio
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 bg-dark-800 flex justify-end gap-3">
                    <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-gray-400 hidden md:block">Annulla</button>
                    <button onClick={handleSavePlan} className="flex-1 md:flex-none px-8 py-3 bg-titan-600 text-white font-bold rounded-xl shadow-lg hover:bg-titan-500">
                        SALVA SCHEDA
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MOBILE EXERCISE PICKER MODAL */}
      {showAddExerciseModal && (
          <div className="fixed inset-0 bg-dark-900 z-[60] flex flex-col animate-[slideUp_0.2s_ease-out]">
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <button onClick={() => setShowAddExerciseModal(false)}><ArrowLeft className="text-white"/></button>
                  <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Cerca..." 
                        className="w-full bg-dark-800 border-none rounded-lg py-2 pl-10 text-white focus:ring-1 focus:ring-titan-500"
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                        autoFocus
                      />
                  </div>
              </div>
              <div className="p-2 border-b border-white/5">
                   <button 
                        onClick={() => setShowCreateExerciseModal(true)}
                        className="w-full py-3 bg-titan-500/10 text-titan-400 font-bold rounded-lg border border-titan-500/20 flex items-center justify-center gap-2"
                    >
                        <Plus size={18}/> Crea Esercizio Personalizzato
                    </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                  {filteredExercises.map(ex => (
                      <button 
                        key={ex.id}
                        onClick={() => handleAddExerciseToPlan(ex.id)}
                        className="w-full flex items-center gap-4 p-3 border-b border-white/5 active:bg-white/5 transition-colors text-left"
                      >
                           {/* Icon instead of GIF */}
                           <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                                <Activity size={24} />
                            </div>
                          <div>
                              <div className="font-bold text-white">{ex.name}</div>
                              <div className="text-xs text-gray-500 uppercase">{ex.muscleGroup} {ex.isCustom && '(Custom)'}</div>
                          </div>
                          <Plus size={20} className="ml-auto text-titan-500"/>
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* CREATE CUSTOM EXERCISE MODAL */}
      {showCreateExerciseModal && (
          <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4">
              <div className="bg-dark-800 w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Nuovo Esercizio Manuale</h3>
                  <div className="space-y-3">
                      <input type="text" placeholder="Nome Esercizio" className="w-full bg-dark-900 border border-gray-700 rounded p-3 text-white" value={newCustomEx.name || ''} onChange={e => setNewCustomEx({...newCustomEx, name: e.target.value})} />
                      <input type="text" placeholder="Gruppo Muscolare (es. Dorsali)" className="w-full bg-dark-900 border border-gray-700 rounded p-3 text-white" value={newCustomEx.muscleGroup || ''} onChange={e => setNewCustomEx({...newCustomEx, muscleGroup: e.target.value})} />
                      <textarea placeholder="Descrizione / Consigli..." className="w-full bg-dark-900 border border-gray-700 rounded p-3 text-white h-24" value={newCustomEx.description || ''} onChange={e => setNewCustomEx({...newCustomEx, description: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setShowCreateExerciseModal(false)} className="px-4 py-2 text-gray-400">Annulla</button>
                      <button onClick={handleCreateCustomExercise} className="px-6 py-2 bg-titan-600 text-white font-bold rounded-lg">Crea Esercizio</button>
                  </div>
              </div>
          </div>
      )}

      {/* EDIT USER MODAL */}
      {(showUserModal || (showEditUserModal && editingUser)) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">{showEditUserModal ? 'Modifica Cliente' : 'Nuovo Cliente'}</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Nome" className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-white outline-none" value={showEditUserModal ? editingUser?.fullName : newUser.fullName} onChange={(e) => showEditUserModal ? setEditingUser({...editingUser!, fullName: e.target.value}) : setNewUser({...newUser, fullName: e.target.value})}/>
                    <input type="text" placeholder="Username" className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-white outline-none" value={showEditUserModal ? editingUser?.username : newUser.username} onChange={(e) => showEditUserModal ? setEditingUser({...editingUser!, username: e.target.value}) : setNewUser({...newUser, username: e.target.value})}/>
                    <input type="text" placeholder="Password" className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-white outline-none" value={showEditUserModal ? editingUser?.password : newUser.password} onChange={(e) => showEditUserModal ? setEditingUser({...editingUser!, password: e.target.value}) : setNewUser({...newUser, password: e.target.value})}/>
                    <input type="text" placeholder="Obiettivo" className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-white outline-none" value={showEditUserModal ? editingUser?.goals : newUser.goals} onChange={(e) => showEditUserModal ? setEditingUser({...editingUser!, goals: e.target.value}) : setNewUser({...newUser, goals: e.target.value})}/>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => {setShowUserModal(false); setShowEditUserModal(false)}} className="px-4 py-2 text-gray-300">Annulla</button>
                    <button onClick={showEditUserModal ? handleUpdateUser : handleSaveUser} className="px-6 py-2 bg-titan-600 text-white font-bold rounded-lg">Salva</button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

// Helper Icon
const ArrowLeft = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
