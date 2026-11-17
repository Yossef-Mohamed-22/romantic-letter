export interface MusicPreset {
  id: string;
  name: string;
  description: string;
  url: string;
}

export const ROMANTIC_MUSIC_PRESETS: MusicPreset[] = [
  {
    id: 'piano-gentle',
    name: 'بيانو رومانسي هادئ (Romantic Piano)',
    description: 'نغمات بيانو دافئة ورقيقة تأسر الروح وتناسب الأجواء الشاعرية (مضمون 100%)',
    url: '/audio/romantic-piano.mp3',
  },
  {
    id: 'custom-uploaded',
    name: 'المقطع الصوتي المرفوع (Custom Upload)',
    description: 'الملف الصوتي الذي قمت برفعه من جهازك',
    url: '/audio/custom-music.mp3',
  },
];
