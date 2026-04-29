import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, HelpCircle, FileText, Lock } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '../services/supabaseClient';

const PageLayout = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="min-h-screen pt-32 pb-20 px-8 bg-[#0f0f0f]">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="flex items-center gap-6 border-l-4 border-primary pl-8">
        <Icon className="w-12 h-12 text-primary" />
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{title}</h1>
      </div>
      <div className="bg-[#1a1a1a] border border-white/5 rounded-[3rem] p-12 md:p-16 text-gray-400 leading-loose space-y-8 font-medium">
        {children}
      </div>
    </motion.div>
  </div>
);

export const HelpCenter = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  return (
    <PageLayout title="Help Center" icon={HelpCircle}>
      <h2 className="text-white text-xl font-bold uppercase tracking-widest">Support</h2>
      <p>{settings?.help_center_text || "Welcome to the B3st Sekta Help Center. We are dedicated to providing the best anime experience. If you have issues with playback, account synchronization, or extensions, please check our discord or node status."}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <div className="p-8 bg-[#0f0f0f] rounded-3xl border border-white/5">
          <h3 className="text-primary font-black uppercase text-xs mb-4">Account Sync</h3>
          <p className="text-sm italic">Status: Fully Operational.</p>
        </div>
        <div className="p-8 bg-[#0f0f0f] rounded-3xl border border-white/5">
          <h3 className="text-primary font-black uppercase text-xs mb-4">Stream Status</h3>
          <p className="text-sm italic">1080p Playback Active.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export const DMCA = () => (
  <PageLayout title="DMCA" icon={Shield}>
    <h2 className="text-white text-xl font-bold uppercase tracking-widest">Copyright Policy</h2>
    <p>B3ST SEKTA is an anime discovery platform. We do not host any files on our servers. All content is indexed from third-party services.</p>
    <p>If you have any copyright concerns, please contact the respective hosting providers as we do not have control over external content.</p>
  </PageLayout>
);

export const Terms = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  return (
    <PageLayout title="Terms of Service" icon={FileText}>
      <h2 className="text-white text-xl font-bold uppercase tracking-widest">Usage Agreement</h2>
      <p>{settings?.terms_text || "By using B3st Sekta, you agree to our fair-use policy. We do not host any files on our servers. All content is indexed from 3rd party providers via your configured extensions."}</p>
      <p>Misuse of the platform or attempt to bypass security measures is strictly prohibited.</p>
    </PageLayout>
  );
};

export const Privacy = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  return (
    <PageLayout title="Privacy Policy" icon={Lock}>
      <h2 className="text-white text-xl font-bold uppercase tracking-widest">Data Protection</h2>
      <p>{settings?.privacy_text || "Your privacy is our priority. No logs are kept on our backend regarding your streaming history unless you are logged in for synchronization purposes."}</p>
      <p>Your data is secured using industry-standard encryption and is never shared with third parties.</p>
    </PageLayout>
  );
};
