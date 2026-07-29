import React, { useState, useRef } from 'react';
import { 
  Volume2, Mic, Square, Play, CheckCircle, 
  AlertTriangle, BookOpen, Send, Sparkles, RefreshCw, VolumeX, X, Upload,
  UserPlus, Image, FileAudio, UserCheck, ShieldCheck
} from 'lucide-react';
import { AdhanGuideItem, UserSession, SubmissionItem } from '../types';

interface AdhanSectionProps {
  adhanGuides: AdhanGuideItem[];
  submissions?: SubmissionItem[];
  session: UserSession;
  onSubmitVoice: (
    title: string,
    senderName: string,
    audioBlobOrUrl: Blob | string | null,
    imageUrl?: string
  ) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const AdhanSection: React.FC<AdhanSectionProps> = ({
  adhanGuides,
  submissions = [],
  session,
  onSubmitVoice,
  showToast,
  onClose,
}) => {
  const [isAddMuezzinModalOpen, setIsAddMuezzinModalOpen] = useState(false);
  
  // Voice Recording & Muezzin state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [muezzinImage, setMuezzinImage] = useState<string | null>(null);
  const [senderName, setSenderName] = useState(session.username || '');
  const [recordingTitle, setRecordingTitle] = useState('تسجيل أذان جديد');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Audio Reading playback
  const [speakingText, setSpeakingText] = useState(false);

  // Start Voice Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('المتصفح لا يدعم تسجيل الصوت المباشر. يمكنك رفع ملف صوتي بدلاً من ذلك.', 'error');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      showToast('تم رفض صلاحية الميكروفون أو تعذر الوصول إليه. يمكنك استخدام خيار "رفع ملف صوتي".', 'error');
    }
  };

  // Audio file upload
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('حجم الملف الصوتي كبير جداً. الحد الأقصى 15 ميجابايت', 'error');
        return;
      }
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      showToast(`تم اختيار الملف الصوتي: ${file.name}`, 'success');
    }
  };

  // Image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMuezzinImage(reader.result as string);
        showToast('تم إرفاق صورة المؤذن بنجاح', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleOpenAddModal = () => {
    if (session.role !== 'admin') {
      showToast('عفواً، إضافة المؤذنين وإعتمادهم مباشرة مقتصرة على الأدمن ومشرفي اللجنة فقط.', 'error');
      return;
    }
    setIsAddMuezzinModalOpen(true);
  };

  // Filter all muezzins added/approved
  const muezzins = submissions.filter(
    (s) => s.type === 'voice_recording' || Boolean(s.imageUrl)
  );

  // Submit Voice Recording & Muezzin
  const handleSendVoice = () => {
    if (!senderName.trim()) {
      showToast('يرجى كتابة اسم المؤذن', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmitVoice(
        recordingTitle || `المؤذن: ${senderName}`,
        senderName,
        audioBlob || audioUrl || null,
        muezzinImage || undefined
      );
      showToast('تمت إضافة المؤذن بنجاح وظهوره للجميع!', 'success');
      // Reset form & close modal
      setAudioBlob(null);
      setAudioUrl(null);
      setMuezzinImage(null);
      setRecordingTime(0);
      setIsAddMuezzinModalOpen(false);
    } catch (e) {
      showToast('حدث خطأ أثناء إضافة المؤذن', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const speakAdhan = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingText) {
      window.speechSynthesis.cancel();
      setSpeakingText(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.onend = () => setSpeakingText(false);
    setSpeakingText(true);
    window.speechSynthesis.speak(utterance);
  };

  const textItem = adhanGuides.find((g) => g.type === 'text');
  const sunanItem = adhanGuides.find((g) => g.type === 'sunan');
  const mistakesItem = adhanGuides.find((g) => g.type === 'mistakes');

  return (
    <div className="space-y-6">
      {/* Display Added Public Muezzins */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">المؤذنون المسجلون في لجنة دراية</h3>
              <p className="text-xs text-slate-500">قائمة المؤذنين المضافين المعتمدين</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors border border-amber-200 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>إضافة مؤذن جديد</span>
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

        {muezzins.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <UserPlus className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">لا يوجد مؤذنون مضافون حالياً</p>
            <p className="text-xs text-slate-400">انقر على زر "إضافة مؤذن" لإضافة أول مؤذن ليكون ظاهراً للجميع</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-2 bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مؤذن الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {muezzins.map((muezzin) => (
              <div
                key={muezzin.id}
                className="bg-slate-50 hover:bg-slate-100/80 transition-all rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  {muezzin.imageUrl ? (
                    <img
                      src={muezzin.imageUrl}
                      alt={muezzin.senderName}
                      className="w-16 h-16 object-cover rounded-2xl border-2 border-amber-400 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-700 border-2 border-amber-400 flex items-center justify-center font-black text-xl flex-shrink-0">
                      {muezzin.senderName.charAt(0)}
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-black text-slate-900 truncate">{muezzin.senderName}</h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 truncate">{muezzin.title || 'مؤذن معتمد'}</p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      مؤذن معتمد
                    </span>
                  </div>
                </div>

                {muezzin.audioDataUrl && (
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <p className="text-[10px] font-bold text-amber-400">تسجيل أذان خاص بالمؤذن:</p>
                    <audio src={muezzin.audioDataUrl} controls className="w-full h-8 rounded-lg" />
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-left pt-1 border-t border-slate-200/60">
                  تاريخ الإضافة: {muezzin.createdAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Muezzin Modal */}
      {isAddMuezzinModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-amber-500/30 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddMuezzinModalOpen(false)}
              className="absolute top-5 left-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-amber-400">إضافة مؤذن جديد</h3>
              <p className="text-xs text-slate-300">
                أدخل اسم المؤذن وقم برفع صورته الشخصية لإضافته مباشرة للقائمة المعروضة للجميع
              </p>
            </div>

            <div className="space-y-4">
              {/* 1. Muezzin Name Input */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>اسم المؤذن <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="أدخل اسم المؤذن الكريِم..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-3.5 text-sm text-slate-100 outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              {/* 2. Upload Muezzin Photo */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-amber-400" />
                  <span>رفع صورة المؤذن</span>
                </label>

                {muezzinImage ? (
                  <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-emerald-500/40">
                    <img
                      src={muezzinImage}
                      alt="صورة المؤذن"
                      className="w-16 h-16 object-cover rounded-xl border border-amber-500/40 shadow-md"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-400">تم إرفاق صورة المؤذن بنجاح</p>
                      <p className="text-[10px] text-slate-400">جاهزة للحفظ والتظهير للجميع</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMuezzinImage(null)}
                      className="p-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-xs cursor-pointer"
                      title="حذف الصورة"
                    >
                      إزالة
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold p-3.5 rounded-xl text-xs transition-all border border-dashed border-slate-700 cursor-pointer">
                    <Image className="w-4 h-4 text-amber-400" />
                    <span>انقر هنا لاختيار صورة المؤذن (PNG, JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSendVoice}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>إضافة مؤذن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

