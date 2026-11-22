import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

const GRADIENTS = [
  'from-indigo-500 to-cyan-500',
  'from-violet-500 to-fuchsia-500',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
];

export default function MemberAvatars({
  members = [],
  leaderId,
  max = 4,
  size = 'md', // sm | md | lg
  className = '',
}) {
  const sizeClasses = {
    sm: 'h-7 w-7 text-xs -space-x-2',
    md: 'h-8 w-8 text-xs -space-x-2.5',
    lg: 'h-10 w-10 text-sm -space-x-3',
  };

  const avatarSize = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  const visibleMembers = members.slice(0, max);
  const remaining = Math.max(0, members.length - max);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`flex items-center ${sizeClasses[size].split(' ')[2]} ${className}`}>
      {visibleMembers.map((member, idx) => {
        const isLeader = leaderId && (member.id === leaderId || member.user_id === leaderId);
        const gradient = GRADIENTS[idx % GRADIENTS.length];
        const initials = getInitials(member.name || member.full_name || member.email);

        return (
          <div
            key={member.id || idx}
            title={`${member.name || member.email}${isLeader ? ' (Leader)' : ''}`}
            className={`relative group inline-block rounded-full ring-2 ring-surface transition-transform duration-200 hover:scale-115 hover:z-20 cursor-pointer shadow-sm`}
          >
            <div
              className={`${avatarSize[size]} rounded-full bg-gradient-to-tr ${gradient} text-white font-bold flex items-center justify-center`}
            >
              {initials}
            </div>

            {/* Leader Crown with Sparkle */}
            {isLeader && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-sm">
                <Crown className="h-2.5 w-2.5 fill-amber-950" />
              </span>
            )}
          </div>
        );
      })}

      {remaining > 0 && (
        <div
          title={`${remaining} more members`}
          className={`${avatarSize[size]} rounded-full bg-bg-subtle border border-border text-text-muted font-bold flex items-center justify-center ring-2 ring-surface z-10`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
