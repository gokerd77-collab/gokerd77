import { RuleItem, VocabularyItem, AdhanGuideItem, PrayerStep, SubmissionItem, SiteSettings, QuizQuestion } from '../types';

export const initialRules: RuleItem[] = [];

export const initialVocabulary: VocabularyItem[] = [];

export const initialAdhanGuide: AdhanGuideItem[] = [];

export const initialPrayerSteps: PrayerStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'النيّة وتكبيرة الإحرام',
    ruling: 'ركن',
    description: 'ينوي المصلي بقلبه الصلاة التي يريدها، ثم يستقبل القبلة ويرفع يديه حذو منكبيه أو أذنيه قائلاً: (اللهُ أَكْبَرُ).',
    whatToSay: 'اللهُ أَكْبَرُ',
    commonMistakes: 'النطق بالنية باللسان جهرًا، أو رفع اليدين دون الجزم بالتكبير.'
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'دعاء الاستفتاح وقراءة الفاتحة',
    ruling: 'ركن',
    description: 'يضع يده اليمنى على اليسرى على صدره، ويقول دعاء الاستفتاح، ثم يستعيذ ويبسمل ويقرأ الفاتحة مرتبة مع إخراج الحروف من مخارجها.',
    whatToSay: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ. ثم يستعيذ ويقرأ الفاتحة.',
    commonMistakes: 'ترك قراءة الفاتحة أو عدم الطمأنينة فيها أو العجلة في التلاوة.'
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'الرُّكُوع والاعتدال منه',
    ruling: 'ركن',
    description: 'يكبّر ويركع باسطاً ظهره وجاعلاً رأسه حياله، واضعاً يديه على ركبتيه مفرجتي الأصابع، ثم يرفع رأسه قائلاً: سمع الله لمن حمده.',
    whatToSay: 'في الركوع: سُبْحَانَ رَبِّيَ الْعَظِيمِ (3 مرات). وفي الرفع: سَمِعَ اللهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ.',
    commonMistakes: 'عدم تسوية الظهر في الركوع أو الانحناء السريع دون استقرار العظام.'
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'السُّجُود على الأعضاء السبعة',
    ruling: 'ركن',
    description: 'يهوي ساجداً على سبعة أعضاء: الجبهة مع الأنف، الكفان، الركبتان، وأطراف القدمين، مجافياً عضديه عن جنبيه.',
    whatToSay: 'سُبْحَانَ رَبِّيَ الْأَعْلَى (3 مرات)، والإكثار من الدعاء.',
    commonMistakes: 'رفع أطراف القدمين أو الأنف عن الأرض أثناء السجود.'
  },
  {
    id: 'step-5',
    stepNumber: 5,
    title: 'الجلوس بين السجدتين والتّشَهُّد',
    ruling: 'واجب',
    description: 'يجلس مفترشاً رجله اليسرى وناصباً اليمنى، ويقول رب اغفر لي، ثم يسجد الثانية. وفي الجلسة الأخيرة يقرأ التشهد والصلاة الإبراهيمية.',
    whatToSay: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ... والصلاة على النبي ﷺ.',
    commonMistakes: 'الإسراع في التشهد الأول وعدم الطمأنينة في الجلوس بين السجدتين.'
  }
];

export const initialQuizQuestions: QuizQuestion[] = [];

export const initialSubmissions: SubmissionItem[] = [];

export const initialSettings: SiteSettings = {
  announcement: 'مرحباً بكم في المنصة العلمية للجنة دراية - نرحب بمشاركاتكم وأسئلتكم واستفساراتكم!',
  showAnnouncement: true,
  memberPasswordHash: 'دراية',
  adminPasswordHash: 'دراية',
  allowGuestSubmissions: true
};
