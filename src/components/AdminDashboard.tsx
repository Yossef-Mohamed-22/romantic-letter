import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Save,
  Share2,
  Copy,
  ExternalLink,
  Upload,
  Music,
  Image as ImageIcon,
  Palette,
  FileText,
  Key,
  Trash2,
  ArrowUp,
  ArrowDown,
  LogOut,
  Plus,
  Check,
  Eye,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { DesignSettings, Letter, Memory } from '../types/index.ts';

interface AdminDashboardProps {
  onLogout: () => void;
  onPreviewLetter: (letterId: string) => void;
  token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onPreviewLetter,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'letter' | 'memories' | 'music' | 'design' | 'publish'>('letter');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [currentLetterId, setCurrentLetterId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [allowAnyName, setAllowAnyName] = useState(false);
  const [message, setMessage] = useState('');
  const [closingMessage, setClosingMessage] = useState('');
  const [secretPassword, setSecretPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Memories State (9 photos)
  const [memories, setMemories] = useState<Omit<Memory, 'id' | 'letter_id'>[]>([]);

  // Music State
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicUrl, setMusicUrl] = useState('');
  const [isMusicPreviewPlaying, setIsMusicPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Design Settings
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
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
  });

  // Load letters from API
  const loadLetters = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLetters(token);
      setLetters(data);
      if (data.length > 0) {
        const selected = data[0];
        selectLetter(selected);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLetters();
  }, [token]);

  const selectLetter = (letter: Letter) => {
    setCurrentLetterId(letter.id);
    setTitle(letter.title);
    setRecipientName(letter.recipient_name);
    setAllowAnyName(Boolean(letter.allow_any_name));
    setMessage(letter.message);
    setClosingMessage(letter.closing_message);
    setSecretPassword(''); // blank unless updating
    setMusicEnabled(letter.music_enabled);
    setMusicUrl(letter.music_url || '');
    setDesignSettings(letter.design_settings);
    setMemories(
      (letter.memories || []).map((m) => ({
        image_url: m.image_url,
        caption: m.caption,
        display_order: m.display_order,
      }))
    );
  };

  const handleSave = async () => {
    if (!currentLetterId) return;
    setIsSaving(true);
    setErrorMsg('');
    try {
      // 1. Update letter details
      await api.updateLetter(token, currentLetterId, {
        title,
        recipient_name: recipientName,
        allow_any_name: allowAnyName,
        message,
        closing_message: closingMessage,
        secret_password: secretPassword ? secretPassword : undefined,
        music_enabled: musicEnabled,
        music_url: musicUrl,
        design_settings: designSettings,
      });

      // 2. Update memories
      await api.updateMemories(token, currentLetterId, memories);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadLetters();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewLetter = async () => {
    try {
      const newLetter = await api.createLetter(token, {
        recipient_name: 'شخصي المفضل',
        title: 'رسالة خاصة من القلب',
        message: 'أنتِ النبض الذي يحيي أيامي، والجمال الذي يزين عالمي.. ❤️',
        closing_message: 'أحبك دائماً وأبداً ❤️',
        secret_password: '123',
        design_settings: designSettings,
      });
      await loadLetters();
      selectLetter(newLetter);
      setActiveTab('letter');
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في إنشاء رسالة جديدة');
    }
  };

  const handleDeleteLetter = async () => {
    if (!currentLetterId) return;
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة نهائياً؟')) return;
    try {
      await api.deleteLetter(token, currentLetterId);
      await loadLetters();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في حذف الرسالة');
    }
  };

  // Memory Actions
  const handleMemoryUpload = async (index: number, file: File) => {
    try {
      const url = await api.uploadImage(token, file);
      const updated = [...memories];
      updated[index] = { ...updated[index], image_url: url };
      setMemories(updated);
    } catch (err: any) {
      alert(err.message || 'فشل رفع الصورة');
    }
  };

  const handleAddMemory = () => {
    if (memories.length >= 9) {
      alert('الحد الأقصى للذكريات هو 9 بطاقات كما هو محدد بالتصميم.');
      return;
    }
    setMemories([
      ...memories,
      {
        image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000',
        caption: 'ذكرى جديدة تنبض بالحب ❤️',
        display_order: memories.length + 1,
      },
    ]);
  };

  const handleRemoveMemory = (index: number) => {
    const updated = memories.filter((_, i) => i !== index);
    setMemories(updated);
  };

  const handleMoveMemory = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= memories.length) return;
    const updated = [...memories];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setMemories(updated);
  };

  // Music upload
  const handleMusicUpload = async (file: File) => {
    try {
      const url = await api.uploadMusic(token, file);
      setMusicUrl(url);
      setMusicEnabled(true);
    } catch (err: any) {
      alert(err.message || 'فشل رفع الملف الصوتي');
    }
  };

  const shareableUrl = `${window.location.origin}/?letter=${currentLetterId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#3B080F] text-[#F2E3C3]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#D5B47A] border-t-transparent rounded-full animate-spin" />
          <p className="font-amiri text-lg">جارِ فتح لوحة التحكم السرية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2A060B] text-[#F2E3C3] font-amiri pb-16">
      {/* Top Header */}
      <header className="bg-[#3B080F] border-b border-[#D5B47A]/30 sticky top-0 z-40 px-4 sm:px-8 py-3.5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#590D19] border border-[#D5B47A]/50 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-[#D5B47A] fill-[#D5B47A]" />
            </div>
            <div>
              <h1 className="font-aref text-xl sm:text-2xl font-bold text-[#F2E3C3]">
                لوحة تحكم الرسائل الرومانسية
              </h1>
              <p className="text-xs text-[#D5B47A]/80">إدارة الرسائل السرية والذكريات والموسيقى</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onPreviewLetter(currentLetterId)}
              className="px-3.5 py-1.5 rounded-full bg-[#590D19] hover:bg-[#781324] border border-[#D5B47A]/40 text-xs sm:text-sm font-amiri text-[#F2E3C3] flex items-center gap-1.5 transition-colors shadow"
            >
              <Eye className="w-4 h-4 text-[#D5B47A]" />
              <span className="hidden sm:inline">معاينة الرسالة</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-full bg-[#D5B47A] hover:bg-[#E6C68A] text-[#3B080F] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#3B080F] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ التعديلات</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-full bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-700/40 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Alerts */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>تم حفظ كافة بيانات الرسالة والذكريات بنجاح! ❤️</span>
          </motion.div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/80 border border-red-500/40 text-rose-200 text-sm flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Letter Selector Bar */}
        <div className="mb-6 p-4 rounded-xl bg-[#3B080F]/80 border border-[#D5B47A]/25 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#D5B47A]">الرسالة الحالية:</span>
            <select
              value={currentLetterId}
              onChange={(e) => {
                const found = letters.find((l) => l.id === e.target.value);
                if (found) selectLetter(found);
              }}
              className="bg-[#230408] border border-[#D5B47A]/40 text-[#F2E3C3] px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
            >
              {letters.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.recipient_name ? `إلى: ${l.recipient_name} (${l.title})` : l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewLetter}
              className="px-3 py-1.5 rounded-lg bg-[#590D19] hover:bg-[#751322] border border-[#D5B47A]/40 text-xs sm:text-sm text-[#F2E3C3] flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#D5B47A]" />
              <span>رسالة جديدة</span>
            </button>

            {letters.length > 1 && (
              <button
                onClick={handleDeleteLetter}
                className="px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs sm:text-sm transition-colors"
                title="حذف الرسالة الحالية"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-[#D5B47A]/20 pb-3 mb-6 no-scrollbar">
          {[
            { id: 'letter', label: 'محتوى الرسالة', icon: FileText },
            { id: 'memories', label: 'الذكريات (9 صور)', icon: ImageIcon },
            { id: 'music', label: 'الموسيقى الرومانسية', icon: Music },
            { id: 'design', label: 'المظهر والألوان', icon: Palette },
            { id: 'publish', label: 'النشر والمشاركة ❤️', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-aref text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-[#590D19] text-[#F2E3C3] border border-[#D5B47A] shadow-md'
                    : 'bg-[#3B080F]/50 text-[#F2E3C3]/70 hover:bg-[#3B080F] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D5B47A]' : 'text-cream-200/50'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: LETTER CONTENT */}
        {activeTab === 'letter' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5 bg-[#3B080F]/70 p-6 rounded-2xl border border-[#D5B47A]/25 shadow-lg">
              <h2 className="font-aref text-xl font-bold text-[#D5B47A] flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>بيانات الرسالة السرية</span>
              </h2>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-cream-200">
                  عنوان الرسالة (الترويسة)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شخصي المفضل"
                  className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-cream-200 flex items-center justify-between">
                  <span>اسم المحبوبة (الاسم الذي ستدخله لفتح المظروف)</span>
                  <span className="text-xs text-[#D5B47A]">المفتاح لفتح الرسالة ❤️</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="مثال: سارة، مريم، نور..."
                  className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
                />
                <p className="text-xs text-cream-200/70 mt-1">
                  عندما تكتب هذا الاسم سيفتح المظروف فوراً ويظهر اسمها في بطاقة الرسالة (مع تسامح تلقائي لجميع أشكال الهمزات والتاء المربوطة سارة/ساره).
                </p>

                {/* Allow any name toggle */}
                <label className="mt-3 flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#230408]/60 border border-[#D5B47A]/20">
                  <input
                    type="checkbox"
                    checked={allowAnyName}
                    onChange={(e) => setAllowAnyName(e.target.checked)}
                    className="rounded text-[#D5B47A] focus:ring-0"
                  />
                  <span className="text-xs text-[#F2E3C3] font-semibold">
                    السماح بأي اسم (أي اسم ستكتبه سيفتح المظروف ويظهر اسمها في الرسالة مباشرة)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-cream-200">
                  نص الرسالة الرومانسية
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب أعمق مشاعرك وكلماتك الصادقة هنا..."
                  className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-cream-200">
                  العبارة الختامية
                </label>
                <input
                  type="text"
                  value={closingMessage}
                  onChange={(e) => setClosingMessage(e.target.value)}
                  placeholder="مثال: دائماً وأبداً في قلبي ❤️"
                  className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
                />
              </div>

              {/* Optional Backup Password Setting */}
              <div className="pt-3 border-t border-[#D5B47A]/20">
                <label className="block text-sm font-semibold mb-1.5 text-[#D5B47A] flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>كلمة سر احتياطية إضافية (اختياري)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={secretPassword}
                    onChange={(e) => setSecretPassword(e.target.value)}
                    placeholder="اختياري (يمكن أيضاً استخدام 123 للطوارئ)"
                    className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 pl-16 text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#D5B47A]/80 hover:text-[#D5B47A]"
                  >
                    {showPassword ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Paper Preview */}
            <div className="bg-[#3B080F]/70 p-6 rounded-2xl border border-[#D5B47A]/25 shadow-lg flex flex-col">
              <h2 className="font-aref text-xl font-bold text-[#D5B47A] mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>معاينة حية لشكل الرسالة</span>
              </h2>

              <div
                className="flex-1 rounded-xl p-6 relative border border-[#D5B47A]/40 shadow-inner flex flex-col items-center justify-center text-center overflow-hidden"
                style={{
                  backgroundColor: designSettings.letterPaperColor,
                  color: designSettings.textColor,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#590D19]/10 flex items-center justify-center mb-3">
                  <Heart className="w-4 h-4 text-[#941B2D] fill-[#941B2D]" />
                </div>
                <h3 className="font-aref text-2xl font-bold mb-1">{title || 'شخصي المفضل'}</h3>
                {recipientName && (
                  <div className="font-aref text-lg font-bold text-[#941B2D] mb-3">
                    إلى {recipientName}
                  </div>
                )}
                <div className="w-20 h-0.5 bg-[#D5B47A]/50 my-2" />
                <p className="font-amiri text-base leading-relaxed whitespace-pre-line my-3 max-h-56 overflow-y-auto px-2">
                  {message || 'أدخل نص الرسالة لتظهر هنا بالمعاينة...'}
                </p>
                {closingMessage && (
                  <div className="font-aref text-base font-semibold text-[#7E1727] mt-3">
                    {closingMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMORIES (9 PHOTOS) */}
        {activeTab === 'memories' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#3B080F]/70 p-4 rounded-xl border border-[#D5B47A]/25">
              <div>
                <h2 className="font-aref text-xl font-bold text-[#D5B47A] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>معرض الذكريات الـ 9 (البولارويد العائم)</span>
                </h2>
                <p className="text-xs text-cream-200/70 mt-1">
                  قم برفع 9 صور تخلد أجمل لحظاتكما المشتركة مع كتابة تعليق رومانسي لكل ذكرى.
                </p>
              </div>

              {memories.length < 9 && (
                <button
                  onClick={handleAddMemory}
                  className="px-3.5 py-1.5 rounded-lg bg-[#590D19] hover:bg-[#781324] border border-[#D5B47A]/40 text-xs sm:text-sm text-[#F2E3C3] flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#D5B47A]" />
                  <span>إضافة بطاقة ذكرى</span>
                </button>
              )}
            </div>

            {/* 9 Memory Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((mem, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-4 bg-[#3B080F]/80 border border-[#D5B47A]/30 shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-aref text-sm font-bold text-[#D5B47A]">
                      الذكرى #{index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveMemory(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-cream-200/70 hover:text-white disabled:opacity-30"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveMemory(index, 'down')}
                        disabled={index === memories.length - 1}
                        className="p-1 text-cream-200/70 hover:text-white disabled:opacity-30"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveMemory(index)}
                        className="p-1 text-rose-400 hover:text-rose-200 ml-1"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Preview & Upload */}
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/40 border border-[#D5B47A]/30 mb-3 group">
                    <img
                      src={mem.image_url}
                      alt={mem.caption}
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200">
                      <Upload className="w-6 h-6 text-[#D5B47A] mb-1" />
                      <span className="text-xs text-white">تغيير الصورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMemoryUpload(index, file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Image URL input */}
                  <div className="mb-2.5">
                    <input
                      type="text"
                      value={mem.image_url}
                      onChange={(e) => {
                        const updated = [...memories];
                        updated[index] = { ...updated[index], image_url: e.target.value };
                        setMemories(updated);
                      }}
                      placeholder="رابط الصورة (URL)"
                      className="w-full bg-[#230408] border border-[#D5B47A]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#F2E3C3] focus:outline-none"
                    />
                  </div>

                  {/* Caption input */}
                  <div>
                    <input
                      type="text"
                      value={mem.caption}
                      onChange={(e) => {
                        const updated = [...memories];
                        updated[index] = { ...updated[index], caption: e.target.value };
                        setMemories(updated);
                      }}
                      placeholder="التعليق الرومانسي على الصورة..."
                      className="w-full bg-[#230408] border border-[#D5B47A]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#F2E3C3] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MUSIC SETTINGS */}
        {activeTab === 'music' && (
          <div className="max-w-2xl mx-auto space-y-6 bg-[#3B080F]/70 p-6 rounded-2xl border border-[#D5B47A]/25 shadow-lg">
            <h2 className="font-aref text-xl font-bold text-[#D5B47A] flex items-center gap-2">
              <Music className="w-5 h-5" />
              <span>إعدادات الموسيقى الخلفية</span>
            </h2>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#230408] border border-[#D5B47A]/30">
              <div>
                <span className="font-semibold text-sm">تفعيل الموسيقى التلقائية</span>
                <p className="text-xs text-cream-200/60 mt-0.5">
                  تبدأ الموسيقى بالعمل بنعومة بمجرد فتح المظروف وقراءة الرسالة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  musicEnabled ? 'bg-[#D5B47A]' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#3B080F] transition-transform ${
                    musicEnabled ? '-translate-x-6' : '-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Music URL */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-cream-200">
                رابط المقطع الصوتي (MP3)
              </label>
              <input
                type="text"
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                placeholder="https://example.com/romantic-melody.mp3"
                className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
              />
            </div>

            {/* MP3 File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-cream-200">
                أو ارفع ملف صوتي من جهازك
              </label>
              <label className="border-2 border-dashed border-[#D5B47A]/40 hover:border-[#D5B47A] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#230408]/60 transition-colors">
                <Upload className="w-8 h-8 text-[#D5B47A] mb-2" />
                <span className="text-sm font-semibold text-cream-200">انقر هنا لاختيار ملف MP3</span>
                <span className="text-xs text-cream-200/50 mt-1">يدعم ملفات MP3, WAV حتى 25 ميجابايت</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMusicUpload(file);
                  }}
                />
              </label>
            </div>

            {/* Audio Preview Player */}
            {musicUrl && (
              <div className="p-4 rounded-xl bg-[#230408] border border-[#D5B47A]/30 flex items-center justify-between">
                <span className="text-xs text-cream-200/80 truncate max-w-[200px]">
                  {musicUrl}
                </span>
                <audio ref={previewAudioRef} src={musicUrl} />
                <button
                  type="button"
                  onClick={() => {
                    if (!previewAudioRef.current) return;
                    if (isMusicPreviewPlaying) {
                      previewAudioRef.current.pause();
                      setIsMusicPreviewPlaying(false);
                    } else {
                      previewAudioRef.current.play();
                      setIsMusicPreviewPlaying(true);
                    }
                  }}
                  className="px-3 py-1 rounded-full bg-[#590D19] border border-[#D5B47A]/40 text-xs text-[#D5B47A]"
                >
                  {isMusicPreviewPlaying ? 'إيقاف المعاينة' : 'تشغيل المقطع'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DESIGN CUSTOMIZATION */}
        {activeTab === 'design' && (
          <div className="max-w-3xl mx-auto space-y-6 bg-[#3B080F]/70 p-6 rounded-2xl border border-[#D5B47A]/25 shadow-lg">
            <h2 className="font-aref text-xl font-bold text-[#D5B47A] flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <span>تخصيص المظهر والألوان الفيكتورية</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-cream-200">
                  لون الخلفية الرئيسية
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designSettings.backgroundColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, backgroundColor: e.target.value })
                    }
                    className="w-10 h-10 rounded border border-[#D5B47A]/40 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={designSettings.backgroundColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, backgroundColor: e.target.value })
                    }
                    className="bg-[#230408] border border-[#D5B47A]/40 rounded-lg px-2.5 py-1 text-xs text-[#F2E3C3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-cream-200">
                  لون المظروف (Burgundy)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designSettings.envelopeColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, envelopeColor: e.target.value })
                    }
                    className="w-10 h-10 rounded border border-[#D5B47A]/40 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={designSettings.envelopeColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, envelopeColor: e.target.value })
                    }
                    className="bg-[#230408] border border-[#D5B47A]/40 rounded-lg px-2.5 py-1 text-xs text-[#F2E3C3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-cream-200">
                  لون ورقة الرسالة (Cream)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designSettings.letterPaperColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, letterPaperColor: e.target.value })
                    }
                    className="w-10 h-10 rounded border border-[#D5B47A]/40 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={designSettings.letterPaperColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, letterPaperColor: e.target.value })
                    }
                    className="bg-[#230408] border border-[#D5B47A]/40 rounded-lg px-2.5 py-1 text-xs text-[#F2E3C3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-cream-200">
                  لون الخط الرومانسي
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designSettings.textColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, textColor: e.target.value })
                    }
                    className="w-10 h-10 rounded border border-[#D5B47A]/40 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={designSettings.textColor}
                    onChange={(e) =>
                      setDesignSettings({ ...designSettings, textColor: e.target.value })
                    }
                    className="bg-[#230408] border border-[#D5B47A]/40 rounded-lg px-2.5 py-1 text-xs text-[#F2E3C3]"
                  />
                </div>
              </div>
            </div>

            {/* Typography Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#D5B47A]/20">
              <div>
                <label className="block text-xs font-semibold mb-1 text-cream-200">
                  نوع الخط العربي
                </label>
                <select
                  value={designSettings.fontFamily}
                  onChange={(e) =>
                    setDesignSettings({
                      ...designSettings,
                      fontFamily: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-3 py-2 text-xs text-[#F2E3C3]"
                >
                  <option value="Amiri">أميري (Amiri - الأصيل)</option>
                  <option value="Noto Naskh Arabic">نوتو نسخ (Noto Naskh)</option>
                  <option value="Aref Ruqaa">عارف رقعة (Aref Ruqaa)</option>
                  <option value="Reem Kufi">ريم كوفي (Reem Kufi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-cream-200">
                  حجم الخط
                </label>
                <select
                  value={designSettings.fontSize}
                  onChange={(e) =>
                    setDesignSettings({
                      ...designSettings,
                      fontSize: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-3 py-2 text-xs text-[#F2E3C3]"
                >
                  <option value="sm">صغير (Compact)</option>
                  <option value="base">متوسط (Regular)</option>
                  <option value="lg">كبير رومانسي (Large - افتراضي)</option>
                  <option value="xl">عريض بارز (Extra Large)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-cream-200">
                  محاذاة النص
                </label>
                <select
                  value={designSettings.textAlign}
                  onChange={(e) =>
                    setDesignSettings({
                      ...designSettings,
                      textAlign: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-3 py-2 text-xs text-[#F2E3C3]"
                >
                  <option value="center">توسيط (Center - موصى به)</option>
                  <option value="right">يمين (Right)</option>
                  <option value="left">يسار (Left)</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-[#D5B47A]/20">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={designSettings.showLaceBorder !== false}
                  onChange={(e) =>
                    setDesignSettings({ ...designSettings, showLaceBorder: e.target.checked })
                  }
                  className="rounded text-[#D5B47A] focus:ring-0"
                />
                <span className="text-xs text-cream-200 font-semibold">
                  تفعيل إطار الدانتيل الفيكتوري والزخارف الذهبية
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={designSettings.showParticles !== false}
                  onChange={(e) =>
                    setDesignSettings({ ...designSettings, showParticles: e.target.checked })
                  }
                  className="rounded text-[#D5B47A] focus:ring-0"
                />
                <span className="text-xs text-cream-200 font-semibold">
                  تفعيل جزيئات القلوب والنجوم الذهبية العائمة
                </span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: PUBLISHING AND SHARING */}
        {activeTab === 'publish' && (
          <div className="max-w-2xl mx-auto space-y-6 bg-[#3B080F]/70 p-6 sm:p-8 rounded-2xl border border-[#D5B47A]/30 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#590D19] border-2 border-[#D5B47A] flex items-center justify-center mx-auto shadow-lg">
              <Sparkles className="w-8 h-8 text-[#D5B47A] animate-pulse" />
            </div>

            <div>
              <h2 className="font-aref text-2xl sm:text-3xl font-bold text-[#D5B47A]">
                إنشاء ومشاركة رابط الرسالة السرية
              </h2>
              <p className="text-sm text-cream-200/80 mt-1 max-w-md mx-auto">
                عند إرسال هذا الرابط لشخصك المفضل، سيرى المظروف المغلق بالشمع الذهبي ولن يستطيع فتحه إلا بإدخال كلمتكما السرية!
              </p>
            </div>

            {/* Big Action Button */}
            <div className="py-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-aref text-xl font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-3 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #8A1525 0%, #590D19 50%, #3B080F 100%)',
                  color: '#F2E3C3',
                  border: '2px solid #D5B47A',
                }}
              >
                <Heart className="w-6 h-6 text-rose-300 fill-rose-300" />
                <span>إنشاء رابط الرسالة ❤️</span>
              </button>
            </div>

            {/* Shareable Link Box */}
            <div className="p-4 rounded-xl bg-[#230408] border border-[#D5B47A]/40 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full bg-transparent text-xs sm:text-sm text-[#D5B47A] font-mono select-all focus:outline-none text-center sm:text-left"
              />
              <button
                onClick={copyToClipboard}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#590D19] hover:bg-[#781324] border border-[#D5B47A]/50 text-xs text-[#F2E3C3] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#D5B47A]" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Link Button */}
            <div>
              <button
                onClick={() => onPreviewLetter(currentLetterId)}
                className="text-sm text-[#D5B47A] hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <span>معاينة الرابط كما يراه المستلم</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Security Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-[#230408]/70 border border-emerald-500/30 text-xs text-cream-200/90 text-right space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>حماية كاملة: الرابط للمستلم للقراءة والعرض فقط</span>
              </div>
              <p className="text-cream-200/70 leading-relaxed">
                • المستلم الذي يفتح هذا الرابط لن يرى أي أزرار تعديل أو لوحة تحكم إطلاقاً، ولا يمكنه تغيير الاسم أو الصور أو الرسالة.<br />
                • التعديل محمي ومحصور فقط بمن يمتلك حساب الأدمن وكلمة المرور الخاصة بك.<br />
                • للدخول إلى لوحة التحكم من أي جهاز جديد، أضف <code className="text-[#D5B47A] bg-[#590D19]/60 px-1 py-0.5 rounded font-mono">?admin=true</code> لنهاية الرابط.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
