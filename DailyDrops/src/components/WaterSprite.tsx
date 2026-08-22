import React from 'react';
import { AvatarId } from '../types';

interface WaterSpriteProps {
  avatar?: AvatarId;
  mood?: 'cheering' | 'dancing' | 'thirsty' | 'drinking' | 'sparkle';
  size?: number;
  className?: string;
  showRipples?: boolean;
}

export const WaterSprite: React.FC<WaterSpriteProps> = ({
  avatar = 'mint-sprite',
  mood = 'cheering',
  size = 180,
  className = '',
  showRipples = true,
}) => {
  // Color palette definitions based on avatar type
  const colorMap = {
    'mint-sprite': {
      primary: '#6ee7b7', // Mint 300
      secondary: '#34d399', // Mint 400
      accent: '#059669', // Emerald 600
      highlight: '#d1fae5', // Mint 100
      eye: '#064e3b', // Deep green-slate
      blush: '#fca5a5',
      glow: 'rgba(52, 211, 153, 0.4)',
      shadow: 'rgba(5, 150, 105, 0.15)',
    },
    'blue-sprite': {
      primary: '#60a5fa', // Blue 400
      secondary: '#3b82f6', // Blue 500
      accent: '#1d4ed8', // Blue 700
      highlight: '#dbeafe', // Blue 100
      eye: '#1e3a8a', // Deep navy
      blush: '#f472b6',
      glow: 'rgba(59, 130, 246, 0.4)',
      shadow: 'rgba(29, 78, 216, 0.15)',
    },
    'coral-sprite': {
      primary: '#fda4af', // Rose 300
      secondary: '#fb7185', // Rose 400
      accent: '#e11d48', // Rose 600
      highlight: '#ffe4e6', // Rose 100
      eye: '#881337',
      blush: '#f43f5e',
      glow: 'rgba(251, 113, 133, 0.4)',
      shadow: 'rgba(225, 29, 72, 0.15)',
    },
    'emerald-sprite': {
      primary: '#86efac',
      secondary: '#4ade80',
      accent: '#16a34a',
      highlight: '#dcfce7',
      eye: '#14532d',
      blush: '#fca5a5',
      glow: 'rgba(74, 222, 128, 0.4)',
      shadow: 'rgba(22, 163, 74, 0.15)',
    },
    'purple-sprite': {
      primary: '#c084fc',
      secondary: '#a855f7',
      accent: '#7e22ce',
      highlight: '#f3e8ff',
      eye: '#581c87',
      blush: '#f472b6',
      glow: 'rgba(168, 85, 247, 0.4)',
      shadow: 'rgba(126, 34, 206, 0.15)',
    },
  };

  const colors = colorMap[avatar] || colorMap['mint-sprite'];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        className="overflow-visible transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id={`bodyGrad-${avatar}`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={colors.highlight} />
            <stop offset="35%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>

          {/* Swirl Top Highlight */}
          <linearGradient id={`swirlGrad-${avatar}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>

          {/* Droplet glow filter */}
          <filter id={`glow-${avatar}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="110" r="65" fill={colors.glow} filter={`url(#glow-${avatar})`} opacity="0.6" />

        {/* Water Ripples underneath */}
        {showRipples && (
          <g className="animate-pulse" style={{ animationDuration: '3s' }}>
            <ellipse cx="100" cy="172" rx="68" ry="12" fill={colors.secondary} opacity="0.25" />
            <ellipse cx="100" cy="172" rx="48" ry="8" fill={colors.accent} opacity="0.2" />
            <ellipse cx="100" cy="172" rx="26" ry="4" fill={colors.highlight} opacity="0.4" />
          </g>
        )}

        {/* Floating Droplets surrounding Sprite */}
        <g className="animate-bounce" style={{ animationDuration: '2.5s' }}>
          <circle cx="48" cy="70" r="4.5" fill={colors.highlight} opacity="0.85" />
          <circle cx="152" cy="74" r="5" fill={colors.highlight} opacity="0.9" />
          <circle cx="34" cy="115" r="3.5" fill={colors.primary} opacity="0.7" />
          <circle cx="166" cy="112" r="4" fill={colors.secondary} opacity="0.75" />
          <circle cx="138" cy="40" r="3" fill={colors.highlight} opacity="0.6" />
        </g>

        {/* Floating Crown / Water Swirls */}
        <g className="transform transition-transform duration-500 hover:rotate-3">
          {/* Main Droplet Body & Head */}
          <path
            d="M 100,20 
               C 118,48 142,65 152,95 
               C 162,125 152,160 100,165 
               C 48,160 38,125 48,95 
               C 58,65 82,48 100,20 Z"
            fill={`url(#bodyGrad-${avatar})`}
            filter="drop-shadow(0px 8px 12px rgba(0,0,0,0.08))"
          />

          {/* Characteristic Cute Wave Swirl Hair / Top Crest */}
          <path
            d="M 100,20 
               C 92,8 106,-4 116,2 
               C 126,8 118,24 106,30 
               C 102,28 101,24 100,20 Z"
            fill={`url(#swirlGrad-${avatar})`}
          />

          {/* Left Hair Tuft Wave */}
          <path
            d="M 60,82 C 42,75 35,92 50,102 C 55,94 58,88 60,82 Z"
            fill={colors.primary}
            opacity="0.8"
          />

          {/* Right Hair Tuft Wave */}
          <path
            d="M 140,82 C 158,75 165,92 150,102 C 145,94 142,88 140,82 Z"
            fill={colors.primary}
            opacity="0.8"
          />

          {/* Gloss / Light Highlight on Head */}
          <ellipse
            cx="82"
            cy="65"
            rx="14"
            ry="24"
            transform="rotate(-24 82 65)"
            fill="#ffffff"
            opacity="0.45"
          />
          <circle cx="72" cy="92" r="4" fill="#ffffff" opacity="0.35" />

          {/* Blush Cheeks */}
          <ellipse cx="68" cy="120" rx="10" ry="6" fill={colors.blush} opacity="0.65" />
          <ellipse cx="132" cy="120" rx="10" ry="6" fill={colors.blush} opacity="0.65" />

          {/* EYES */}
          {mood === 'dancing' ? (
            // Joyful Happy Arcs
            <g>
              <path
                d="M 68,102 Q 78,90 88,102"
                stroke={colors.eye}
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 112,102 Q 122,90 132,102"
                stroke={colors.eye}
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : mood === 'thirsty' ? (
            // Droopy Eyes
            <g>
              <ellipse cx="78" cy="105" rx="8" ry="7" fill={colors.eye} />
              <ellipse cx="122" cy="105" rx="8" ry="7" fill={colors.eye} />
              <circle cx="80" cy="103" r="2.5" fill="#ffffff" />
              <circle cx="124" cy="103" r="2.5" fill="#ffffff" />
              <path d="M 68,95 Q 78,92 88,96" stroke={colors.eye} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 112,96 Q 122,92 132,95" stroke={colors.eye} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            // Sparkly Anime-style Eyes (matching screenshot)
            <g>
              {/* Left Eye */}
              <ellipse cx="78" cy="104" rx="9" ry="11" fill={colors.eye} />
              <ellipse cx="78" cy="108" rx="6" ry="6" fill={colors.accent} opacity="0.7" />
              <circle cx="75" cy="100" r="3.5" fill="#ffffff" />
              <circle cx="82" cy="107" r="1.8" fill="#ffffff" />
              {/* Left Eyebrow */}
              <path
                d="M 70,92 Q 78,88 86,92"
                stroke={colors.eye}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Right Eye */}
              <ellipse cx="122" cy="104" rx="9" ry="11" fill={colors.eye} />
              <ellipse cx="122" cy="108" rx="6" ry="6" fill={colors.accent} opacity="0.7" />
              <circle cx="119" cy="100" r="3.5" fill="#ffffff" />
              <circle cx="126" cy="107" r="1.8" fill="#ffffff" />
              {/* Right Eyebrow */}
              <path
                d="M 114,92 Q 122,88 130,92"
                stroke={colors.eye}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* MOUTH */}
          {mood === 'dancing' ? (
            // Big open laughing mouth
            <path
              d="M 90,118 Q 100,136 110,118 Z"
              fill={colors.accent}
              stroke={colors.eye}
              strokeWidth="1.5"
            />
          ) : mood === 'thirsty' ? (
            // Small sad mouth
            <path
              d="M 94,124 Q 100,118 106,124"
              stroke={colors.eye}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Cute gentle open smile
            <path
              d="M 92,118 Q 100,128 108,118"
              stroke={colors.eye}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* CUTE HANDS & POSE */}
          {mood === 'dancing' ? (
            // Waving hands in the air for victory dance
            <g>
              <path
                d="M 52,120 C 35,108 30,90 42,95 C 48,97 54,110 56,122 Z"
                fill={colors.primary}
                stroke={colors.secondary}
                strokeWidth="1"
              />
              <path
                d="M 148,120 C 165,108 170,90 158,95 C 152,97 146,110 144,122 Z"
                fill={colors.primary}
                stroke={colors.secondary}
                strokeWidth="1"
              />
            </g>
          ) : (
            // Hands clasped under chin (exact pose in screenshot!)
            <g>
              <ellipse cx="94" cy="142" rx="7" ry="6" fill={colors.highlight} />
              <ellipse cx="106" cy="142" rx="7" ry="6" fill={colors.highlight} />
              <path
                d="M 88,142 Q 100,150 112,142"
                stroke={colors.accent}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Water drop charm on belly */}
          <path
            d="M 100,154 C 97,157 95,160 95,163 C 95,166 97,168 100,168 C 103,168 105,166 105,163 C 105,160 103,157 100,154 Z"
            fill={colors.highlight}
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
};
