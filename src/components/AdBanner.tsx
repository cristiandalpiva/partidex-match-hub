import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import demoBanner from '@/assets/demo-ad-banner.jpg';

interface AdBannerProps {
  location: string;
  className?: string;
}

interface Ad {
  id: string;
  image_url: string;
  redirect_url?: string;
}

export const AdBanner = ({ location, className = '' }: AdBannerProps) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('id, image_url, redirect_url')
          .eq('location', location)
          .eq('active', true)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching ad:', error);
          return;
        }

        setAd(data);
      } catch (error) {
        console.error('Error fetching ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [location]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted/20 rounded-lg ${className}`}>
        <div className="h-20 bg-gradient-to-r from-muted/40 to-muted/20 rounded-lg" />
      </div>
    );
  }

  // Use demo banner if no ad is found
  const bannerData = ad || {
    id: 'demo',
    image_url: demoBanner,
    redirect_url: undefined
  };

  const handleClick = () => {
    if (bannerData.redirect_url) {
      window.open(bannerData.redirect_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div 
        className={`relative overflow-hidden rounded-lg glass hover-lift ${bannerData.redirect_url ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <img 
          src={bannerData.image_url} 
          alt="Publicidad" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Subtle branding */}
        <div className="absolute bottom-2 right-2 text-xs text-white/60 bg-black-deep/40 px-2 py-1 rounded backdrop-blur-sm">
          Publicidad
        </div>
      </div>
    </div>
  );
};