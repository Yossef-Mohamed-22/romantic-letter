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
    description: 'نغمات بيانو دافئة ورقيقة تأسر الروح وتناسب الأجواء الشاعرية',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
  },
  {
    id: 'violin-strings',
    name: 'شجن الكمان والوتريات (Violin & Strings)',
    description: 'مقطوعة كلاسيكية حالمة مليئة بالشوق والأحاسيس العميقة',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=love-story-piano-and-strings-10908.mp3',
  },
  {
    id: 'acoustic-guitar',
    name: 'جيتار الحب الدافئ (Acoustic Romance)',
    description: 'عزف جيتار صوتي ناعم يشع دفئاً وطمأنينة',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=romantic-acoustic-guitar-15893.mp3',
  },
  {
    id: 'vintage-musicbox',
    name: 'صندوق الموسيقى الساحر (Music Box Nostalgia)',
    description: 'ألحان كلاسيكية أثرية عذبة كحكايات العشاق القديمة',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3d64c06497.mp3?filename=music-box-melody-7049.mp3',
  },
  {
    id: 'tender-orchestra',
    name: 'أوركسترا المشاعر الصادقة (Tender Love)',
    description: 'تناغم وتريات ساحرة تعبر عن الحب الأبدي النبيل',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f79c38.mp3?filename=tender-love-123491.mp3',
  },
];
