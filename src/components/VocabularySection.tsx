import React, { useState } from 'react';
import { 
  Layers, Search, Volume2, Plus, Edit, Trash2, 
  X, RotateCw, Sparkles, Filter, Bookmark, Image as ImageIcon,
  FileText, Upload, Paperclip, Download, ExternalLink
} from 'lucide-react';
import { VocabularyItem, UserSession } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface VocabularySectionProps {
  vocabulary: VocabularyItem[];
  session: UserSession;
  onAddWord: (word: Omit<VocabularyItem, 'id'>) => void;
  onUpdateWord: (word: VocabularyItem) => void;
  onDeleteWord: (id: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({
  vocabulary,
  session,
  onAddWord,
  onUpdateWord,
  onDeleteWord,
  showToast,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [viewMode, setViewMode] = useState<'cards' | 'flashcards'>('cards');
  
  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyItem | null>(null);
  const [wordToDeleteId, setWordToDeleteId] = useState<string | null>(null);

  // Form state
  const [formWord, setFormWord] = useState('');
  const [formDiacritics, setFormDiacritics] = useState('');
  const [formMeaning, setFormMeaning] = useState('');
  const [formImpact, setFormImpact] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formRootWord, setFormRootWord] = useState('');
  const [formCategory, setFormCategory] = useState<VocabularyItem['category']>('مصطلحات شرعية');
  const [formExample, setFormExample] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileName, setFormFileName] = useState('');

  const categories = ['الكل', 'مصطلحات شرعية', 'لغة وأدب', 'ألفاظ الأذان والصلاة', 'عام'];

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormImageUrl(reader.result as string);
        showToast('تم تحميل الصورة بنجاح', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormFileUrl(reader.result as string);
        setFormFileName(file.name);
        showToast('تم إرفاق الملف بنجاح', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered vocabulary
  const filteredVocab = vocabulary.filter((item) => {
    const matchesCategory = selectedCategory === 'الكل' || item.category === selectedCategory;
    const matchesSearch =
      item.word.includes(searchQuery) ||
      item.meaning.includes(searchQuery) ||
      (item.impact && item.impact.includes(searchQuery)) ||
      (item.speaker && item.speaker.includes(searchQuery)) ||
      (item.rootWord && item.rootWord.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Speak word
  const speakWord = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('خاصية الصوت غير مدعومة في متصفحك', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleOpenAddModal = () => {
    setFormWord('');
    setFormDiacritics('');
    setFormMeaning('');
    setFormImpact('');
    setFormSpeaker('');
    setFormRootWord('');
    setFormCategory('مصطلحات شرعية');
    setFormExample('');
    setFormImageUrl('');
    setFormFileUrl('');
    setFormFileName('');
    setEditingWord(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: VocabularyItem) => {
    setEditingWord(item);
    setFormWord(item.word);
    setFormDiacritics(item.diacritics || item.word);
    setFormMeaning(item.meaning);
    setFormImpact(item.impact || '');
    setFormSpeaker(item.speaker || '');
    setFormRootWord(item.rootWord || '');
    setFormCategory(item.category);
    setFormExample(item.exampleSentence || '');
    setFormImageUrl(item.imageUrl || '');
    setFormFileUrl(item.fileUrl || '');
    setFormFileName(item.fileName || '');
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWord.trim()) {
      showToast('يرجى كتابة عنوان الكلمة', 'error');
      return;
    }

    if (editingWord) {
      onUpdateWord({
        ...editingWord,
        word: formWord,
        diacritics: formDiacritics || formWord,
        meaning: formMeaning || formImpact || formWord,
        impact: formImpact,
        speaker: formSpeaker,
        rootWord: formRootWord,
        category: formCategory,
        exampleSentence: formExample,
        imageUrl: formImageUrl,
        fileUrl: formFileUrl,
        fileName: formFileName,
      });
      showToast('تم تحديث الكلمة بنجاح!', 'success');
    } else {
      onAddWord({
        word: formWord,
        diacritics: formDiacritics || formWord,
        meaning: formMeaning || formImpact || formWord,
        impact: formImpact,
        speaker: formSpeaker,
        rootWord: formRootWord,
        category: formCategory,
        exampleSentence: formExample,
        imageUrl: formImageUrl,
        fileUrl: formFileUrl,
        fileName: formFileName,
      });
      showToast('تمت إضافة الكلمة بنجاح!', 'success');
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">الكلمات</h2>
          </div>
          <p className="text-xs text-slate-600">
            تحسين مهارة الإلقاء
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {session.role === 'admin' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كلمة جديدة</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عرض القائمة
            </button>
            <button
              onClick={() => {
                setViewMode('flashcards');
                setIsFlipped(false);
                setCurrentFlashcardIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'flashcards'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بطاقات المراجعة
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن كلمة، جذر لغوي، أو معنى..."
          className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-sm rounded-2xl py-3 pr-12 pl-4 text-slate-800 placeholder-slate-400 outline-none shadow-sm"
        />
      </div>

      {/* Flashcards View Mode */}
      {viewMode === 'flashcards' && (
        <div className="max-w-xl mx-auto bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 border border-emerald-500/30 text-white text-center shadow-2xl space-y-6">
          {filteredVocab.length > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-slate-700/60 pb-3">
                <span>بطاقة رقم {currentFlashcardIndex + 1} من {filteredVocab.length}</span>
                <span>{filteredVocab[currentFlashcardIndex].category}</span>
              </div>

              {/* Flashcard Area */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[220px] bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center transition-all hover:scale-[1.01] relative shadow-inner"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(filteredVocab[currentFlashcardIndex].word);
                  }}
                  className="absolute top-4 left-4 p-2 bg-emerald-500/20 text-emerald-300 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                  title="نطق الكلمة"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {!isFlipped ? (
                  <div className="space-y-2">
                    <span className="text-3xl font-black text-amber-400 tracking-wide">
                      {filteredVocab[currentFlashcardIndex].diacritics}
                    </span>
                    {filteredVocab[currentFlashcardIndex].rootWord && (
                      <p className="text-xs text-slate-400">الجذر اللغوي: ({filteredVocab[currentFlashcardIndex].rootWord})</p>
                    )}
                    <span className="inline-block mt-4 text-[11px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                      اضغط لرؤية المعنى والتطبيق 🔄
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <p className="text-base font-bold text-slate-100 leading-relaxed">
                      {filteredVocab[currentFlashcardIndex].meaning}
                    </p>
                    <div className="bg-slate-900/80 p-3 rounded-xl text-xs text-amber-300 border border-amber-500/20 italic">
                      "{filteredVocab[currentFlashcardIndex].exampleSentence}"
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex((prev) => (prev > 0 ? prev - 1 : filteredVocab.length - 1));
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
                >
                  السابقة
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-bold"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>قلب البطاقة</span>
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex((prev) => (prev + 1 < filteredVocab.length ? prev + 1 : 0));
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
                >
                  التالية
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">لا توجد كلمات متاحة في هذا القسم</p>
          )}
        </div>
      )}

      {/* Cards Grid Mode */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVocab.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Audio & Admin Controls */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => speakWord(item.word)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="استمع لنطق الكلمة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {(session.role === 'admin' || session.isAdmin) && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                        title="تعديل الكلمة"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setWordToDeleteId(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="حذف الكلمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* الصورة المرفقة إن وجدت */}
                {item.imageUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-48 border border-slate-200/80 shadow-sm">
                    <img src={item.imageUrl} alt={item.word} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* 1. عنوان الكلمة */}
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-0.5">
                    عنوان الكلمة
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-snug flex items-baseline gap-2">
                    <span>{item.diacritics || item.word}</span>
                    {item.rootWord && (
                      <span className="text-xs text-slate-400 font-normal">[{item.rootWord}]</span>
                    )}
                  </h3>
                </div>

                {/* المعنى والشرح (إن وُجد) */}
                {item.meaning && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.meaning}
                  </p>
                )}

                {/* 2. أثر الكلمة علينا (قبل ملقي الكلمة) */}
                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 shadow-sm">
                  <strong className="block text-xs font-black text-emerald-900 mb-1">
                    أثر الكلمة علينا:
                  </strong>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                    {item.impact || item.meaning}
                  </p>
                </div>

                {/* 3. ملقي الكلمة */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">ملقي الكلمة:</span>
                  <span className="font-black text-slate-900">
                    {item.speaker || 'أحد أعضاء اللجنة العلمية'}
                  </span>
                </div>

                {/* الملف المرفق إن وجد */}
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    download={item.fileName || `${item.word}-ملف`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold transition-all group"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate flex-1">{item.fileName || 'تحميل الملف المرفق'}</span>
                    <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </a>
                )}

                {item.exampleSentence && (
                  <div className="text-[11px] text-slate-500 italic bg-slate-100/60 p-2 rounded-lg">
                    "{item.exampleSentence}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Word Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-right text-slate-800 font-sans max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-800 p-1 rounded-full bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-4">
              {editingWord ? 'تعديل بيانات الكلمة' : 'إضافة كلمة جديدة'}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الكلمة</label>
                <input
                  type="text"
                  value={formWord}
                  onChange={(e) => setFormWord(e.target.value)}
                  placeholder="عنوان الكلمة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أثر الكلمة علينا</label>
                <textarea
                  rows={2}
                  value={formImpact}
                  onChange={(e) => setFormImpact(e.target.value)}
                  placeholder="ما هو أثر هذه الكلمة والتذكير بها في النفوس والعمل..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملقي الكلمة</label>
                <input
                  type="text"
                  value={formSpeaker}
                  onChange={(e) => setFormSpeaker(e.target.value)}
                  placeholder="اسم ملقي الكلمة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              {/* خيار رفع صورة */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  إرفاق صورة توضيحية للكلمة
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-emerald-800 text-xs font-bold rounded-xl cursor-pointer border border-emerald-200 shadow-sm transition-all">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>{formImageUrl ? 'تغيير الصورة' : 'اختيار صورة...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {formImageUrl && (
                    <div className="relative inline-block">
                      <img src={formImageUrl} alt="معاينة" className="w-12 h-12 object-cover rounded-xl border border-slate-300 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5 shadow hover:bg-rose-700"
                        title="حذف الصورة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* خيار رفع ملف */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  إرفاق ملف أو مستند مرتبط
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-emerald-800 text-xs font-bold rounded-xl cursor-pointer border border-emerald-200 shadow-sm transition-all">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    <span>{formFileUrl ? 'تغيير الملف' : 'رفع ملف...'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.zip,.rar"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formFileUrl && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[140px]">{formFileName || 'ملف مرفق'}</span>
                      <button
                        type="button"
                        onClick={() => { setFormFileUrl(''); setFormFileName(''); }}
                        className="text-rose-600 hover:text-rose-800 mr-1 p-0.5 hover:bg-rose-100 rounded-full transition-colors"
                        title="إزالة الملف"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow transition-colors"
              >
                {editingWord ? 'حفظ التعديلات' : 'إضافة الكلمة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!wordToDeleteId}
        title="تأكيد حذف الكلمة"
        description="هل أنت تأكد من رغبتك في حذف هذه الكلمة من المعجم نهائياً؟"
        onConfirm={() => {
          if (wordToDeleteId) {
            onDeleteWord(wordToDeleteId);
            showToast('تم حذف الكلمة من المعجم بنجاح', 'info');
            setWordToDeleteId(null);
          }
        }}
        onClose={() => setWordToDeleteId(null)}
      />
    </div>
  );
};
