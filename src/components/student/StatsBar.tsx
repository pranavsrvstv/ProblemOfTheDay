interface Props { points: number; streak: number; }

export function StatsBar({ points, streak }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <span className="text-2xl">⭐</span>
        <div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{points}</div>
          <div className="text-xs text-slate-500">Total Points</div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{streak}</div>
          <div className="text-xs text-slate-500">Day Streak</div>
        </div>
      </div>
    </div>
  );
}
