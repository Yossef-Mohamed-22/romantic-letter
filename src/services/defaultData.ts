import { DesignSettings, Letter, Memory } from '../types/index.ts';

export const DEFAULT_DESIGN: DesignSettings = {
  backgroundColor: '#3B080F',
  envelopeColor: '#590D19',
  letterPaperColor: '#F2E3C3',
  textColor: '#54232B',
  goldAccentColor: '#D5B47A',
  fontFamily: 'Amiri',
  fontSize: 'lg',
  textAlign: 'center',
  showParticles: true,
  showLaceBorder: true,
};

export const DEFAULT_MEMORIES: Omit<Memory, 'id' | 'letter_id'>[] = [
  {
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop',
    caption: 'أول لقاء وأجمل صدفة جمعتنا.. حين ابتدأ العمر حقاً ❤️',
    display_order: 1,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop',
    caption: 'ضحكتك التي تنير أظلم لياليّ وتملأ روحي سكينة ✨',
    display_order: 2,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1000&auto=format&fit=crop',
    caption: 'أحاديثنا الطويلة تحت ضوء القمر التي لا أملّ منها أبداً 🌙',
    display_order: 3,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=1000&auto=format&fit=crop',
    caption: 'لحظات الهدوء معك، حيث يتوقف العالم ولا يبقى إلا أنتِ ☕',
    display_order: 4,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop',
    caption: 'في كل خطوة وكل درب، يدك بيدي هي أماني الوحيد 🤝',
    display_order: 5,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    caption: 'غروب الشمس وجمال عيونك حين تتأمل الأفق 🌅',
    display_order: 6,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop',
    caption: 'أنتِ الوردة الوحيدة التي لا تذبل في بستان أيامي 🌹',
    display_order: 7,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000&auto=format&fit=crop',
    caption: 'رسائلنا ونبضات قلوبنا الصادقة بين كل سطر وسطر 💌',
    display_order: 8,
  },
  {
    image_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop',
    caption: 'إلى الأبد.. ستبقين النجمة التي أهتدي بها في كل سماء 💫',
    display_order: 9,
  },
];

export const INITIAL_DEFAULT_LETTER: Letter = {
  id: 'secret-love-letter',
  recipient_name: 'سارة',
  title: 'شخصي المفضل',
  message: 'أريدك فقط أن تعلم أنك تعني لي أكثر مما يمكن للكلمات أن تعبر عنه. وجودك في حياتي ينير أيامي، ويسعد قلبي، ويجعلها أجمل. لو كان بإمكاني الاختيار ألف مرة، لاخترتك أنت في كل مرة، في كل حياة، دون تردد. لست بحاجة إلى عالم مثالي، كل ما أحتاجه هو وجودك بجانبي. ❤️',
  closing_message: 'دائماً وأبداً في قلبي وخاطري.. أحبك ❤️',
  allow_any_name: true,
  music_enabled: true,
  music_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
  design_settings: DEFAULT_DESIGN,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  memories: DEFAULT_MEMORIES.map((m, i) => ({
    ...m,
    id: `mem-${i + 1}`,
    letter_id: 'secret-love-letter',
  })),
};
