import React, { useState } from 'react';
import { 
  BookOpen, Shield, MessageSquare, Volume2, 
  Menu, X, UserCheck, Lock, LogOut, Award, Layers
} from 'lucide-react';
import { UserSession, SiteSettings } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: UserSession;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  settings: SiteSettings;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  session,
  onOpenAuthModal,
  onLogout,
  settings,
  pendingCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Award },
    { id: 'rules', label: 'القواعد', icon: BookOpen },
    { id: 'vocabulary', label: 'الكلمات', icon: Layers },
    { id: 'adhan', label: 'الأذان', icon: Volume2 },
    { id: 'prayer', label: 'الصلاة', icon: Shield },
    { id: 'submissions', label: 'تفاعل وشارِك', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/20 text-white shadow-xl">
      {/* Announcement Bar */}
      {settings.showAnnouncement && settings.announcement && (
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-50 text-xs py-1.5 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{settings.announcement}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Committee Title */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-700 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                  اللجنة العلمية
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-sm sm:text-base font-black px-3 py-1 rounded-full border border-amber-500/30 shadow-sm">
                  دِرَايَة
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Auth & Admin Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Admin Dashboard Button */}
            {session.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg ring-2 ring-emerald-400/50'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/90'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>لوحة التحكم (الأدمن)</span>
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                    {pendingCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500/50 hover:text-amber-300 transition-all"
                title="دخول الأدمن / غيّر الاسم"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>دخول المسؤول</span>
              </button>
            )}

            {/* Session Indicator */}
            {session.isLoggedIn ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 py-1.5 px-3 rounded-xl">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-200">
                    {session.username || 'عضو دراية'}
                  </p>
                  <p className="text-[10px] text-amber-400/90">
                    {session.role === 'admin' ? 'مشرف اللجنة' : 'عضو مفعل'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="mr-1 text-slate-400 hover:text-rose-400 transition-colors p-1"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md"
              >
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenAuthModal}
              className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>دخول</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-amber-500/20 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-right transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {session.role === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-extrabold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 mt-2"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>لوحة التحكم (الأدمن)</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingCount} رسالة
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
