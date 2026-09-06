import { LeaderboardEntry } from "@/types";

interface Props {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ entries, currentUserId }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">🏆 Leaderboard</h3>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
              entry.id === currentUserId
                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="w-6 text-center text-base">
              {i < 3 ? MEDALS[i] : <span className="text-slate-400 text-xs font-bold">{i + 1}</span>}
            </span>
            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300 truncate">{entry.name}</span>
            {entry.streak > 1 && <span className="text-xs text-orange-500">🔥{entry.streak}</span>}
            <span className="font-bold text-slate-800 dark:text-slate-100">{entry.points}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-4">No scores yet</p>
        )}
      </div>
    </div>
  );
}
