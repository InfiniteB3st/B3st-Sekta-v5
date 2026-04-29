import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Palette, LogOut, Save, Camera, ShieldCheck, Mail, Database, 
  RefreshCw, Loader2, Lock, Chrome, Link as LinkIcon, AlertTriangle,
  History, Eye, Clock, Settings as SettingsIcon, Globe, Monitor, Zap,
  SkipForward, Volume2, Languages, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getSupabase, updateUserEmail, updateUserPassword, updateUsername, uploadAvatar,
  syncWatchHistory 
} from '../services/supabaseClient';
import ListManager from '../components/ListManager';
import { cn } from '../lib/utils';

const ACCENT_COLORS = [
  '#ffb11b', '#ff4757', '#2ed573', '#1e90ff', '#a4b0be', '#9b59b6', '#ffffff'
];

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  // Settings State
  const [autoSkip, setAutoSkip] = useState(localStorage.getItem('sekta_autoskip') === 'true');
  const [audioPref, setAudioPref] = useState(localStorage.getItem('sekta_audio') || 'sub');

  useEffect(() => {
    if (profile) setNewUsername(profile.username);
    if (user) setNewEmail(user.email || '');
    loadHistory();
  }, [profile, user]);

  useEffect(() => {
    localStorage.setItem('sekta_autoskip', String(autoSkip));
  }, [autoSkip]);

  useEffect(() => {
    localStorage.setItem('sekta_audio', audioPref);
  }, [audioPref]);

  const loadHistory = async () => {
    if (user) {
      const { data } = await getSupabase()
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (data) setHistory(data);
    } else {
      const local = JSON.parse(localStorage.getItem('sekta_history') || '[]');
      setHistory(local);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      await uploadAvatar(user.id, file);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Identity updated.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSecurityUpdate = async (type: 'email' | 'password') => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (type === 'email') await updateUserEmail(newEmail);
      else await updateUserPassword(newPassword);
      setMessage({ type: 'success', text: 'Security updated.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'account', icon: User, label: 'Account' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'watchlist', icon: Database, label: 'Watchlist' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-40 px-6 md:px-12 bg-[#0f0f0f]">
      <div className="max-w-[1500px] mx-auto space-y-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-16">
          <div className="space-y-6">
             <div className="flex items-center gap-4 text-primary">
                <ShieldCheck className="w-8 h-8" />
                <span className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-500">Sovereign_Dashboard</span>
             </div>
             <h1 className="text-8xl font-black italic uppercase tracking-tighter text-white">PROFILE.EXE</h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-10 py-4 rounded-3xl flex items-center gap-4">
             <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                    <User size={24} className="text-primary" />
                </div>
                {user?.email_confirmed_at && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0f0f0f] flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-white" />
                    </div>
                )}
             </div>
             <div className="space-y-1">
                <span className="block text-[8px] font-black text-gray-700 uppercase tracking-widest leading-none">Security_Status</span>
                <span className="block text-xs font-bold text-white uppercase italic">{user?.email_confirmed_at ? 'Verified' : 'Unverified'}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-20">
          {/* Navigation */}
          <div className="space-y-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-8 p-10 rounded-[3rem] transition-all border-2",
                  activeTab === tab.id 
                    ? 'bg-primary border-primary text-black shadow-2xl scale-[1.05]' 
                    : 'bg-[#1a1a1a] border-white/5 text-gray-600 hover:text-white'
                )}
              >
                <tab.icon className={cn("w-8 h-8", activeTab === tab.id ? 'text-black' : 'text-primary')} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{tab.label}</span>
              </button>
            ))}
            <button onClick={() => signOut()} className="w-full mt-10 p-8 bg-red-500/10 text-red-500 rounded-[3rem] text-[10px] font-black uppercase tracking-[0.4em] border-2 border-red-500/20">Logout</button>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3">
             <div className="bg-[#1a1a1a] border-2 border-white/5 rounded-[4rem] p-16 md:p-24 relative overflow-hidden min-h-[600px]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] rounded-full -mr-[300px] -mt-[300px]" />
                
                <AnimatePresence mode="wait">
                   <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                   >
                     {activeTab === 'account' && (
                       <div className="space-y-16">
                         <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="relative group cursor-pointer">
                               <label className="cursor-pointer">
                                  <div className="w-48 h-48 rounded-[3.5rem] bg-[#0f0f0f] border-8 border-white/5 overflow-hidden flex items-center justify-center">
                                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={40} className="text-white/10" />}
                                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      {isUploading ? <Loader2 className="animate-spin text-black" /> : <Camera className="text-black" size={32} />}
                                    </div>
                                  </div>
                                  <input type="file" className="hidden" onChange={handleAvatarUpload} />
                               </label>
                            </div>
                            <div className="space-y-4">
                               <h2 className="text-4xl font-black text-white italic uppercase">Account Info</h2>
                               <p className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">Update your node identity and security credentials.</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Username</label>
                               <input value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-white font-black outline-none focus:border-primary transition-all" />
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">New Password</label>
                               <div className="flex gap-4">
                                 <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="flex-1 bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-white font-black outline-none focus:border-primary transition-all" placeholder="********" />
                                 <button onClick={() => handleSecurityUpdate('password')} className="bg-primary px-8 rounded-3xl text-black transition-transform active:scale-95"><Save size={20} /></button>
                               </div>
                            </div>
                         </div>
                         
                         {message && (
                           <div className={cn("p-6 rounded-3xl border text-[10px] font-black uppercase tracking-widest", message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500")}>
                             {message.text}
                           </div>
                         )}

                         <button onClick={async () => {
                           setIsSaving(true);
                           await updateUsername(user?.id!, newUsername);
                           await refreshProfile();
                           setIsSaving(false);
                           setMessage({ type: 'success', text: 'Profile Updated.' });
                         }} className="w-full bg-primary py-8 rounded-[2.5rem] font-black uppercase tracking-[0.6em] text-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Identity</button>
                       </div>
                     )}

                     {activeTab === 'history' && (
                       <div className="space-y-12">
                          <div className="flex items-center justify-between">
                             <h2 className="text-4xl font-black text-white italic uppercase">Watch History</h2>
                             <button onClick={() => {
                               localStorage.removeItem('sekta_history');
                               setHistory([]);
                             }} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Clear Local Cache</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {history.length > 0 ? history.map((item, idx) => (
                              <div key={idx} className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border border-white/5 flex gap-8 group hover:border-primary/20 transition-all">
                                 <div className="w-24 h-32 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0">
                                    <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                                 </div>
                                 <div className="flex-1 space-y-4">
                                    <h4 className="text-white font-black uppercase text-sm line-clamp-1">{item.anime_title}</h4>
                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-700">
                                       <span className="text-primary">EP {item.episode_id || item.last_episode || 0}</span>
                                       <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                       <div className="h-full bg-primary" style={{ width: `${(item.progress_ms / (item.duration_ms || 1440000)) * 100}%` }} />
                                    </div>
                                 </div>
                              </div>
                            )) : (
                              <div className="col-span-2 py-40 text-center space-y-6">
                                 <History size={60} className="mx-auto text-white/5" />
                                 <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">No history packets found in local storage or cloud.</p>
                              </div>
                            )}
                          </div>
                       </div>
                     )}

                     {activeTab === 'watchlist' && (
                       <div className="space-y-12">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h2 className="text-4xl font-black text-white italic uppercase">Watchlist Engine</h2>
                            <div className="flex items-center gap-4 bg-[#0f0f0f] border border-white/5 p-2 rounded-2xl w-fit">
                               <button className="px-6 py-2 rounded-xl bg-primary text-black text-[9px] font-black uppercase tracking-widest transition-all">Public</button>
                               <button className="px-6 py-2 rounded-xl text-gray-700 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Private</button>
                            </div>
                          </div>
                          <ListManager />
                       </div>
                     )}

                     {activeTab === 'settings' && (
                       <div className="space-y-16">
                          <div className="space-y-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Playback Logic</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <button onClick={() => setAutoSkip(!autoSkip)} className={cn("p-8 rounded-[2.5rem] border-2 flex items-center justify-between transition-all", autoSkip ? "border-primary bg-primary/5 text-primary" : "border-white/5 bg-black/40 text-gray-600")}>
                                  <div className="flex items-center gap-4">
                                     <SkipForward size={20} />
                                     <span className="text-[10px] font-black uppercase tracking-widest">Auto Skip Intro</span>
                                  </div>
                                  <div className={cn("w-4 h-4 rounded-full border-4 transition-all", autoSkip ? "bg-primary border-primary shadow-[0_0_10px_var(--primary)]" : "border-gray-800")} />
                               </button>
                               <div className="p-8 rounded-[2.5rem] border-2 border-white/5 bg-black/40 flex items-center justify-between text-gray-600">
                                   <div className="flex items-center gap-4">
                                      <Zap size={20} />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Auto Play</span>
                                   </div>
                                   <div className="w-10 h-6 bg-primary/20 rounded-full relative">
                                      <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                                   </div>
                               </div>
                            </div>
                          </div>

                          <div className="space-y-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Audio & Language</h3>
                            <div className="grid grid-cols-3 gap-6">
                               {['sub', 'dub', 'raw'].map(p => (
                                 <button key={p} onClick={() => setAudioPref(p)} className={cn("p-6 rounded-3xl border-2 font-black uppercase text-[10px] tracking-widest transition-all", audioPref === p ? "border-primary bg-primary/5 text-primary" : "border-white/5 text-gray-700 hover:border-white/10")}>
                                    {p}
                                 </button>
                               ))}
                            </div>
                          </div>

                          <div className="space-y-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Interface Prefs (Global Accent)</h3>
                            <div className="grid grid-cols-4 md:grid-cols-7 gap-6">
                               {ACCENT_COLORS.map(c => (
                                 <button key={c} onClick={() => {
                                   document.documentElement.style.setProperty('--primary', c);
                                   localStorage.setItem('sekta_accent', c);
                                   refreshProfile();
                                 }} className={cn("w-full aspect-square rounded-2xl shadow-2xl border-4 transition-all", profile?.accent_color === c ? "border-white scale-110" : "border-transparent opacity-40 hover:opacity-100 hover:scale-105")} style={{ backgroundColor: c }} />
                               ))}
                            </div>
                          </div>
                          
                          <div className="p-16 bg-[#0f0f0f] border border-white/5 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-12 group">
                             <div className="space-y-4 text-center md:text-left">
                                <h4 className="text-white font-black uppercase text-4xl italic tracking-tighter">
                                  B3ST <span className="text-primary italic">SEKTA</span>
                                </h4>
                                <p className="text-[10px] font-black text-gray-800 uppercase tracking-[0.4em] italic underline decoration-primary underline-offset-8">Interface v.4.2 (Stable)</p>
                             </div>
                             <Monitor className="text-primary w-20 h-20 shadow-2xl opacity-10 group-hover:opacity-40 transition-opacity" />
                          </div>
                       </div>
                     )}
                   </motion.div>
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
