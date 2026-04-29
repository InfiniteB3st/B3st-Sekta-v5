import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Upload, Shield, Loader2, Database, FileJson, 
  CheckCircle2, Eye, EyeOff, Trash2, Clock, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../services/supabaseClient';
import { cn } from '../lib/utils';

type WatchStatus = 'Watching' | 'On Hold' | 'Plan to Watch' | 'Dropped' | 'Completed';

const CATEGORIES: WatchStatus[] = ['Watching', 'On Hold', 'Plan to Watch', 'Dropped', 'Completed'];

export default function ListManager() {
  const { user, profile } = useAuth();
  const supabase = getSupabase();
  const [activeCategory, setActiveCategory] = useState<WatchStatus>('Watching');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [malUsername, setMalUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(profile?.is_public !== false);

  useEffect(() => {
    loadWatchlist();
  }, [activeCategory, user]);

  const loadWatchlist = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', activeCategory)
        .order('updated_at', { ascending: false });
      if (data) setItems(data);
    } catch (err) {
      console.error('Watchlist Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (animeId: number) => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase
        .from('user_lists')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', animeId);
      if (!error) setItems(prev => prev.filter(i => i.anime_id !== animeId));
    } catch (err) {
      console.error('Delete Node Failure:', err);
    }
  };

  const togglePrivacy = async () => {
    if (!user || !supabase) return;
    const next = !isPublic;
    setIsPublic(next);
    await supabase.from('profiles').update({ is_public: next }).eq('id', user.id);
  };

  const handleMALImport = async () => {
    if (!malUsername || !user || !supabase) return;
    setIsImporting(true);
    setStatus('Connecting to Service...');
    
    try {
      const response = await fetch(`https://api.jikan.moe/v4/users/${malUsername}/animelist`);
      if (!response.ok) throw new Error('Could not find user.');
      
      const json = await response.json();
      const malList = json.data || [];
      
      setStatus(`Importing ${malList.length} Anime...`);

      const statusMap: Record<string, WatchStatus> = {
        'watching': 'Watching',
        'completed': 'Completed',
        'on_hold': 'On Hold',
        'dropped': 'Dropped',
        'plan_to_watch': 'Plan to Watch'
      };

      for (const item of malList) {
        await supabase.from('user_lists').upsert({
          user_id: user.id,
          anime_id: item.anime.mal_id,
          status: statusMap[item.status] || 'Plan to Watch',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,anime_id' });
      }
      
      setStatus('Import Successful');
      loadWatchlist();
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!user || !supabase) return;
    const { data: watchlist } = await supabase.from('user_lists').select('*').eq('user_id', user.id);
    const { data: history } = await supabase.from('watch_history').select('*').eq('user_id', user.id);
    
    const blob = new Blob([JSON.stringify({ watchlist, history }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sekta_export_${profile?.username || 'user'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-16">
      {/* Category Engine */}
      <div className="space-y-8">
        <div className="flex flex-wrap gap-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                activeCategory === cat ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]" : "bg-white/5 border-white/5 text-gray-600 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-[#0f0f0f] rounded-[4rem] p-10 border-4 border-white/5 min-h-[500px]">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-[400px] gap-6">
                <Loader2 className="animate-spin text-primary" size={40} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 animate-pulse">Syncing Watchlist Nodes...</span>
             </div>
           ) : items.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.anime_id} className="bg-white/3 border border-white/5 p-6 rounded-[2.5rem] flex gap-6 group hover:border-primary/20 transition-all">
                     <div className="w-20 h-28 bg-black rounded-2xl overflow-hidden flex-shrink-0 relative">
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                           <Database size={24} className="text-primary/10" />
                        </div>
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Play size={20} className="text-black" />
                        </div>
                     </div>
                     <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-1">
                           <h4 className="text-white font-black uppercase text-xs tracking-tight">Anime ID: {item.anime_id}</h4>
                           <span className="text-primary text-[8px] font-black uppercase tracking-[0.4em] italic">{item.status}</span>
                        </div>
                        <button 
                          onClick={() => removeItem(item.anime_id)}
                          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-[400px] space-y-10 opacity-10">
                <Database size={80} />
                <div className="text-center space-y-2">
                   <p className="text-sm font-black uppercase tracking-[0.4em]">Node Cluster Empty</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest">No data mapped to this category status.</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Sync & Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t border-white/5">
        <div className="space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                 <Upload className="text-primary" size={20} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Node Sync Protocol</h4>
           </div>
           <div className="bg-[#0f0f0f] border border-white/5 p-12 rounded-[3.5rem] space-y-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 ml-4">MyAnimeList Identifier</label>
                 <input
                   type="text"
                   placeholder="MAL USERNAME"
                   value={malUsername}
                   onChange={e => setMalUsername(e.target.value)}
                   className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-white font-black tracking-[0.2em] outline-none focus:border-primary transition-all uppercase"
                 />
              </div>
              <button 
                onClick={handleMALImport}
                disabled={isImporting || !malUsername}
                className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                 {isImporting ? <Loader2 className="animate-spin" /> : <Shield size={24} />}
                 {isImporting ? 'Connecting...' : 'Authorize Global Sync'}
              </button>
           </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                 <Download className="text-primary" size={20} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Security & Privacy</h4>
           </div>
           <div className="bg-[#0f0f0f] border border-white/5 p-12 rounded-[3.5rem] space-y-10">
              <div className="flex items-center justify-between p-8 bg-black/40 border border-white/5 rounded-3xl">
                 <div className="flex items-center gap-6">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", isPublic ? "bg-primary/20 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-gray-500")}>
                        {isPublic ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>
                    <div className="space-y-1">
                       <span className="block text-[10px] font-black uppercase tracking-widest text-white">Public Visibility</span>
                       <span className="block text-[8px] font-black uppercase tracking-widest text-gray-700">{isPublic ? 'Visible to Network' : 'Isolated Node'}</span>
                    </div>
                 </div>
                 <button 
                   onClick={togglePrivacy}
                   className={cn("w-16 h-10 rounded-full relative transition-all duration-500", isPublic ? "bg-primary shadow-[0_0_20px_var(--primary)]" : "bg-white/5 border border-white/10")}
                 >
                    <div className={cn("absolute top-1.5 w-6 h-6 rounded-full transition-all duration-500", isPublic ? "right-1.5 bg-black" : "left-1.5 bg-gray-700")} />
                 </button>
              </div>
              <button 
                onClick={handleExportJSON} 
                className="w-full bg-white/5 border border-white/10 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-white flex items-center justify-center gap-4 hover:bg-white/10 transition-all"
              >
                <FileJson size={24} />
                Export Node Data (.JSON)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
