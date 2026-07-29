export type UserRole = 'member' | 'admin' | 'guest';

export interface UserSession {
  username: string;
  role: UserRole;
  isLoggedIn: boolean;
}

export interface RuleItem {
  id: string;
  title: string;
  category: 'قواعد لغوية' | 'قواعد فقهية' | 'توجيهات علمية' | 'أنظمة اللجنة';
  content: string;
  example?: string;
  notes?: string;
  dateAdded: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  diacritics?: string;
  meaning: string;
  impact?: string;
  speaker?: string;
  rootWord?: string;
  category: 'مصطلحات شرعية' | 'لغة وأدب' | 'ألفاظ الأذان والصلاة' | 'عام';
  exampleSentence?: string;
  audioText?: string;
  isWordOfDay?: boolean;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface AdhanGuideItem {
  id: string;
  title: string;
  type: 'text' | 'sunan' | 'mistakes' | 'audio_sample';
  content: string;
  audioUrl?: string;
  reciterName?: string;
  bullets?: string[];
}

export interface PrayerStep {
  id: string;
  stepNumber: number;
  title: string;
  ruling: 'ركن' | 'واجب' | 'سنة';
  description: string;
  whatToSay: string;
  commonMistakes?: string;
  imageUrl?: string;
}

export interface SubmissionItem {
  id: string;
  senderName: string;
  type: 'message' | 'voice_recording' | 'study_file' | 'question' | 'imam';
  title: string;
  content?: string;
  audioDataUrl?: string; // base64 or audio blob data
  fileName?: string;
  fileDataUrl?: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'replied' | 'archived';
  replyText?: string;
  score?: number; // evaluation score out of 10 for audio
  createdAt: string;
  isFeatured?: boolean;
}

export interface SiteSettings {
  announcement: string;
  showAnnouncement: boolean;
  memberPasswordHash: string; // default "دراية"
  adminPasswordHash: string;  // default "دراية_123"
  allowGuestSubmissions: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  section: 'rules' | 'vocabulary' | 'adhan' | 'prayer';
}
