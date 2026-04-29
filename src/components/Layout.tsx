import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, Bell, LogOut, Settings as Gear, ShieldCheck, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import DevMode from './DevMode';

export function Layout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDevOpen, setIsDevOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Standard Casing Only (Remove uppercase restriction is already handled by default input behavior, but we ensure no toUpperCase() is called)
      navigate(`/filter?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isAuthPage = location.pathname === '/auth' || location.pathname === '/setup' || location.pathname === '/login' || location.pathname === '/finish-setup';

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-white">
      {/* Professional Sticky Header */}
      {!isAuthPage && (
        <header className="glass-header h-20 flex items-center shadow-xl">
          <div className="max-w-[1700px] w-full mx-auto px-6 md:px-12 flex items-center justify-between gap-12">
            <Link to="/home" className="shrink-0 flex items-center gap-2">
               <h1 className="text-3xl font-black italic tracking-tighter flex items-center leading-none">
                 <span style={{ color: '#FFFFFF' }}>B3ST</span>
                 <span style={{ color: 'var(--primary-color)' }} className="ml-1">SEKTA</span>
               </h1>
            </Link>

            {/* Clean Modern Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group hidden sm:block">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search anime..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-16 pr-6 text-sm font-bold tracking-widest focus:outline-none focus:border-primary/40 transition-all placeholder:text-gray-800"
              />
            </form>

            <div className="flex items-center gap-6 shrink-0">
              <nav className="hidden lg:flex items-center gap-8 mr-4">
                 <Link to="/home" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all">Home</Link>
                 <Link to="/filter" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all">Filter</Link>
                 <Link to="/addons" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all">Extensions</Link>
                 
                 {user?.email === 'wambuamaxwell696@gmail.com' && (
                   <button 
                     onClick={() => setIsDevOpen(true)}
                     className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic hover:scale-105 transition-all bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 flex items-center gap-2"
                   >
                     <Terminal size={12} /> [ DEV MODE ]
                   </button>
                 )}
              </nav>

              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-700 hover:text-primary transition-all relative">
                  <Bell size={20} />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#0f0f0f]" />
                </button>
                
                <Link to="/profile" className="p-2 text-gray-700 hover:text-primary transition-all">
                  <Gear size={20} />
                </Link>

                <div className="h-8 w-px bg-white/5 mx-2" />
                
                {user ? (
                  <div className="relative group">
                    <Link 
                      to="/profile" 
                      className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 hover:border-primary transition-all bg-surface flex items-center justify-center p-0.5"
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <User size={18} className="text-primary" />
                        </div>
                      )}
                    </Link>
                    
                    {/* DROP DOWN */}
                    <div className="absolute top-full right-0 mt-4 w-64 bg-[#1a1a1a] border border-white/5 rounded-3xl shadow-3xl py-4 flex flex-col scale-0 group-hover:scale-100 origin-top-right transition-all z-50">
                       <Link to="/profile" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:bg-white/5 flex items-center gap-4 transition-all">
                          <User size={16} /> Profile
                       </Link>
                       <Link to={`/profile?tab=account`} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:bg-white/5 flex items-center gap-4 transition-all">
                          Edit Profile
                       </Link>
                       <Link to="/home" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:bg-white/5 flex items-center gap-4 transition-all">
                          Continue Watching
                       </Link>
                       <Link to="/profile?tab=watchlist" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:bg-white/5 flex items-center gap-4 transition-all">
                          Bookmarks
                       </Link>
                       <Link to="/profile?tab=settings" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary hover:bg-white/5 flex items-center gap-4 transition-all">
                          Settings
                       </Link>
                       <div className="h-px bg-white/5 my-2" />
                       <button onClick={() => signOut()} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 flex items-center gap-4 transition-all">
                          <LogOut size={16} /> Logout
                       </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/auth')}
                    className="hianime-btn-yellow text-[10px] py-2 px-6"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto pt-10">
        {children}
      </main>

      {!isAuthPage && <Footer />}

      <DevMode isOpen={isDevOpen} onClose={() => setIsDevOpen(false)} />
    </div>
  );
}
