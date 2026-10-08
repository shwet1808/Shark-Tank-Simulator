import clsx from 'clsx';
import { SharkId, SharkMood } from '../types/index';
import { SHARK_PROFILES, MOOD_CONFIG } from '../types/constants';

interface Props {
  sharkId: SharkId;
  mood: SharkMood;
  isActive?: boolean;
  lastMessage?: string;
}

export default function SharkCard({ sharkId, mood, isActive = false, lastMessage }: Props) {
  const profile = SHARK_PROFILES[sharkId];
  const moodCfg = MOOD_CONFIG[mood];

  return (
    <div className={clsx(
      'glass-card p-4 transition-all duration-500',
      isActive && 'border-zinc-600/80 shadow-[0_0_20px_rgba(14,165,233,0.08)]',
    )}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={clsx(
          'relative w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
          `bg-gradient-to-br ${profile.gradient} border border-zinc-800`,
        )}>
          {profile.emoji}
          {isActive && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sky-400 border-2 border-zinc-950 animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={clsx('text-sm font-semibold truncate', profile.color)}>
            {profile.name}
          </div>
          <div className="text-xs text-zinc-600 truncate">{profile.title}</div>

          {/* Mood badge */}
          <div className={clsx('shark-badge mt-2', moodCfg.class)}>
            <span>{moodCfg.icon}</span>
            <span>{moodCfg.label}</span>
          </div>
        </div>
      </div>

      {/* Focus tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {profile.focus.map((f) => (
          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-500">
            {f}
          </span>
        ))}
      </div>

      {/* Last message preview */}
      {lastMessage && (
        <div className="mt-3 pt-3 border-t border-zinc-800/60">
          <p className="text-xs text-zinc-500 line-clamp-2 italic">"{lastMessage}"</p>
        </div>
      )}
    </div>
  );
}
