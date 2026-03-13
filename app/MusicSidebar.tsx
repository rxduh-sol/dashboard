"use client";
import React, { useRef, useState } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

export default function MusicSidebar() {
  const playerRef = useRef<YouTubePlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playlist = [
    { title: "Break Up", artist: "Jugoslavya 1991", videoId: "odChfqMZccA", color: "#dc2626" },
    { title: "Neka Ljubi Se", artist: "Yugoslavia Dreaming", videoId: "DAPsIhTHhaY", color: "#2563eb" },
    { title: "Jadna Bosno", artist: "Miro Semberac", videoId: "HirR7mTZIwI", color: "#c026d3" },
    { title: "Thompson", artist: "Bojna Cavoglave", videoId: "pfUCdsLgr4Y", color: "#ea580c" },
    { title: "Oj Alija Aljo", artist: "Koridor", videoId: "6dqs87wcATE", color: "#16a34a" },
    { title: "Serbia Strong", artist: "Accordian Guy", videoId: "chA5IiTB4wg", color: "#7c3aed" },
    { title: "Bonanska Artiljeria", artist: "Bosnian Patriot", videoId: "GW6GSa14xXI", color: "#db2777" },
    { title: "Tata Zlocinac Iz Rata", artist: "Serb", videoId: "l2dKsu5EUkk", color: "#854d0e" },
  ];

  const currentTrack = playlist[currentTrackIndex];
  const onPlayerReady = (event: any) => { playerRef.current = event.target; };
  
  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => { 
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length); 
    setIsPlaying(true); 
  };
  
  const prevTrack = () => { 
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length); 
    setIsPlaying(true); 
  };

  return (
    <div className="rounded-[32px] p-5 flex items-center gap-5 border border-white/40 bg-white/10 backdrop-blur-2xl shadow-lg w-full max-w-sm">
      
      {/* Vinyl Section with SPINNING SHINE */}
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
        <div 
          className={`absolute w-full h-full rounded-full bg-zinc-950 border-[3px] border-zinc-900 overflow-hidden shadow-2xl ${isPlaying ? 'animate-spin' : ''}`}
          style={{ 
            animationDuration: '3s',
            backgroundImage: 'repeating-radial-gradient(circle, #18181b, #18181b 1px, #222226 2px, #18181b 3px)',
          }}
        >
          {/* THE SPINNING SHINE: Dynamic light reflection */}
          <div className="absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_160deg,white_180deg,transparent_200deg,transparent_340deg,white_360deg)]" />
          
          {/* Record Label */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-white/20 z-10"
            style={{ 
              backgroundColor: currentTrack.color,
              boxShadow: `inset 0 0 8px rgba(0,0,0,0.4), 0 0 12px ${currentTrack.color}55`
            }} 
          />
        </div>
        {/* Spindle */}
        <div className="absolute w-1.5 h-1.5 bg-zinc-800 rounded-full z-20 border border-black/50" />
      </div>

      {/* Info & Controls */}
      <div className="flex flex-col justify-center overflow-hidden flex-grow">
        <div className="mb-3">
          <h3 className="font-black text-sm text-zinc-900 truncate tracking-tight">{currentTrack.title}</h3>
          <p className="text-[9px] font-black text-zinc-900 opacity-30 uppercase tracking-[0.2em] mt-0.5">{currentTrack.artist}</p>
        </div>
        
        <div className="flex items-center gap-5 text-zinc-900">
          <button onClick={prevTrack} className="opacity-30 hover:opacity-100 transition-all active:scale-90">
            <SkipBack size={18} fill="currentColor" strokeWidth={0} />
          </button>
          
          <button onClick={togglePlay} className="hover:scale-110 active:scale-95 transition-all">
            {isPlaying ? (
              <Pause size={28} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={28} fill="currentColor" strokeWidth={0} />
            )}
          </button>
          
          <button onClick={nextTrack} className="opacity-30 hover:opacity-100 transition-all active:scale-90">
            <SkipForward size={18} fill="currentColor" strokeWidth={0} />
          </button>
        </div>
      </div>

      <div className="hidden">
        <YouTube 
          videoId={currentTrack.videoId} 
          opts={{ playerVars: { autoplay: isPlaying ? 1 : 0, controls: 0, modestbranding: 1 } }} 
          onReady={onPlayerReady} 
          onEnd={nextTrack}
        />
      </div>
    </div>
  );
}