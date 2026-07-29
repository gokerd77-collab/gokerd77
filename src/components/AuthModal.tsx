import React, { useState } from 'react';
import { Shield, Key, User, Check, X, Info, Sparkles, HelpCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  showToast,
  isMandatory = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = StorageService.getSettings();

    if (!password.trim()) {
      showToast('يرجى كتابة كلمة المرور للدخول', 'error');
      return;
    }

    if (isAdminMode) {
      const cleanUser = username.trim().toLowerCase();
      const isAdminUsername = cleanUser.includes('لؤي') || cleanUser.includes('loai') || cleanUser.includes('louay');
      
      if (!isAdminUsername) {
        showToast('حساب الأدمن خاص بالمستخدم (لؤي مكاوي). يرجى كتابة اسم المستخدم الصحيح.', 'error');
        return;
      }
    }

    const verification = StorageService.verifyPassword(password, settings, username);

    if (verification === 'admin') {
      const session: UserSession = {
        username: username.trim() || 'لؤي مكاوي',
        role: 'admin',
        isLoggedIn: true,
      };
      StorageService.saveSession(session);
      onLoginSuccess(session);
      showToast('أهلاً بك يا لؤي مكاوي! تم تسجيل الدخول بصلاحيات الأدمن بنجاح.', 'success');
      onClose();
    } else if (verification === 'member') {
      if (isAdminMode) {
        showToast('عفواً، لقطة الأدمن مخصصة للمسؤول (لؤي مكاوي).', 'error');
        return;
      }
      const session: UserSession = {
        username: username.trim() || 'عضو اللجنة',
        role: 'member',
        isLoggedIn: true,
      };
      StorageService.saveSession(session);
      onLoginSuccess(session);
      showToast('أهلاً بك في منصة اللجنة العلمية - دراية!', 'success');
      onClose();
    } else {
      showToast('كلمة المرور غير صحيحة', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative text-right text-slate-100 font-sans">
        
        {/* Close Button (Hidden when login is mandatory) */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Emblem Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 p-1 mx-auto mb-3 shadow-lg flex items-center justify-center text-slate-950 font-black text-2xl">
            دراية
          </div>
          <h2 className="text-2xl font-black text-amber-400">
            {isAdminMode ? 'دخول المسؤول (الأدمن)' : 'تسجيل دخول الأعضاء'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            اللجنة العلمية - دراية
          </p>
          {isMandatory && (
            <p className="text-[11px] text-amber-400/90 font-bold mt-2 bg-amber-500/10 border border-amber-500/20 py-1.5 px-3 rounded-xl inline-block">
              * تسجيل الدخول إلزامي لتصفح منصة دراية
            </p>
          )}
        </div>

        {/* Quick Role Toggle Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-2xl mb-6 border border-slate-700">
          <button
            type="button"
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isAdminMode
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            دخول الأعضاء والشباب
          </button>
          <button
            type="button"
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isAdminMode
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>لوحة الأدمن</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>اسم المستخدم</span>
              </span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isAdminMode ? 'اسم المستخدم' : 'اسم المستخدم (اختياري)'}
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 text-right outline-none transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>كلمة المرور</span>
              </span>
              <span className="text-[10px] text-rose-400 font-bold">* مطلوب</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 text-right outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAdminMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isAdminMode ? 'دخول لوحة تحكم المسؤول' : 'دخول المنصة'}</span>
          </button>
        </form>

        {/* Toggle Help Explanation */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 mx-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>كيف تعمل المنصة؟</span>
          </button>

          {showHelp && (
            <div className="mt-3 p-3 bg-slate-800/80 rounded-xl text-right text-xs text-slate-300 space-y-1.5 animate-in fade-in">
              <p>• اسم المستخدم اختياري للأعضاء لسهولة الدخول.</p>
              <p>• كلمة المرور تُتيح لجميع المنتسبين تصفح القواعد، الكلمات، الأذان، والصلاة والتفاعل.</p>
              <p>• المسؤول (الأدمن) يستطيع متابعة جميع الرسائل والمشاركات والتعديل على كافة أقسام الموقع بكل حُرية.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
