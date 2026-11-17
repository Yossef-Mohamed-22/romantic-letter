export interface DesignSettings {
  backgroundColor: string; // e.g. '#3B080F'
  envelopeColor: string; // e.g. '#590D19'
  letterPaperColor: string; // e.g. '#F2E3C3'
  textColor: string; // e.g. '#54232B'
  goldAccentColor: string; // e.g. '#D5B47A'
  fontFamily: 'Amiri' | 'Noto Naskh Arabic' | 'Aref Ruqaa' | 'Reem Kufi';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  textAlign: 'right' | 'center' | 'left';
  showParticles: boolean;
  showLaceBorder: boolean;
}

export interface Memory {
  id: string;
  letter_id: string;
  image_url: string;
  caption: string;
  display_order: number;
}

export interface Letter {
  id: string;
  recipient_name: string;
  title: string;
  message: string;
  closing_message: string;
  music_enabled: boolean;
  music_url?: string;
  allow_any_name?: boolean;
  design_settings: DesignSettings;
  created_at: string;
  updated_at: string;
  memories?: Memory[];
}

export interface LetterPublicMetadata {
  id: string;
  title: string;
  recipient_name_hint?: string;
  allow_any_name?: boolean;
  design_settings: DesignSettings;
  music_enabled: boolean;
  music_url?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
