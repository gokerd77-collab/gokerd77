import React, { useState } from 'react';
import { 
  Shield, MessageSquare, BookOpen, Layers, Volume2, 
  Settings, Download, Upload, Trash2, CheckCircle2, 
  Send, HelpCircle, RefreshCw, Key, Sparkles, Star, Mic, Eye, X, Plus 
} from 'lucide-react';
import { 
  SubmissionItem, RuleItem, VocabularyItem, 
  AdhanGuideItem, PrayerStep, SiteSettings 
} from '../types';
import { StorageService } from '../services/storage';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AdminDashboardProps {
  submissions: SubmissionItem[];
  rules: RuleItem[];
  vocabulary: VocabularyItem[];
  settings: SiteSettings;
  onUpdateSubmission: (sub: SubmissionItem) => void;
  onDeleteSubmission: (id: string) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onRefreshData: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  submissions,
  rules,
  vocabulary,
  settings,
  onUpdateSubmission,
  onDeleteSubmission,
  onUpdateSettings,
  onRefreshData,
  showToast,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'content' | 'settings' | 'backup' | 'guide'>('inbox');
  
  // Replying state
  const [replyingSubId, setReplyingSubId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [evaluationScore, setEvaluationScore] = useState<number>(10);
  const [subToDeleteId, setSubToDeleteId] = useState<string | null>(null);

  // Settings form
  const [announcementText, setAnnouncementText] = useState(settings.announcement);
  const [memberPass, setMemberPass] = useState(settings.memberPasswordHash);
  const [adminPass, setAdminPass] = useState(settings.adminPasswordHash);

  // Backup Import Ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSendReply = (sub: SubmissionItem) => {
    if (!replyText.trim()) {
      showToast('يرجى كتابة نص الرد أولاً', 'error');
      return;
    }

    onUpdateSubmission({
      ...sub,
      replyText: replyText.trim(),
      status: 'replied',
      score: sub.type === 'voice_recording' ? evaluationScore : sub.score,
      isFeatured: true, // Auto publish answered questions to wall
    });

    showToast('تم إرسال ردك وحفظه بنجاح!', 'success');
    setReplyingSubId(null);
    setReplyText('');
  };

  const toggleFeatured = (sub: SubmissionItem) => {
    const updated = !sub.isFeatured;
    onUpdateSubmission({
      ...sub,
      isFeatured: updated,
      status: updated ? 'approved' : sub.status,
    });
    showToast(updated ? 'تم إبراز ونشر المشاركة بالجدار التفاعلي' : 'تم إلغاء إبراز المشاركة', 'info');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      announcement: announcementText.trim(),
      memberPasswordHash: memberPass.trim() || 'دراية',
      adminPasswordHash: adminPass.trim() || 'دراية_123',
    };

    onUpdateSettings(updated);
    showToast('تم حفظ إعدادات وكلمات مرور المنصة بنجاح!', 'success');
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dirayah_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('تم تحميل نسخة احتياطية كاملة للموقع على جهازك!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = StorageService.importDataJSON(content);
        if (success) {
          onRefreshData();
          showToast('تم استرجاع النسخة الاحتياطية بنجاح!', 'success');
        } else {
          showToast('فشل استرجاع الملف. تاكد من صيغة الملف', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-black text-amber-400">لوحة تحكم إدارة اللجنة العلمية - دراية</h2>
          </div>
          <p className="text-xs text-slate-300">
            تحكم كامل في المحتوى، الرسائل الواردة، التسجيلات الصوتية، الإعدادات، والنسخ الاحتياطي
          </p>
        </div>

        {/* Tab Controls & Close */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inbox'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>الوارد والرسائل</span>
              {pendingCount > 0 && (
                <span className="mr-1.5 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'content'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              إدارة المواد
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              الإعدادات
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'backup'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              النسخ الاحتياطي
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'guide'
                  ? 'bg-emerald-600 text-white font-black shadow'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>شرح النظام</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-2xl transition-all flex items-center justify-center shadow-sm shrink-0"
              title="خروج والعودة للرئيسية"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Inbox & Submissions Manager */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <span>صندوق الوارد والرسائل والمقاطع الصوتية ({submissions.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              الرسائل الجديدة غير المردود عليها: {pendingCount}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">لا توجد رسائل أو مشاركات واردة حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-3xl p-6 shadow-sm transition-all space-y-4 ${
                    sub.status === 'pending'
                      ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400/40'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 text-xs font-bold flex items-center justify-center">
                        {sub.senderName[0] || 'ع'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{sub.senderName}</h4>
                        <p className="text-[11px] text-slate-400">{sub.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                          sub.type === 'voice_recording'
                            ? 'bg-emerald-100 text-emerald-900'
                            : sub.type === 'question'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {sub.type === 'voice_recording' ? '🎤 تسجيل صوتي' : sub.type === 'question' ? '💬 استفسار' : '📄 ملخص / ملف'}
                      </span>

                      <button
                        onClick={() => toggleFeatured(sub)}
                        className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                          sub.isFeatured
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="إبراز ونشر بالجدار التفاعلي"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>{sub.isFeatured ? 'مبارز بالجدار' : 'إبراز'}</span>
                      </button>

                      <button
                        onClick={() => setSubToDeleteId(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="حذف الرسالة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900">{sub.title}</h3>
                  {sub.content && <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{sub.content}</p>}

                  {/* Muezzin Image if present */}
                  {sub.imageUrl && (
                    <div className="bg-slate-100 p-3 rounded-2xl flex items-center gap-3 border border-slate-200">
                      <img
                        src={sub.imageUrl}
                        alt={sub.senderName}
                        className="w-16 h-16 object-cover rounded-xl border border-amber-400 shadow-sm"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">صورة المؤذن المرفقة</p>
                        <p className="text-[11px] text-slate-500">{sub.senderName}</p>
                      </div>
                    </div>
                  )}

                  {/* Play Audio file if present */}
                  {sub.audioDataUrl && (
                    <div className="bg-slate-900 text-white p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                      <p className="text-xs font-bold text-amber-400">التسجيل الصوتي المرسل من الطالب:</p>
                      <audio src={sub.audioDataUrl} controls className="w-full h-8" />
                    </div>
                  )}

                  {/* Attached File if present */}
                  {sub.fileDataUrl && (
                    <div className="bg-slate-100 p-3 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>الملف المرفق: {sub.fileName || 'ملف'}</span>
                      <a
                        href={sub.fileDataUrl}
                        download={sub.fileName || 'file'}
                        className="bg-amber-500 text-slate-950 px-3 py-1 rounded-xl text-xs"
                      >
                        تحميل الملف
                      </a>
                    </div>
                  )}

                  {/* Existing Reply */}
                  {sub.replyText && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-1">
                      <strong className="block font-black text-emerald-800">ردك المسجل لهذا العضو:</strong>
                      <p>{sub.replyText}</p>
                      {sub.score !== undefined && (
                        <p className="font-bold text-emerald-700 mt-1">الدرجة الممنوحة: {sub.score} / 10</p>
                      )}
                    </div>
                  )}

                  {/* Reply Form Trigger */}
                  <div className="pt-2">
                    {replyingSubId !== sub.id ? (
                      <button
                        onClick={() => {
                          setReplyingSubId(sub.id);
                          setReplyText(sub.replyText || '');
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition-colors"
                      >
                        {sub.replyText ? 'تعديل الرد' : 'الرد على هذه المشاركة'}
                      </button>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 animate-in fade-in">
                        <label className="block text-xs font-bold text-slate-800">كتابة رد وتوجيه اللجنة العلمية:</label>
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="اكتب ردك وملاحظاتك التوجيهية للرسالة..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-amber-500"
                        />

                        {sub.type === 'voice_recording' && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-700">تقييم تسجيل الأذان (من 10):</span>
                            <select
                              value={evaluationScore}
                              onChange={(e) => setEvaluationScore(Number(e.target.value))}
                              className="bg-white border rounded-lg px-2 py-1 font-bold text-amber-700"
                            >
                              {[10, 9, 8, 7, 6, 5, 4, 3].map((num) => (
                                <option key={num} value={num}>
                                  {num} من 10
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendReply(sub)}
                            className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow"
                          >
                            إرسال الرد وحفظه
                          </button>
                          <button
                            onClick={() => setReplyingSubId(null)}
                            className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Content Management Info */}
      {activeTab === 'content' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900">إدارة مواد وأقسام المنصة العلمية</h3>
          <p className="text-xs text-slate-600">
            يمكنك تعديل، إضافة، وحذف المحتوى مباشرة من أي قسم في الموقع أثناء التصفح عندما تكون مسجلاً كـ مشرف (أدمن).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="font-black text-amber-900 mb-1">قسم القواعد ({rules.length})</h4>
              <p className="text-xs text-amber-800">اذهب لقسم القواعد لتر زر "إضافة قاعدة جديدة" وأزرار التعديل والحذف.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <h4 className="font-black text-emerald-900 mb-1">قسم الكلمات ({vocabulary.length})</h4>
              <p className="text-xs text-emerald-800">اذهب لقسم الكلمات لإضافة مصطلحات جديدة أو تعديل كلمات القاموس.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Settings & Passwords */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-xl mx-auto">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-600" />
            <span>إعدادات السرية وكلمات المرور</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة مرور الأعضاء والشباب</label>
              <input
                type="text"
                value={memberPass}
                onChange={(e) => setMemberPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 outline-none focus:border-amber-500"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">كلمة المرور الحالية الموحدة للأعضاء (الافتراضية: دراية)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة مرور الأدمن / المسؤول</label>
              <input
                type="text"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 outline-none focus:border-amber-500"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">كلمة مرور دخول لوحة التحكم الإدارية (الافتراضية: دراية_123)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">شريط التنويه والإعلانات العلوي</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-900 outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow transition-colors"
            >
              حفظ وتطبيق التغييرات
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Export / Import Backup */}
      {activeTab === 'backup' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-xl mx-auto">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <span>حفظ واسترجاع النسخ الاحتياطية</span>
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            لحماية جميع بياناتك ورسائل الأعضاء والقواعد والكلمات، يمكنك تنزيل ملف النسخة الاحتياطية الاحتياطية واسترجاعه في أي وقت.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل نسخة احتياطية كاملة (.json)</span>
            </button>

            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>استرجاع نسخة احتياطية من ملف (.json)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: System Explanation Guide */}
      {activeTab === 'guide' && (
        <div className="bg-slate-900 text-white border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 bg-amber-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-xl">
              د
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-400">دليل وشرح نظام منصة اللجنة العلمية - دراية</h3>
              <p className="text-xs text-slate-300">كل ما تحتاج معرفته عن كيفية عمل الموقع وحفظ البيانات</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <h4 className="font-bold text-amber-400 text-base">1. كيف تسجل دخول الأعضاء والشباب؟</h4>
              <p>اسم المستخدم اختياري للشباب ليتمكنوا من الدخول بسرعة وسلاسة. كلمة المرور الموحدة للأعضاء هي: <strong className="text-white">دراية</strong>.</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <h4 className="font-bold text-emerald-400 text-base">2. كيف يصلك كل شيء يضيفه الأعضاء؟</h4>
              <p>عندما يقوم عضو بإرسال سؤال، رسالة، أو تسجيل صوتي للأذان من قسم التفاعل، تُحفظ المشاركة فوراً في قاعدة البيانات وتظهر لديك في <strong className="text-white">صندوق الوارد</strong> هنا في لوحة الأدمن مصحوبة بشارة تنبيهية.</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <h4 className="font-bold text-amber-400 text-base">3. كيف تعدل أو تضيف قواعد وكلمات؟</h4>
              <p>عندما تسجل دخول بكلمة مرور الأدمن (<strong className="text-white">دراية_123</strong>)، سيزودك الموقع بأزرار "إضافة"، "تعديل"، و"حذف" مباشرة في أقسام القواعد والكلمات والأذان.</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <h4 className="font-bold text-emerald-400 text-base">4. حفظ البيانات والنسخ الاحتياطي</h4>
              <p>تستطيع في أي وقت الضغط على زر <strong className="text-white">تنزيل نسخة احتياطية</strong> لتنزيل ملف يحتوي على كل تعديلاتك ورسائل الطلاب لحفظه على هاتفك أو كمبيوترك والأمان التام.</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!subToDeleteId}
        title="تأكيد حذف المشاركة"
        description="هل أنت تأكد من رغبتك في حذف هذه المشاركة / الرسالة نهائياً من النظام؟"
        onConfirm={() => {
          if (subToDeleteId) {
            onDeleteSubmission(subToDeleteId);
            showToast('تم حذف المشاركة بنجاح', 'info');
            setSubToDeleteId(null);
          }
        }}
        onClose={() => setSubToDeleteId(null)}
      />
    </div>
  );
};
