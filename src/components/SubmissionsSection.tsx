import React, { useState, useRef } from 'react';
import { 
  MessageSquare, Send, Mic, FileText, HelpCircle, 
  CheckCircle2, Volume2, Upload, Sparkles, User, Paperclip, Star, X 
} from 'lucide-react';
import { SubmissionItem, UserSession } from '../types';

interface SubmissionsSectionProps {
  submissions: SubmissionItem[];
  session: UserSession;
  onSubmit: (sub: Omit<SubmissionItem, 'id' | 'createdAt' | 'status'>) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const SubmissionsSection: React.FC<SubmissionsSectionProps> = ({
  submissions,
  session,
  onSubmit,
  showToast,
  onClose,
}) => {
  const [senderName, setSenderName] = useState(session.username || '');
  const [subType, setSubType] = useState<SubmissionItem['type']>('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // File upload state
  const [fileName, setFileName] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Featured / Approved Submissions
  const featuredSubmissions = submissions.filter((s) => s.isFeatured || s.status === 'replied' || s.status === 'approved');

  const startMic = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('المتصفح لا يدعم التسجيل الصوتي المباشر. يمكنك استخدام خيار إرفاق الملفات.', 'error');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      showToast('تم رفض صلاحية الميكروفون أو تعذر الوصول إليه. يمكنك إرفاق تسجليك كملف بدلاً من ذلك.', 'error');
    }
  };

  const stopMic = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      showToast(`تم رفع الملف: ${file.name}`, 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('يرجى كتابة عنوان الرسالة أو الاستفسار', 'error');
      return;
    }

    const finalSenderName = senderName.trim() || 'عضو اللجنة (بدون اسم)';

    onSubmit({
      senderName: finalSenderName,
      type: subType,
      title: title.trim(),
      content: content.trim(),
      audioDataUrl: audioUrl || undefined,
      fileName: fileName || undefined,
      fileDataUrl: fileDataUrl || undefined,
    });

    showToast('تم إرسال مشاركتك ورسالتك بنجاح! ستصل فوراً للوحة تحكم الأدمن.', 'success');

    // Reset Form
    setTitle('');
    setContent('');
    setFileName('');
    setFileDataUrl('');
    setAudioUrl(null);
    setAudioBlob(null);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">قسم التفاعل والمشاركات العلمية</h2>
          </div>
          <p className="text-xs text-slate-600">
            أرسل أسئلتك واستفساراتك وتسجيلاتك الصوتية والملخصات مباشرة لإدارة اللجنة العلمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-3 py-2 rounded-2xl flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تصل جميع الرسائل والمشاركات فوراً للوحة الأدمن!</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-2xl border border-rose-200 transition-all flex items-center justify-center shadow-sm shrink-0"
              title="خروج والعودة للرئيسية"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Form + Info Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Submission Form (8 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-600" />
            <span>إرسال مشاركة جديدة للجنة</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sender Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>اسمك أو اسمك المستعار (اختياري للشباب)</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="أدخل اسمك هنا (أو اتركه فارغاً لترسل كـ عضو)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 outline-none focus:border-amber-500"
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع المشاركة</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'question', label: 'استفسار أو سؤال', icon: HelpCircle },
                  { id: 'voice_recording', label: 'تسجيل صوتي', icon: Mic },
                  { id: 'study_file', label: 'ملف أو تلخيص', icon: FileText },
                ].map((type) => {
                  const Icon = type.icon;
                  const selected = subType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSubType(type.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        selected
                          ? 'bg-slate-900 text-amber-400 border-slate-900 shadow'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${selected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المشاركة / الموضوع</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="اكتب عنواناً يوضح موضوع الرسالة..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Text Message Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نص الرسالة أو الاستفسار</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب تفاصيل استفسارك أو مشاركتك العلمية هنا..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 outline-none focus:border-amber-500"
              />
            </div>

            {/* Audio Recording Attachment */}
            {subType === 'voice_recording' && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">إرفاق تسجيل صوتي:</span>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startMic}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>تسجيل صوتي</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopMic}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse"
                    >
                      إيقاف التسجيل
                    </button>
                  )}
                </div>

                {audioUrl && (
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-400 mb-1">معاينة الصوت المسجل:</p>
                    <audio src={audioUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>
            )}

            {/* File Attachment */}
            {subType === 'study_file' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-900 text-amber-400 hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow">
                  <Paperclip className="w-4 h-4" />
                  <span>اختر ملفاً مرفقاً (صورة / PDF)</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
                {fileName && (
                  <p className="text-xs font-bold text-emerald-700">الملف المرفق: {fileName}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>إرسال المشاركة إلى إدارة اللجنة فوراً</span>
            </button>
          </form>
        </div>

        {/* Info Guide Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl">
              د
            </div>
            <h3 className="text-xl font-black text-amber-400">كيف يصل صوتك ومشاركتك للمسؤول؟</h3>
            
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p>بمجرد إرسالك للرسالة أو التسجيل الصوتي، تُحفظ المشاركة تلقائياً في قاعدة بيانات المنصة.</p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p>تظهر شارة حمراء تنبيهية في لوحة تحكم المسؤول (الأدمن) فور إرسالك لتستعرض مشاركتك.</p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p>يمكن للمسؤول الاستماع لتسجيلك، الرد على استفساراتك، ونشر ردوده في جدار المشاركات المعتمدة!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured / Answered Submissions Wall */}
      {featuredSubmissions.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>المشاركات والاستفسارات المعتمدة والمُجاب عنها</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredSubmissions.map((sub) => (
              <div key={sub.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-amber-700">{sub.senderName}</span>
                  <span className="text-[11px] text-slate-400">{sub.createdAt}</span>
                </div>

                <h4 className="text-base font-black text-slate-900">{sub.title}</h4>
                {sub.content && <p className="text-xs text-slate-700 leading-relaxed">{sub.content}</p>}

                {/* Muezzin Photo if present */}
                {sub.imageUrl && (
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <img src={sub.imageUrl} alt={sub.senderName} className="w-14 h-14 object-cover rounded-xl border border-amber-400 shadow-sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sub.senderName}</p>
                      <p className="text-[10px] text-slate-500">مؤذن معتمد</p>
                    </div>
                  </div>
                )}

                {/* Audio playback if present */}
                {sub.audioDataUrl && (
                  <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold mb-1">التسجيل الصوتي المرفق:</p>
                    <audio src={sub.audioDataUrl} controls className="w-full h-8" />
                  </div>
                )}

                {/* Score badge for audio */}
                {sub.score !== undefined && (
                  <div className="inline-block bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                    تقييم الأدمن للأذان: {sub.score} من 10
                  </div>
                )}

                {/* Admin Reply */}
                {sub.replyText && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 space-y-1">
                    <strong className="block font-black text-amber-800">رد وتوجيه اللجنة العلمية:</strong>
                    <p>{sub.replyText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
