import { 
  RuleItem, VocabularyItem, AdhanGuideItem, PrayerStep, 
  SubmissionItem, SiteSettings, UserSession 
} from '../types';
import { 
  initialRules, initialVocabulary, initialAdhanGuide, 
  initialPrayerSteps, initialSubmissions, initialSettings 
} from '../data/initialData';

const KEYS = {
  RULES: 'dirayah_rules_v2',
  VOCABULARY: 'dirayah_vocabulary_v2',
  ADHAN: 'dirayah_adhan_v2',
  PRAYER: 'dirayah_prayer_v2',
  SUBMISSIONS: 'dirayah_submissions_v2',
  SETTINGS: 'dirayah_settings_v1',
  SESSION: 'dirayah_session_v1',
};

// Helper to load or init data
function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data !== null) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
  }
  return defaultValue;
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Session management
  getSession(): UserSession {
    return loadItem<UserSession>(KEYS.SESSION, {
      username: '',
      role: 'guest',
      isLoggedIn: false,
    });
  },

  saveSession(session: UserSession): void {
    saveItem(KEYS.SESSION, session);
  },

  clearSession(): void {
    localStorage.removeItem(KEYS.SESSION);
  },

  // Settings & Passwords
  getSettings(): SiteSettings {
    return loadItem<SiteSettings>(KEYS.SETTINGS, initialSettings);
  },

  saveSettings(settings: SiteSettings): void {
    saveItem(KEYS.SETTINGS, settings);
  },

  verifyPassword(input: string, settings: SiteSettings, username?: string): 'admin' | 'member' | 'invalid' {
    const cleanInput = input.trim();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanMemberPass = settings.memberPasswordHash.trim();
    const cleanAdminPass = settings.adminPasswordHash.trim();

    // Check password match (supports "دراية", "dirayah", "Dirayah" or saved setting)
    const isPasswordValid = 
      cleanInput === cleanAdminPass || 
      cleanInput === cleanMemberPass || 
      cleanInput.toLowerCase() === 'dirayah' || 
      cleanInput === 'دراية';

    if (!isPasswordValid) {
      return 'invalid';
    }

    // Check admin condition: Username must be "لؤي مكاوي" or contain "لؤي"
    const isAdminUsername = cleanUser.includes('لؤي') || cleanUser.includes('loai') || cleanUser.includes('louay');

    if (isAdminUsername) {
      return 'admin';
    }

    return 'member';
  },

  // Rules (القواعد)
  getRules(): RuleItem[] {
    return loadItem<RuleItem[]>(KEYS.RULES, initialRules);
  },

  saveRules(rules: RuleItem[]): void {
    saveItem(KEYS.RULES, rules);
  },

  addRule(rule: Omit<RuleItem, 'id' | 'dateAdded'>): RuleItem {
    const rules = this.getRules();
    const newRule: RuleItem = {
      ...rule,
      id: 'rule-' + Date.now(),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    rules.unshift(newRule);
    this.saveRules(rules);
    return newRule;
  },

  updateRule(updatedRule: RuleItem): void {
    const rules = this.getRules().map((r) => (r.id === updatedRule.id ? updatedRule : r));
    this.saveRules(rules);
  },

  deleteRule(id: string): void {
    const rules = this.getRules().filter((r) => r.id !== id);
    this.saveRules(rules);
  },

  // Vocabulary (الكلمات)
  getVocabulary(): VocabularyItem[] {
    return loadItem<VocabularyItem[]>(KEYS.VOCABULARY, initialVocabulary);
  },

  saveVocabulary(vocab: VocabularyItem[]): void {
    saveItem(KEYS.VOCABULARY, vocab);
  },

  addVocabularyItem(item: Omit<VocabularyItem, 'id'>): VocabularyItem {
    const vocab = this.getVocabulary();
    const newItem: VocabularyItem = {
      ...item,
      id: 'voc-' + Date.now(),
    };
    vocab.unshift(newItem);
    this.saveVocabulary(vocab);
    return newItem;
  },

  updateVocabularyItem(updatedItem: VocabularyItem): void {
    const vocab = this.getVocabulary().map((v) => (v.id === updatedItem.id ? updatedItem : v));
    this.saveVocabulary(vocab);
  },

  deleteVocabularyItem(id: string): void {
    const vocab = this.getVocabulary().filter((v) => v.id !== id);
    this.saveVocabulary(vocab);
  },

  // Adhan (الأذان)
  getAdhanGuides(): AdhanGuideItem[] {
    return loadItem<AdhanGuideItem[]>(KEYS.ADHAN, initialAdhanGuide);
  },

  saveAdhanGuides(guides: AdhanGuideItem[]): void {
    saveItem(KEYS.ADHAN, guides);
  },

  // Prayer Steps (الصلاة)
  getPrayerSteps(): PrayerStep[] {
    return loadItem<PrayerStep[]>(KEYS.PRAYER, initialPrayerSteps);
  },

  savePrayerSteps(steps: PrayerStep[]): void {
    saveItem(KEYS.PRAYER, steps);
  },

  // Member Submissions / Messages (المشاركات والرسائل)
  getSubmissions(): SubmissionItem[] {
    return loadItem<SubmissionItem[]>(KEYS.SUBMISSIONS, initialSubmissions);
  },

  saveSubmissions(subs: SubmissionItem[]): void {
    saveItem(KEYS.SUBMISSIONS, subs);
  },

  addSubmission(sub: Omit<SubmissionItem, 'id' | 'createdAt'> & { status?: 'pending' | 'approved' | 'replied' | 'archived' }): SubmissionItem {
    const subs = this.getSubmissions();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newSub: SubmissionItem = {
      ...sub,
      id: 'sub-' + Date.now(),
      status: sub.status || 'pending',
      createdAt: dateStr,
    };

    subs.unshift(newSub);
    this.saveSubmissions(subs);
    return newSub;
  },

  updateSubmission(updated: SubmissionItem): void {
    const subs = this.getSubmissions().map((s) => (s.id === updated.id ? updated : s));
    this.saveSubmissions(subs);
  },

  deleteSubmission(id: string): void {
    const subs = this.getSubmissions().filter((s) => s.id !== id);
    this.saveSubmissions(subs);
  },

  // Backup System: Export JSON & Import JSON
  exportDataJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      rules: this.getRules(),
      vocabulary: this.getVocabulary(),
      adhan: this.getAdhanGuides(),
      prayer: this.getPrayerSteps(),
      submissions: this.getSubmissions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDataJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.rules) this.saveRules(parsed.rules);
      if (parsed.vocabulary) this.saveVocabulary(parsed.vocabulary);
      if (parsed.adhan) this.saveAdhanGuides(parsed.adhan);
      if (parsed.prayer) this.savePrayerSteps(parsed.prayer);
      if (parsed.submissions) this.saveSubmissions(parsed.submissions);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Failed to parse import JSON', e);
      return false;
    }
  },

  // Reset to Factory Default
  resetToDefault(): void {
    this.saveRules(initialRules);
    this.saveVocabulary(initialVocabulary);
    this.saveAdhanGuides(initialAdhanGuide);
    this.savePrayerSteps(initialPrayerSteps);
    this.saveSubmissions(initialSubmissions);
    this.saveSettings(initialSettings);
  }
};
