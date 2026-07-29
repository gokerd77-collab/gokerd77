import React from 'react';
import { 
  BookOpen, Layers, Volume2, Shield, 
  Award, ArrowLeft
} from 'lucide-react';
import { RuleItem, VocabularyItem } from '../types';

interface HeroBannerProps {
  onNavigate: (tab: string) => void;
  rulesCount: number;
  vocabCount: number;
  wordOfDay?: VocabularyItem;
  featuredRule?: RuleItem;
  onOpenAuth: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onNavigate,
  rulesCount,
  vocabCount,
  wordOfDay,
  featuredRule,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-8">
      {/* Main Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
        {/* Background Decorative Pattern */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl text-right">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight mb-4">
            أهلاً بكم في <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-300 via-amber-400 to-emerald-300">اللجنة العلمية - دِرَايَة</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            منصة لتزكية النفس وتطهير القلوب وتزكية الأخلاق والارتقاء بالروح وفق الكتاب والسنة، وتأصيل المفاهيم العلمية والإيمانية النافعة في السلوك والعبادة.
          </p>
        </div>
      </div>

      {/* Main Sections Grid Cards */}
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          <span>أقسام المنهج العلمي للجنة دراية</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Rules Card */}
          <div
            onClick={() => onNavigate('rules')}
            className="group cursor-pointer bg-white border border-slate-200 hover:border-amber-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-amber-700 transition-colors">
              قسم القواعد
            </h3>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>عرض القواعد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 2. Vocabulary Card */}
          <div
            onClick={() => onNavigate('vocabulary')}
            className="group cursor-pointer bg-white border border-slate-200 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors">
              قسم الكلمات
            </h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>مهارة الإلقاء والكلمات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 3. Adhan Card */}
          <div
            onClick={() => onNavigate('adhan')}
            className="group cursor-pointer bg-white border border-slate-200 hover:border-amber-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-amber-700 transition-colors">
              قسم الأذان
            </h3>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>جدول الأذان</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 4. Prayer Card */}
          <div
            onClick={() => onNavigate('prayer')}
            className="group cursor-pointer bg-white border border-slate-200 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors">
              قسم الصلاة
            </h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>جدول الصلاة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
