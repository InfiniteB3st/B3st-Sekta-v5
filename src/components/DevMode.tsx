import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, ShieldAlert, Cpu, Settings, Activity } from 'lucide-react';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '../services/supabaseClient';

interface DevModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevMode({ isOpen, onClose }: DevModeProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEskaMila, setShowEskaMila] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      const savedMila = localStorage.getItem('sekta_eska_mila_enabled');
      setShowEskaMila(savedMila !== 'false');
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getSiteSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      localStorage.setItem('sekta_eska_mila_enabled', String(showEskaMila));
      onClose();
    } catch (err) {
      console.error(err);
      alert('Handshake Sync Failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl h-full bg-[#0a0a0a] border-l border-white/5 p-12 overflow-y-auto custom-scrollbar"
      >
        <div className="flex flex-col gap-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-primary">
               <ShieldAlert size={32} />
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">[ DEV MODE ]</h2>
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-primary">
                <Cpu size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Kernel Configuration</span>
             </div>
             <p className="text-[11px] text-gray-500 font-medium italic underline decoration-primary/20 underline-offset-8 leading-relaxed">
                Elevated privileges detected. Any changes made here are pushed directly to the site_settings table in Supabase.
             </p>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-6">
               <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-800">Booting Interface...</span>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Passcode Security */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-gray-700 tracking-widest flex items-center gap-3">
                   <Settings size={14} /> Site Passcode (Gatekeeper)
                </label>
                <input 
                  type="text"
                  value={settings?.passcode || ''}
                  onChange={(e) => setSettings(s => s ? {...s, passcode: e.target.value} : null)}
                  className="w-full bg-white/2 border border-white/5 rounded-2xl p-6 text-white font-black italic outline-none focus:border-primary/40 transition-all"
                />
              </div>

              {/* Bot Toggle */}
              <div className="space-y-6 bg-white/2 p-10 rounded-[2rem] border border-white/5">
                <div className="flex items-center justify-between">
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white italic">Eska Mila Protocol</h4>
                      <p className="text-[9px] text-gray-700 uppercase font-bold tracking-widest leading-relaxed">Toggle the dynamic diagnostic assistant</p>
                   </div>
                   <button 
                     onClick={() => setShowEskaMila(!showEskaMila)}
                     className={`w-16 h-8 rounded-full relative transition-all duration-500 ${showEskaMila ? 'bg-primary' : 'bg-gray-900'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 rounded-full bg-black transition-all ${showEskaMila ? 'left-9' : 'left-1'}`} />
                   </button>
                </div>
              </div>

              {/* Text Editors */}
              {[
                { key: 'help_center_text', label: 'Help Center Contents' },
                { key: 'terms_text', label: 'Terms of Use' },
                { key: 'privacy_text', label: 'Privacy Policy' }
              ].map(field => (
                <div key={field.key} className="space-y-6">
                  <label className="text-[10px] font-black uppercase text-gray-700 tracking-widest flex items-center gap-3">
                     <Activity size={14} /> {field.label}
                  </label>
                  <textarea 
                    value={(settings as any)?.[field.key] || ''}
                    onChange={(e) => setSettings(s => s ? {...s, [field.key]: e.target.value} : null)}
                    className="w-full h-48 bg-white/2 border border-white/5 rounded-2xl p-6 text-white font-medium text-xs leading-relaxed outline-none focus:border-primary/40 transition-all custom-scrollbar shrink-0"
                  />
                </div>
              ))}

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full h-24 bg-primary text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /> : <>Commit Handshake <Save size={24} /></>}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
