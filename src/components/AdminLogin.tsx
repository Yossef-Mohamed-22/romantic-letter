import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Heart, ArrowRight, KeyRound } from 'lucide-react';
import { api } from '../services/api.ts';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@secretletter.com');
  const [password, setPassword] = useState('love2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.login(email.trim(), password.trim());
      onLoginSuccess(data.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-md rounded-2xl bg-[#3B080F] border border-[#D5B47A]/40 p-6 sm:p-8 shadow-2xl text-[#F2E3C3] font-amiri"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#590D19] border border-[#D5B47A]/60 flex items-center justify-center mb-3 shadow-md">
            <Lock className="w-6 h-6 text-[#D5B47A]" />
          </div>
          <h2 className="font-aref text-2xl font-bold text-[#F2E3C3]">
            تسجيل دخول صاحب الرسالة
          </h2>
          <p className="text-xs text-cream-200/70 mt-1">
            منطقة مخصصة لصانع الرسالة لتعديل النصوص وإضافة الصور
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/80 border border-red-500/40 text-rose-200 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-cream-200">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
              />
              <Mail className="w-4 h-4 text-[#D5B47A]/70 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-cream-200">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#230408] border border-[#D5B47A]/40 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#F2E3C3] focus:outline-none focus:ring-1 focus:ring-[#D5B47A]"
              />
              <KeyRound className="w-4 h-4 text-[#D5B47A]/70 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#230408]/60 border border-[#D5B47A]/20 text-[11px] text-[#D5B47A]/80 leading-relaxed">
            💡 <strong>بيانات الدخول التجريبية الافتراضية:</strong>
            <br />
            البريد: <code className="text-[#F2E3C3]">admin@secretletter.com</code>
            <br />
            كلمة المرور: <code className="text-[#F2E3C3]">love2026</code>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 border border-white/20 text-xs text-cream-200 transition-colors"
            >
              إلغاء والعودة
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D5B47A] to-[#B8924B] text-[#3B080F] hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#3B080F] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>دخول إلى لوحة التحكم</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
