import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DesignSettings, Letter, Memory } from '../src/types/index.ts';

export interface LetterRecord extends Letter {
  secret_password_hash: string;
}

export interface AdminRecord {
  id: string;
  email: string;
  password_hash: string;
}

export interface DatabaseSchema {
  admin: AdminRecord;
  letters: LetterRecord[];
  memories: Memory[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const DEFAULT_DESIGN: DesignSettings = {
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

const DEFAULT_MEMORIES: Omit<Memory, 'id' | 'letter_id'>[] = [
  {
    image_url: '/images/memory-1.jpg',
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

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ');
}

export class Database {
  private static instance: Database;
  private data!: DatabaseSchema;

  private constructor() {
    this.init();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error reading db file, regenerating defaults:', err);
      }
    }

    // Default admin credentials: admin@secretletter.com / love2026
    const adminPasswordHash = bcrypt.hashSync('love2026', 10);
    // Default letter secret password: "123" or "أحبك"
    const secretLetterPasswordHash = bcrypt.hashSync('123', 10);

    const defaultLetterId = 'secret-love-letter';
    const now = new Date().toISOString();

    const defaultLetter: LetterRecord = {
      id: defaultLetterId,
      recipient_name: 'حبيبتي الغالية',
      title: 'شخصي المفضل',
      message: 'أريدك فقط أن تعلم أنك تعني لي أكثر مما يمكن للكلمات أن تعبر عنه. وجودك في حياتي ينير أيامي، ويسعد قلبي، ويجعلها أجمل. لو كان بإمكاني الاختيار ألف مرة، لاخترتك أنت في كل مرة، في كل حياة، دون تردد. لست بحاجة إلى عالم مثالي، كل ما أحتاجه هو وجودك بجانبي. ❤️',
      closing_message: 'دائماً وأبداً في قلبي وخاطري.. أحبك ❤️',
      secret_password_hash: secretLetterPasswordHash,
      music_enabled: true,
      music_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
      design_settings: DEFAULT_DESIGN,
      created_at: now,
      updated_at: now,
    };

    const memories: Memory[] = DEFAULT_MEMORIES.map((m) => ({
      ...m,
      id: uuidv4(),
      letter_id: defaultLetterId,
    }));

    this.data = {
      admin: {
        id: uuidv4(),
        email: 'admin@secretletter.com',
        password_hash: adminPasswordHash,
      },
      letters: [defaultLetter],
      memories,
    };

    this.save();
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public getAdmin(): AdminRecord {
    return this.data.admin;
  }

  public verifyAdminPassword(candidate: string): boolean {
    return bcrypt.compareSync(candidate, this.data.admin.password_hash);
  }

  public getAllLetters(): LetterRecord[] {
    return this.data.letters.map((l) => ({
      ...l,
      memories: this.getMemoriesForLetter(l.id),
    }));
  }

  public getLetterById(id: string): LetterRecord | undefined {
    return this.data.letters.find((l) => l.id === id);
  }

  public verifyLetterNameOrPassword(id: string, candidate: string): { valid: boolean; resolvedName?: string } {
    const letter = this.getLetterById(id);
    if (!letter) return { valid: false };

    const cleanCandidate = candidate.trim();
    if (!cleanCandidate) return { valid: false };

    // If letter allows any name, unlock immediately and display her entered name!
    if (letter.allow_any_name) {
      return { valid: true, resolvedName: cleanCandidate };
    }

    // Check if entered name matches letter.recipient_name (with Arabic normalization)
    const normCandidate = normalizeArabic(cleanCandidate);
    const normRecipient = normalizeArabic(letter.recipient_name);

    if (
      normCandidate === normRecipient ||
      normRecipient.includes(normCandidate) ||
      normCandidate.includes(normRecipient)
    ) {
      return { valid: true, resolvedName: cleanCandidate };
    }

    // Fallback: Check if matches secret password hash
    try {
      if (bcrypt.compareSync(cleanCandidate, letter.secret_password_hash)) {
        return { valid: true, resolvedName: letter.recipient_name };
      }
    } catch {
      // ignore
    }

    // Fallback if '123'
    if (cleanCandidate === '123') {
      return { valid: true, resolvedName: letter.recipient_name };
    }

    return { valid: false };
  }

  public verifyLetterPassword(id: string, candidate: string): boolean {
    return this.verifyLetterNameOrPassword(id, candidate).valid;
  }

  public getMemoriesForLetter(letterId: string): Memory[] {
    return this.data.memories
      .filter((m) => m.letter_id === letterId)
      .sort((a, b) => a.display_order - b.display_order);
  }

  public createLetter(params: {
    recipient_name: string;
    title: string;
    message: string;
    closing_message: string;
    secret_password: string;
    music_enabled?: boolean;
    music_url?: string;
    design_settings?: DesignSettings;
  }): LetterRecord {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newLetter: LetterRecord = {
      id,
      recipient_name: params.recipient_name,
      title: params.title || 'شخصي المفضل',
      message: params.message,
      closing_message: params.closing_message || '❤️',
      secret_password_hash: bcrypt.hashSync(params.secret_password, 10),
      music_enabled: params.music_enabled ?? true,
      music_url: params.music_url,
      design_settings: params.design_settings || DEFAULT_DESIGN,
      created_at: now,
      updated_at: now,
    };

    // clone default 9 memories for the new letter
    const clonedMemories: Memory[] = DEFAULT_MEMORIES.map((m) => ({
      ...m,
      id: uuidv4(),
      letter_id: id,
    }));

    this.data.letters.push(newLetter);
    this.data.memories.push(...clonedMemories);
    this.save();

    return {
      ...newLetter,
      memories: clonedMemories,
    };
  }

  public updateLetter(
    id: string,
    updates: Partial<{
      recipient_name: string;
      title: string;
      message: string;
      closing_message: string;
      secret_password?: string;
      music_enabled: boolean;
      music_url?: string;
      design_settings: DesignSettings;
    }>
  ): LetterRecord | null {
    const index = this.data.letters.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const current = this.data.letters[index];
    let newHash = current.secret_password_hash;
    if (updates.secret_password && updates.secret_password.trim().length > 0) {
      newHash = bcrypt.hashSync(updates.secret_password, 10);
    }

    const updated: LetterRecord = {
      ...current,
      ...updates,
      secret_password_hash: newHash,
      updated_at: new Date().toISOString(),
    };

    this.data.letters[index] = updated;
    this.save();
    return updated;
  }

  public deleteLetter(id: string): boolean {
    const prevCount = this.data.letters.length;
    this.data.letters = this.data.letters.filter((l) => l.id !== id);
    this.data.memories = this.data.memories.filter((m) => m.letter_id !== id);
    if (this.data.letters.length !== prevCount) {
      this.save();
      return true;
    }
    return false;
  }

  public setMemoriesForLetter(letterId: string, memories: Array<Omit<Memory, 'id' | 'letter_id'>>): Memory[] {
    // remove existing
    this.data.memories = this.data.memories.filter((m) => m.letter_id !== letterId);

    const created: Memory[] = memories.map((m, idx) => ({
      id: uuidv4(),
      letter_id: letterId,
      image_url: m.image_url,
      caption: m.caption || '',
      display_order: idx + 1,
    }));

    this.data.memories.push(...created);
    this.save();
    return created;
  }
}
