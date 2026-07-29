import React, { useState, useEffect } from 'react';
import { 
  UserSession, RuleItem, VocabularyItem, AdhanGuideItem, 
  PrayerStep, SubmissionItem, SiteSettings 
} from './types';
import { StorageService } from './services/storage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { HeroBanner } from './components/HeroBanner';
import { RulesSection } from './components/RulesSection';
import { VocabularySection } from './components/VocabularySection';
import { AdhanSection } from './components/AdhanSection';
import { PrayerSection } from './components/PrayerSection';
import { SubmissionsSection } from './components/SubmissionsSection';
import { AdminDashboard } from './components/AdminDashboard';
import { BookOpen, Layers, Volume2, Shield, MessageSquare, Award, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent Data State
  const [session, setSession] = useState<UserSession>(StorageService.getSession());
  const [rules, setRules] = useState<RuleItem[]>(StorageService.getRules());
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(StorageService.getVocabulary());
  const [adhanGuides, setAdhanGuides] = useState<AdhanGuideItem[]>(StorageService.getAdhanGuides());
  const [prayerSteps, setPrayerSteps] = useState<PrayerStep[]>(StorageService.getPrayerSteps());
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(StorageService.getSubmissions());
  const [settings, setSettings] = useState<SiteSettings>(StorageService.getSettings());

  // Refresh all state from StorageService
  const refreshAllData = () => {
    setSession(StorageService.getSession());
    setRules(StorageService.getRules());
    setVocabulary(StorageService.getVocabulary());
    setAdhanGuides(StorageService.getAdhanGuides());
    setPrayerSteps(StorageService.getPrayerSteps());
    setSubmissions(StorageService.getSubmissions());
    setSettings(StorageService.getSettings());
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    StorageService.clearSession();
    const guestSession: UserSession = { username: '', role: 'guest', isLoggedIn: false };
    setSession(guestSession);
    showToast('تم تسجيل الخروج بنجاح', 'info');
    if (activeTab === 'admin') setActiveTab('home');
  };

  // Rules Handlers
  const handleAddRule = (rule: Omit<RuleItem, 'id' | 'dateAdded'>) => {
    StorageService.addRule(rule);
    setRules(StorageService.getRules());
  };

  const handleUpdateRule = (rule: RuleItem) => {
    StorageService.updateRule(rule);
    setRules(StorageService.getRules());
  };

  const handleDeleteRule = (id: string) => {
    StorageService.deleteRule(id);
    setRules(StorageService.getRules());
  };

  // Vocabulary Handlers
  const handleAddVocabulary = (item: Omit<VocabularyItem, 'id'>) => {
    StorageService.addVocabularyItem(item);
    setVocabulary(StorageService.getVocabulary());
  };

  const handleUpdateVocabulary = (item: VocabularyItem) => {
    StorageService.updateVocabularyItem(item);
    setVocabulary(StorageService.getVocabulary());
  };

  const handleDeleteVocabulary = (id: string) => {
    StorageService.deleteVocabularyItem(id);
    setVocabulary(StorageService.getVocabulary());
  };

  // Submission / Messages Handlers
  const handleAddSubmission = (sub: Omit<SubmissionItem, 'id' | 'createdAt'> & { status?: 'pending' | 'approved' | 'replied' | 'archived' }) => {
    StorageService.addSubmission(sub);
    setSubmissions(StorageService.getSubmissions());
  };

  const handleVoiceAdhanSubmit = (
    title: string,
    senderName: string,
    audioBlobOrUrl: Blob | string | null,
    imageUrl?: string
  ) => {
    const saveSubmission = (audioDataUrl?: string) => {
      StorageService.addSubmission({
        senderName,
        type: 'voice_recording',
        title: title || `المؤذن: ${senderName}`,
        audioDataUrl,
        imageUrl,
        status: 'approved',
      });
      setSubmissions(StorageService.getSubmissions());
    };

    if (audioBlobOrUrl instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveSubmission(reader.result as string);
      };
      reader.readAsDataURL(audioBlobOrUrl);
    } else {
      saveSubmission(audioBlobOrUrl || undefined);
    }
  };

  const handleUpdateSubmission = (sub: SubmissionItem) => {
    StorageService.updateSubmission(sub);
    setSubmissions(StorageService.getSubmissions());
  };

  const handleDeleteSubmission = (id: string) => {
    StorageService.deleteSubmission(id);
    setSubmissions(StorageService.getSubmissions());
  };

  // Settings Handler
  const handleUpdateSettings = (newSettings: SiteSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const wordOfDay = vocabulary.find((v) => v.isWordOfDay) || vocabulary[0];
  const featuredRule = rules[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans dir-rtl flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Main App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        session={session}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        settings={settings}
        pendingCount={pendingCount}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HeroBanner
            onNavigate={setActiveTab}
            rulesCount={rules.length}
            vocabCount={vocabulary.length}
            wordOfDay={wordOfDay}
            featuredRule={featuredRule}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'rules' && (
          <RulesSection
            rules={rules}
            session={session}
            onAddRule={handleAddRule}
            onUpdateRule={handleUpdateRule}
            onDeleteRule={handleDeleteRule}
            showToast={showToast}
            onClose={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularySection
            vocabulary={vocabulary}
            session={session}
            onAddWord={handleAddVocabulary}
            onUpdateWord={handleUpdateVocabulary}
            onDeleteWord={handleDeleteVocabulary}
            showToast={showToast}
            onClose={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'adhan' && (
          <AdhanSection
            adhanGuides={adhanGuides}
            submissions={submissions}
            session={session}
            onSubmitVoice={handleVoiceAdhanSubmit}
            showToast={showToast}
            onClose={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'prayer' && (
          <PrayerSection
            submissions={submissions}
            session={session}
            onAddSubmission={handleAddSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            showToast={showToast}
            onClose={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsSection
            submissions={submissions}
            session={session}
            onSubmit={handleAddSubmission}
            showToast={showToast}
            onClose={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            submissions={submissions}
            rules={rules}
            vocabulary={vocabulary}
            settings={settings}
            onUpdateSubmission={handleUpdateSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onUpdateSettings={handleUpdateSettings}
            onRefreshData={refreshAllData}
            showToast={showToast}
            onClose={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Auth Modal (Login / Admin Login) */}
      <AuthModal
        isOpen={isAuthModalOpen || !session.isLoggedIn}
        isMandatory={!session.isLoggedIn}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        showToast={showToast}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-amber-500/20 text-slate-400 py-10 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black text-lg shadow">
              د
            </div>
            <div>
              <p className="font-black text-amber-400 text-sm">اللجنة العلمية - دراية</p>
              <p className="text-[11px] text-slate-400">منصة العلوم والتأصيل والتعلم التفاعلي</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300 font-bold">
            <button onClick={() => setActiveTab('rules')} className="hover:text-amber-400 transition-colors">القواعد</button>
            <span>•</span>
            <button onClick={() => setActiveTab('vocabulary')} className="hover:text-amber-400 transition-colors">الكلمات</button>
            <span>•</span>
            <button onClick={() => setActiveTab('adhan')} className="hover:text-amber-400 transition-colors">الأذان</button>
            <span>•</span>
            <button onClick={() => setActiveTab('prayer')} className="hover:text-amber-400 transition-colors">الصلاة</button>
            <span>•</span>
            <button onClick={() => setActiveTab('submissions')} className="hover:text-amber-400 transition-colors">شارك معنا</button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-500/50 font-bold text-[11px] transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>دخول الأدمن</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
