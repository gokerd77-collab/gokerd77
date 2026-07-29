import React, { useState } from 'react';
import { 
  Shield, X, UserPlus, UserCheck, Upload, Image, 
  FileText, Trash2, Volume2 
} from 'lucide-react';
import { UserSession, SubmissionItem } from '../types';

interface PrayerSectionProps {
  submissions?: SubmissionItem[];
  session: UserSession;
  onAddSubmission?: (sub: Omit<SubmissionItem, 'id' | 'createdAt' | 'status'>) => void;
  onDeleteSubmission?: (id: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const PrayerSection: React.FC<PrayerSectionProps> = ({
  submissions = [],
  session,
  onAddSubmission,
  onDeleteSubmission,
  showToast,
  onClose,
}) => {
  const [isAddImamModalOpen, setIsAddImamModalOpen] = useState(false);

  // Add Imam Modal Form state
  const [imamName, setImamName] = useState('');
  const [imamMosque, setImamMosque] = useState('');
  const [imamImage, setImamImage] = useState<string | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddImamModal = () => {
    if (session.role !== 'admin') {
      showToast('عفواً، إضافة الأئمة وإعتمادهم مقتصرة على الأدمن ومشرفي اللجنة فقط.', 'error');
      return;
    }
    setIsAddImamModalOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImamImage(reader.result as string);
        showToast('تم إرفاق صورة الإمام بنجاح', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // File Upload Handler (Audio / PDF / Document)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('حجم الملف كبير جداً. الحد الأقصى 15 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (file.type.startsWith('audio/')) {
          setAudioDataUrl(result);
          setAudioFileName(file.name);
          showToast(`تم إرفاق التلاوة الصوتية: ${file.name}`, 'success');
        } else {
          setFileDataUrl(result);
          setFileName(file.name);
          showToast(`تم إرفاق الملف: ${file.name}`, 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Imam Form
  const handleSaveImam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imamName.trim()) {
      showToast('يرجى كتابة اسم الإمام', 'error');
      return;
    }

    if (!onAddSubmission) return;

    setIsSubmitting(true);
    try {
      onAddSubmission({
        senderName: imamName.trim(),
        type: 'imam',
        title: `إمام: ${imamName.trim()}`,
        content: imamMosque.trim() || undefined,
        imageUrl: imamImage || undefined,
        audioDataUrl: audioDataUrl || undefined,
        fileDataUrl: fileDataUrl || undefined,
        fileName: fileName || audioFileName || undefined,
      });

      showToast('تمت إضافة الإمام بنجاح وظهوره لقائمة الأئمة المعتمدين!', 'success');
      
      // Reset form & close modal
      setImamName('');
      setImamMosque('');
      setImamImage(null);
      setAudioDataUrl(null);
      setAudioFileName(null);
      setFileDataUrl(null);
      setFileName(null);
      setIsAddImamModalOpen(false);
    } catch (err) {
      showToast('حدث خطأ أثناء حفظ بيانات الإمام', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter registered Imams
  const imams = submissions.filter(
    (s) => s.type === 'imam' || s.title.startsWith('إمام:')
  );

  return (
    <div className="space-y-6">
      {/* Registered Imams Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">الأئمة المسجلون في لجنة دراية</h3>
              <p className="text-xs text-slate-500">قائمة الأئمة المعتمدين مع التلاوات والملفات المرفقة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddImamModal}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors border border-amber-200 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>إضافة إمام جديد</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors flex items-center justify-center cursor-pointer"
                title="خروج والعودة للرئيسية"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {imams.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">لا يوجد أئمة مسجلون حالياً</p>
            <p className="text-xs text-slate-400 mt-1">يمكن للأدمن النقر على زر "إضافة إمام" لإضافة أئمة اللجنة المعتمدين</p>
            <button
              onClick={handleOpenAddImamModal}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة إمام جديد</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {imams.map((imam) => (
              <div
                key={imam.id}
                className="bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header with image & name */}
                  <div className="flex items-center gap-3.5 mb-3">
                    {imam.imageUrl ? (
                      <img
                        src={imam.imageUrl}
                        alt={imam.senderName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 font-black text-xl flex items-center justify-center shrink-0 border-2 border-amber-400 shadow-sm">
                        {imam.senderName.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mb-1">
                        إمام معتمد
                      </span>
                      <h4 className="text-base font-black text-slate-900 truncate">
                        الشيخ: {imam.senderName}
                      </h4>
                      {imam.content && (
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {imam.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Audio Player if present */}
                  {imam.audioDataUrl && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                        <span>تلاوة إيمانية</span>
                      </div>
                      <audio
                        src={imam.audioDataUrl}
                        controls
                        className="w-full h-8"
                      />
                    </div>
                  )}

                  {/* File Attachment if present */}
                  {imam.fileDataUrl && (
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 truncate">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">{imam.fileName || 'ملف الإمام المرفق'}</span>
                      </div>
                      <a
                        href={imam.fileDataUrl}
                        download={imam.fileName || 'imam-file'}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                      >
                        تحميل
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer & Delete action for Admin */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400">
                  <span>مسجل في لجنة دراية</span>
                  {session.role === 'admin' && onDeleteSubmission && (
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت تأكد من حذف بيانات الإمام "${imam.senderName}"؟`)) {
                          onDeleteSubmission(imam.id);
                          showToast('تم حذف الإمام بنجاح', 'info');
                        }
                      }}
                      className="text-rose-600 hover:text-rose-700 font-bold p-1 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="حذف الإمام (خاص بالأدمن)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add New Imam (Admin Only) */}
      {isAddImamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">إضافة إمام جديد - لجنة دراية</h3>
                  <p className="text-xs text-slate-500">إضافة وإعتماد بيانات الإمام ليُعرض لكافة الأعضاء</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddImamModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImam} className="space-y-4">
              {/* 1. Imam Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الإمام الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. عبد الله بن علي السعيد"
                  value={imamName}
                  onChange={(e) => setImamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>


              {/* 3. Imam Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رفع صورة الإمام
                </label>
                <div className="flex items-center gap-3">
                  {imamImage ? (
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0">
                      <img src={imamImage} alt="صورة الإمام" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImamImage(null)}
                        className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 cursor-pointer transition-colors bg-slate-50">
                      <Image className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-600">اختر صورة من جهازك</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 4. File Upload (Audio or PDF) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رفع ملف (تلاوة صوتية / ملف PDF)
                </label>
                <label className="flex items-center justify-between border border-slate-300 hover:border-amber-500 rounded-xl p-3 cursor-pointer bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 truncate">
                    <Upload className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">
                      {audioFileName || fileName || 'اختر ملف صوتي أو مستند مرفق للإمام'}
                    </span>
                  </div>
                  <span className="text-[11px] bg-slate-200 px-2 py-1 rounded-lg text-slate-700 shrink-0">تصفح</span>
                  <input
                    type="file"
                    accept="audio/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddImamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>حفظ وإضافة الإمام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
