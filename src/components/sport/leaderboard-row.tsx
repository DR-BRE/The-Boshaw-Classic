import { StatBadge } from "./stat-badge";
import { Avatar } from "@/components/ui/avatar";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  avatarUrl?: string | null;
  scoreToPar: number;
  thru: number | null;
  today: number | null;
  total: number;
  isCurrentUser?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}

const rankIcon = (rank: number, isLast: boolean) => {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (isLast) return "💩";
  return null;
};

export function LeaderboardRow({
  rank,
  name,
  avatarUrl,
  scoreToPar,
  thru,
  today,
  total,
  isCurrentUser = false,
  isLast = false,
  onPress,
}: LeaderboardRowProps) {
  const icon = rankIcon(rank, isLast);

  return (
    <button
      onClick={onPress}
      className={[
        "w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/30 text-left transition-colors",
        "active:bg-surface-container-high hover:bg-surface-container cursor-pointer",
        isCurrentUser ? "bg-primary/5 border-l-2 border-l-primary" : "",
      ].join(" ")}
    >
      <div className="w-8 flex-shrink-0 text-center">
        {icon ? (
          <span className="text-base">{icon}</span>
        ) : (
          <span className="text-sm font-label text-on-surface-variant tabular-nums">{rank}</span>
        )}
      </div>

      <Avatar src={avatarUrl} name={name} size="sm" />
      <span className="flex-1 font-body text-sm font-medium text-on-surface truncate">{name}</span>

      <div className="flex items-center gap-4 text-right flex-shrink-0">
        {thru !== null && (
          <span className="text-xs text-on-surface-variant tabular-nums w-8">
            {thru === 18 ? "F" : `${thru}`}
          </span>
        )}
        {today !== null && (
          <StatBadge value={today} className="text-xs w-8 text-right" />
        )}
        <StatBadge value={scoreToPar} className="text-sm w-10 text-right" />
      </div>
    </button>
  );
}
