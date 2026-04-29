import { useEffect, useState } from 'react';
import { Anime, jikanService } from '../services/jikan';
import { cn } from '../lib/utils';
import { Star, Zap, Shuffle, Languages, Newspaper, Home as HomeIcon, MessageSquare, MonitorPlay, Film, Tv, PlayCircle, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export function Sidebar() {
  const [topView, setTopView] = useState<Anime[]>([]);
  const [mostPopular, setMostPopular] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const { displayLanguage, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const [top, popular] = await Promise.all([
          jikanService.getTopByPopularity(10),
          jikanService.getTopAiring(10)
        ]);
        setTopView(top);
        setMostPopular(popular);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, []);

  const handleRandom = async () => {
    try {
      const anime = await jikanService.getRandomAnime();
      navigate(`/anime/${anime.mal_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { label: 'Home', icon: HomeIcon, path: '/home' },
    { label: 'Subbed', icon: MessageSquare, path: '/filter?type=subbed' },
    { label: 'Dubbed', icon: Radio, path: '/filter?type=dubbed' },
    { label: 'Movies', icon: Film, path: '/filter?type=movie' },
    { label: 'TV Series', icon: Tv, path: '/filter?type=tv' },
    { label: 'OVAs', icon: PlayCircle, path: '/filter?type=ova' },
    { label: 'ONAs', icon: MonitorPlay, path: '/filter?type=ona' },
  ];

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8" id="platform-sidebar">
      {/* UTILITY ROW */}
      <section className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate('/watch-together')}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-primary hover:text-black p-3 rounded-xl transition-all border border-white/5 group shadow-lg"
        >
          <Zap size={14} className="text-primary group-hover:text-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">W.2.G</span>
        </button>
        <button 
          onClick={handleRandom}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-primary hover:text-black p-3 rounded-xl transition-all border border-white/5 group shadow-lg"
        >
          <Shuffle size={14} className="text-primary group-hover:text-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">Random</span>
        </button>
        <button 
          onClick={toggleLanguage}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-primary hover:text-black p-3 rounded-xl transition-all border border-white/5 group shadow-lg"
        >
          <Languages size={14} className="text-primary group-hover:text-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">{displayLanguage === 'English' ? 'EN' : 'JP'}</span>
        </button>
        <button 
          onClick={() => navigate('/news')}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-primary hover:text-black p-3 rounded-xl transition-all border border-white/5 group shadow-lg"
        >
          <Newspaper size={14} className="text-primary group-hover:text-black" />
          <span className="text-[10px] font-black uppercase tracking-widest">News</span>
        </button>
      </section>

      {/* PRIMARY NAVIGATION */}
      <nav className="flex flex-col gap-1 bg-white/2 rounded-2xl p-2 border border-white/5">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
          >
            <link.icon size={18} className="group-hover:text-primary transition-colors" />
            <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Top View Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-primary uppercase tracking-tighter italic">Top View</h2>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-0.5 rounded bg-white/5">Today</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface animate-pulse rounded-lg" />
            ))
          ) : (
            topView.map((anime, index) => (
              <Link 
                to={`/anime/${anime.mal_id}`}
                key={anime.mal_id}
                className="group flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="text-2xl font-black text-gray-700 group-hover:text-primary transition-colors min-w-[32px] text-center italic">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                
                <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                  <img 
                    src={anime.images.webp.small_image_url} 
                    alt={anime.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                    {displayLanguage === 'English' ? (anime.title_english || anime.title) : anime.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-medium">{anime.type}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <div className="flex items-center gap-0.5 text-primary">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black">{anime.score || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Most Popular Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-primary uppercase tracking-tighter italic">Most Popular</h2>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface animate-pulse rounded-lg" />
            ))
          ) : (
            mostPopular.map((anime, index) => (
              <Link 
                to={`/anime/${anime.mal_id}`}
                key={anime.mal_id}
                className="group flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="text-2xl font-black text-gray-700 group-hover:text-primary transition-colors min-w-[32px] text-center italic">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                
                <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                  <img 
                    src={anime.images.webp.small_image_url} 
                    alt={anime.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                    {displayLanguage === 'English' ? (anime.title_english || anime.title) : anime.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-medium">{anime.type}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <div className="flex items-center gap-0.5 text-primary">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black">{anime.score || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Community/Ads Section placeholder */}
      <section className="bg-gradient-to-br from-primary/20 to-surface p-6 rounded-xl border border-primary/20 relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-lg font-black mb-2 text-white italic">Join the Sekta</h3>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">Connect with millions of Otakus around the world. Exclusive 1080p access.</p>
          <button className="w-full bg-white text-black py-2 rounded-lg text-xs font-black uppercase hover:bg-primary transition-colors">
            Discord Community
          </button>
        </div>
        <div className="absolute -bottom-4 -right-4 text-primary opacity-10 group-hover:opacity-20 transition-opacity">
          <Star size={80} fill="currentColor" />
        </div>
      </section>
    </aside>
  );
}
