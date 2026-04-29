import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-40 bg-surface border-t border-white/5 pt-24 pb-12 px-8">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
        <div className="col-span-1 md:col-span-2 space-y-10">
          <Link to="/home" className="shrink-0 scale-125 origin-left inline-block">
             <h1 className="text-3xl font-black italic tracking-tighter flex items-center">
               <span style={{ color: '#FFFFFF' }}>B3ST</span>
               <span style={{ color: 'var(--primary-color)' }} className="ml-1">SEKTA</span>
             </h1>
          </Link>
          <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-md italic">
             Experience anime like never before in full 1080p HD. Join the largest community of Otakus in the Sekta.
          </p>
          <div className="flex flex-wrap gap-4">
             <span className="bg-background border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-gray-800">Version 4.5 [CHIEFSpec]</span>
          </div>
        </div>
        
        <div className="space-y-10">
          <h4 className="text-xs font-black uppercase tracking-widest text-primary italic">Explore</h4>
          <ul className="space-y-5 text-sm font-bold text-gray-500">
            <li><Link to="/home" className="hover:text-white transition-all">Latest Anime</Link></li>
            <li><Link to="/filter" className="hover:text-white transition-all">Anime Filter</Link></li>
            <li><Link to="/addons" className="hover:text-white transition-all">Extensions</Link></li>
          </ul>
        </div>

        <div className="space-y-10">
          <h4 className="text-xs font-black uppercase tracking-widest text-primary italic">Support</h4>
          <ul className="space-y-5 text-sm font-bold text-gray-500">
            <li><Link to="/help" className="hover:text-white transition-all">Help Center</Link></li>
            <li><Link to="/dmca" className="hover:text-white transition-all">DMCA</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-all">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-all">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-30">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-800">
            <ShieldCheck className="w-4 h-4" />
            Community Safe Platform [Admin: wambuamaxwell696]
         </div>
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-800">
            InfiniteB3st Development © 2026
         </p>
      </div>
    </footer>
  );
}
