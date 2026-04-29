import { getSupabase } from './supabaseClient';

export interface AddonSource {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface StreamLink {
  id: string;
  source: string;
  url: string;
  quality: string;
  status: 'pending' | 'online' | 'offline';
}

/**
 * MASTER ARCHITECT: AddonResolver Engine
 * Bridges the gap between B3ST SEKTA UI and the underlying streaming infrastructure.
 */
export const AddonResolver = {
  /**
   * Fetches the user's enabled addons from Supabase or LocalStorage for guests.
   */
  getEnabledAddons: async (userId: string): Promise<AddonSource[]> => {
    const ADDON_MAP: Record<string, { name: string; description: string }> = {
      'netflix-node': { name: 'Netflix Node', description: 'Ultra-HD Premium Stream' },
      'hianime-core': { name: 'HiAnime Core', description: 'Stable 1080p Mirror' },
      'aniwave-bridge': { name: 'AniWave Bridge', description: 'Global CDN Network' }
    };

    if (userId === 'guest') {
      const localAddons = JSON.parse(localStorage.getItem('sekta_addons') || '[]');
      const results = localAddons.filter((a: any) => a.enabled).map((item: any) => ({
        id: item.manifest_url || item.id,
        name: item.name || 'Custom Node',
        description: item.description || 'Stremio Extension',
        enabled: true
      }));

      // Include built-in default
      results.push({ id: 'hianime-core', name: 'HiAnime Core', description: 'Stable 1080p Mirror', enabled: true });
      return results;
    }

    const supabase = getSupabase();
    const { data: customData } = await supabase
      .from('user_addons')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true);

    const results = (customData || []).map(item => ({
      id: item.manifest_url || item.addon_id,
      name: item.name || 'Custom Node',
      description: item.description || 'Stremio Extension',
      enabled: true
    }));

    // Default node
    results.push({ id: 'hianime-core', name: 'HiAnime Core', description: 'Stable 1080p Mirror', enabled: true });
    
    return results;
  },

  /**
   * Scrapes multiple links from an Add-on and performs a health check (Ping).
   */
  scrapeLinks: async (addonId: string, animeId: number, episode: number): Promise<StreamLink[]> => {
    // If it's a Stremio manifest URL (e.g. starting with http and containing /manifest.json)
    // we use the Stremio resolution protocol
    if (addonId.includes('/manifest.json')) {
      return AddonResolver.resolveStremioStream(addonId, animeId, episode);
    }

    // Default simulated response for built-in test nodes
    const sources = ['GogoServer', 'CloudStream', 'MegaDrive', 'VidStream', 'DirectEdge'];
    const qualities = ['1080p', '720p', '480p'];
    
    const links: StreamLink[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `${addonId}-link-${i}`,
      source: sources[i % sources.length],
      url: `https://test-videos.co.uk/vids/big_buck_bunny.mp4?source=${i}`,
      quality: qualities[i % qualities.length],
      status: 'pending'
    }));

    // Perform silent "Ping" health check
    const verifiedLinks = await Promise.all(links.map(async (link) => {
      try {
        const response = await fetch(link.url, { method: 'HEAD' });
        return { ...link, status: response.ok ? 'online' : 'offline' as any };
      } catch {
        return { ...link, status: 'offline' as any };
      }
    }));

    return verifiedLinks.filter(l => l.status === 'online');
  },

  /**
   * SYNAPTIC RESOLVER: Converts a Stremio Manifest + Metadata into playable streams.
   */
  resolveStremioStream: async (manifestUrl: string, animeId: number, episode: number): Promise<StreamLink[]> => {
    try {
      const baseUrl = manifestUrl.replace('/manifest.json', '');
      
      // We assume Kitsu ID mapping for most anime addons
      // In a real scenario, we'd have a mapping service
      const id = `kitsu:${animeId}:${episode}`;
      const streamUrl = `${baseUrl}/stream/series/${id}.json`;

      const response = await fetch(streamUrl);
      const data = await response.json();

      if (!data.streams) return [];

      return data.streams.map((stream: any, index: number) => {
        // Handle direct URLs vs Infohashes
        let finalUrl = stream.url || stream.externalUrl;
        
        // If it's a torrent infoHash, we'd normally need a bridge like RealDebrid or Peerflix
        // For this implementation, we assume the addon provides a proxy/direct link if available
        if (stream.infoHash && !finalUrl) {
          finalUrl = `https://torrent-to-hls-bridge.sekta.io/${stream.infoHash}/${index}/playlist.m3u8`;
        }

        return {
          id: `stremio-${index}`,
          source: stream.name || stream.title || 'Stremio Node',
          url: finalUrl,
          quality: stream.title?.match(/\d{3,4}p/)?.[0] || '1080p',
          status: 'online'
        };
      });
    } catch (err) {
      console.error('Stremio Resolution Failed:', err);
      return [];
    }
  }
};
