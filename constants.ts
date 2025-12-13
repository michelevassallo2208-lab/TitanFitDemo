import { Exercise, Role, User } from './types';

export const INITIAL_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'password', 
  fullName: 'Master Trainer',
  role: Role.ADMIN,
};

// STATIC EXERCISES (GIFs removed)
export const STANDARD_EXERCISES: Exercise[] = [
  // --- PETTORALI ---
  {
    id: 'ex-bench-press',
    name: 'Panca Piana Bilanciere',
    muscleGroup: 'Pettorali',
    videoUrl: '', 
    description: 'Sdraiati sulla panca, piedi a terra. Scendi col bilanciere al centro del petto e spingi verso l\'alto.',
    tips: ['Gomiti a 45°', 'Arco lombare naturale', 'Scapole chiuse dietro'],
  },
  {
    id: 'ex-dumbbell-press',
    name: 'Spinte Manubri Panca Piana',
    muscleGroup: 'Pettorali',
    videoUrl: '', 
    description: 'Spingi i manubri verso l\'alto convergendo leggermente al centro senza toccarli.',
    tips: ['Controllo in discesa', 'Petto in fuori', 'Piedi saldi a terra'],
  },
  {
    id: 'ex-incline-press',
    name: 'Panca Inclinata Manubri',
    muscleGroup: 'Pettorali Alti',
    videoUrl: '', 
    description: 'Panca a 30-45 gradi. Spingi i manubri verso l\'alto concentrandoti sulla parte alta del petto.',
    tips: ['Non staccare la testa', 'Gomiti sotto i polsi'],
  },
  {
    id: 'ex-chest-fly',
    name: 'Croci Manubri',
    muscleGroup: 'Pettorali',
    videoUrl: '', 
    description: 'Aperture con manubri. Allarga le braccia mantenendo i gomiti leggermente flessi.',
    tips: ['Immagina di abbracciare un albero', 'Stretch profondo', 'Non toccare i manubri in chiusura'],
  },

  // --- SCHIENA ---
  {
    id: 'ex-deadlift',
    name: 'Stacco da Terra (Deadlift)',
    muscleGroup: 'Schiena / Femorali',
    videoUrl: '', 
    description: 'Afferra il bilanciere a terra. Sollevalo estendendo gambe e schiena contemporaneamente.',
    tips: ['Schiena piatta', 'Bilanciere vicino alle tibie', 'Spingi coi talloni'],
  },
  {
    id: 'ex-pullup',
    name: 'Trazioni alla Sbarra',
    muscleGroup: 'Dorsali',
    videoUrl: '', 
    description: 'Appenditi alla sbarra e tirati su fino a superarla col mento.',
    tips: ['Non dondolare', 'Petto verso la sbarra', 'Gomiti bassi'],
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Machine',
    muscleGroup: 'Dorsali',
    videoUrl: '', 
    description: 'Tira la sbarra verso il petto alto inclinando leggermente la schiena indietro.',
    tips: ['Gomiti verso i fianchi', 'Non usare lo slancio', 'Contrai il dorso in basso'],
  },
  {
    id: 'ex-barbell-row',
    name: 'Rematore Bilanciere',
    muscleGroup: 'Dorsali / Spessore',
    videoUrl: '', 
    description: 'Busto flesso a 90°. Tira il bilanciere verso l\'ombelico.',
    tips: ['Schiena parallela al suolo', 'Non tirare di collo', 'Gomiti stretti'],
  },
  {
    id: 'ex-pulley',
    name: 'Pulley Basso',
    muscleGroup: 'Dorsali',
    videoUrl: '', 
    description: 'Seduto, tira la maniglia verso l\'addome mantenendo la schiena dritta.',
    tips: ['Petto in fuori', 'Allunga bene in fase eccentrica'],
  },

  // --- GAMBE ---
  {
    id: 'ex-squat',
    name: 'Squat Classico',
    muscleGroup: 'Gambe / Glutei',
    videoUrl: '', 
    description: 'Bilanciere sui trapezi. Scendi piegando le gambe come se ti sedessi.',
    tips: ['Talloni incollati a terra', 'Ginocchia verso l\'esterno', 'Sguardo avanti'],
  },
  {
    id: 'ex-leg-press',
    name: 'Leg Press 45°',
    muscleGroup: 'Quadricipiti',
    videoUrl: '', 
    description: 'Spingi la pedana allontanandola, non estendere completamente le ginocchia.',
    tips: ['Schiena incollata allo schienale', 'Piedi larghezza spalle', 'Non bloccare le ginocchia'],
  },
  {
    id: 'ex-lunges',
    name: 'Affondi Manubri',
    muscleGroup: 'Gambe / Glutei',
    videoUrl: '', 
    description: 'Fai un passo avanti e scendi finché il ginocchio posteriore sfiora terra.',
    tips: ['Busto dritto', 'Passo ampio per glutei, corto per quadricipiti'],
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension',
    muscleGroup: 'Quadricipiti',
    videoUrl: '', 
    description: 'Estendi le gambe fino alla completa contrazione del quadricipite.',
    tips: ['Tieni il bacino fermo', 'Contrai forte in alto per 1 secondo'],
  },
  {
    id: 'ex-leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'Femorali',
    videoUrl: '', 
    description: 'Sdraiato o seduto, fletti le gambe portando i talloni verso i glutei.',
    tips: ['Non inarcare la schiena', 'Movimento lento in discesa'],
  },

  // --- SPALLE ---
  {
    id: 'ex-overhead-press',
    name: 'Military Press',
    muscleGroup: 'Spalle',
    videoUrl: '', 
    description: 'In piedi, spingi il bilanciere dal petto fin sopra la testa.',
    tips: ['Addome contratto', 'Non inarcare la schiena', 'Testa avanti in chiusura'],
  },
  {
    id: 'ex-lateral-raises',
    name: 'Alzate Laterali',
    muscleGroup: 'Spalle (Deltoidi)',
    videoUrl: '', 
    description: 'Solleva le braccia lateralmente fino all\'altezza delle spalle.',
    tips: ['Mignolo verso l\'alto', 'Non usare lo slancio', 'Braccia semi-tese'],
  },

  // --- BRACCIA ---
  {
    id: 'ex-bicep-curl',
    name: 'Curl Manubri',
    muscleGroup: 'Bicipiti',
    videoUrl: '', 
    description: 'Fletti le braccia portando i manubri alle spalle, ruotando il polso.',
    tips: ['Gomiti fermi ai fianchi', 'Movimento controllato'],
  },
   {
    id: 'ex-tricep-pushdown',
    name: 'Pushdown Cavi (Rope)',
    muscleGroup: 'Tricipiti',
    videoUrl: '', 
    description: 'Spingi verso il basso estendendo completamente il braccio.',
    tips: ['Gomiti incollati al busto', 'Apri la corda in basso'],
  },
  
  // --- ABS & CARDIO ---
  {
    id: 'ex-crunch',
    name: 'Crunch a Terra',
    muscleGroup: 'Addominali',
    videoUrl: '', 
    description: 'Solleva le spalle da terra contraendo l\'addome.',
    tips: ['Non tirare il collo', 'Espirare mentre sali', 'Zona lombare a terra'],
  },
  {
    id: 'ex-plank',
    name: 'Plank',
    muscleGroup: 'Addominali / Core',
    videoUrl: '', 
    description: 'Mantieni la posizione sui gomiti col corpo in linea retta.',
    tips: ['Glutei stretti', 'Non cedere col bacino', 'Respira regolarmente'],
  }
];