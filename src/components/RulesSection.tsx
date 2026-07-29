import React, { useState } from 'react';
import { 
  BookOpen, Search, Plus, Volume2, HelpCircle, 
  Check, Edit, Trash2, X, Sparkles, Filter 
} from 'lucide-react';
import { RuleItem, UserSession } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface RulesSectionProps {
  rules: RuleItem[];
  session: UserSession;
  onAddRule: (rule: Omit<RuleItem, 'id' | 'dateAdded'>) => void;
  onUpdateRule: (rule: RuleItem) => void;
  onDeleteRule: (id: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const RulesSection: React.FC<RulesSectionProps> = ({
  rules,
  session,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  showToast,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleItem | null>(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [ruleToDeleteId, setRuleToDeleteId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<RuleItem['category']>('قواعد فقهية');
  const [formContent, setFormContent] = useState('');
  const [formExample, setFormExample] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Categories list
  const categories = ['الكل', 'قواعد فقهية', 'قواعد لغوية', 'توجيهات علمية', 'أنظمة اللجنة'];

  // Filtered Rules
  const filteredRules = rules.filter((rule) => {
    const matchesCategory = selectedCategory === 'الكل' || rule.category === selectedCategory;
    const matchesSearch =
      rule.title.includes(searchQuery) ||
      rule.content.includes(searchQuery) ||
      (rule.example && rule.example.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Speak rule text
  const speakText = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('خاصية النطق الصوتي غير مدعومة في متصفحك', 'error');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleOpenAddModal = () => {
    setFormTitle('');
    setFormCategory('قواعد فقهية');
    setFormContent('');
    setFormExample('');
    setFormNotes('');
    setEditingRule(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (rule: RuleItem) => {
    setEditingRule(rule);
    setFormTitle(rule.title);
    setFormCategory(rule.category);
    setFormContent(rule.content);
    setFormExample(rule.example || '');
    setFormNotes(rule.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('يرجى ملء كافة الحقول الأساسية للقاعدة', 'error');
      return;
    }

    if (editingRule) {
      onUpdateRule({
        ...editingRule,
        title: formTitle,
        category: formCategory,
        content: formContent,
        example: formExample,
        notes: formNotes,
      });
      showToast('تم تحديث القاعدة بنجاح!', 'success');
    } else {
      onAddRule({
        title: formTitle,
        category: formCategory,
        content: formContent,
        example: formExample,
        notes: formNotes,
      });
      showToast('تمت إضافة القاعدة الجديدة إلى قسم القواعد بنجاح!', 'success');
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">قسم القواعد العلمية</h2>
          </div>
          <p className="text-xs text-slate-600">
            قواعد التزكية لتزكية النفس للجنة دراية
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {(session.role === 'admin' || session.isAdmin) && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قاعدة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن أي قاعدة أو كلمة أو عنوان..."
          className="w-full bg-white border border-slate-200 focus:border-amber-500 text-sm rounded-2xl py-3 pr-12 pl-4 text-slate-800 placeholder-slate-400 outline-none shadow-sm"
        />
      </div>

      {/* Rules List Grid */}
      {filteredRules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">لم يتم العثور على أي قواعد تطابق البحث</p>
          <p className="text-xs text-slate-400 mt-1">جرب البحث بكلمة أخرى أو تغيير القسم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white border border-slate-200 hover:border-amber-400/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                  {/* Speech & Admin Controls */}
                  <div className="flex items-center justify-end mb-3 gap-1">
                    <button
                      onClick={() => speakText(rule.id, `${rule.title}. ${rule.content}`)}
                      className={`p-2 rounded-xl transition-colors ${
                        speakingId === rule.id
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title="استمع للقاعدة بصوت القارئ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {(session.role === 'admin' || session.isAdmin) && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          title="تعديل القاعدة"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRuleToDeleteId(rule.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="حذف القاعدة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                {/* Title */}
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                  {rule.title}
                </h3>

                {/* Main Content */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                  {rule.content}
                </p>

                {/* Example Box */}
                {rule.example && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-950 mb-3">
                    <strong className="block font-black mb-1 text-amber-800">تطبيق ومثال:</strong>
                    <span>{rule.example}</span>
                  </div>
                )}

                {/* Notes */}
                {rule.notes && (
                  <p className="text-[11px] text-slate-500 italic">
                    💡 هام: {rule.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>تاريخ الإضافة: {rule.dateAdded}</span>
                <span className="font-bold text-amber-700">اللجنة العلمية - دراية</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-right text-slate-800 font-sans">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-800 p-1 rounded-full bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-4">
              {editingRule ? 'تعديل القاعدة العلمية' : 'إضافة قاعدة جديدة'}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان القاعدة</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: قاعدة: اليقين لا يزول بالشك"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص القاعدة والشرح</label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="اكتب شرح وتفصيل القاعدة هنا..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مثال تطبيقي (اختياري)</label>
                <input
                  type="text"
                  value={formExample}
                  onChange={(e) => setFormExample(e.target.value)}
                  placeholder="مثال تطبيقي يوضح القاعدة للشباب"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تنبيهات وملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظة أو فائدة إضافية"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow transition-colors"
              >
                {editingRule ? 'حفظ التعديلات' : 'إضافة القاعدة لجميع الأعضاء'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Quiz Modal */}
      {quizModalOpen && (
        <QuizModal onClose={() => setQuizModalOpen(false)} />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!ruleToDeleteId}
        title="تأكيد حذف القاعدة"
        description="هل أنت تأكد من رغبتك في حذف هذه القاعدة العلمية نهائياً من قائمة القواعد؟"
        onConfirm={() => {
          if (ruleToDeleteId) {
            onDeleteRule(ruleToDeleteId);
            showToast('تم حذف القاعدة بنجاح', 'info');
            setRuleToDeleteId(null);
          }
        }}
        onClose={() => setRuleToDeleteId(null)}
      />
    </div>
  );
};

// Internal Quiz Component
const QuizModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const quizQuestions = [
    {
      q: 'ما هو الأصل في صيغة الأمر في الكتاب والسنة؟',
      opts: ['الندب والاستحباب', 'الوجوب والإلزام', 'الإباحة والتخير', 'التحريم'],
      ans: 1,
      exp: 'الأصل في الأمر الوجوب ما لم تصرفه قرينة شرعية معتبرة.'
    },
    {
      q: 'إذا توضأ الشخص بيقين ثم شك هل أحدث أم لا، فما الحكم؟',
      opts: ['يعيد الوضوء فوراً', 'يبني على اليقين وهو الوضوء ولا يلتفت للشك', 'يتيمم احتياطاً', 'تفسد صلاته'],
      ans: 1,
      exp: 'قاعدة: اليقين لا يزول بالشك. اليقين السابق هو الطهارة فلا يزول بالشك العارض.'
    },
    {
      q: 'من قام بالمصطلح أو الفعل في الجملة الفعلية يكون إعرابه:',
      opts: ['مفعول به منصوب', 'فاعل مرفوع', 'مضاف إليه مجرور', 'حال منصوب'],
      ans: 1,
      exp: 'الفاعل اسم مرفوع يدل على من قام بالفعل.'
    }
  ];

  const handleNext = () => {
    if (selectedAnswer === quizQuestions[currentStep].ans) {
      setScore(score + 1);
    }

    if (currentStep + 1 < quizQuestions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative text-right text-slate-800 font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-800 p-1 rounded-full bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                السؤال {currentStep + 1} من {quizQuestions.length}
              </span>
              <span className="text-xs text-slate-400 font-bold">اختبار القواعد</span>
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-4">
              {quizQuestions[currentStep].q}
            </h3>

            <div className="space-y-2 mb-6">
              {quizQuestions[currentStep].opts.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full text-right p-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                    selectedAnswer === idx
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow ${
                selectedAnswer !== null
                  ? 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {currentStep + 1 === quizQuestions.length ? 'إظهار النتيجة' : 'السؤال التالي'}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">أحسنت مبارك!</h3>
            <p className="text-sm text-slate-600 mb-4">
              حققت نتيجة: <strong className="text-amber-600 text-xl">{score}</strong> من {quizQuestions.length}
            </p>
            <p className="text-xs text-slate-500 mb-6">
              استمر في مراجعة وتصفح قواعد اللجنة العلمية دراية لتثبيت المعلومات.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow"
            >
              إغلاق الاختبار
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
