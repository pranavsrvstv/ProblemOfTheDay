import { Problem } from "@/types";
import { SUBJECT_META, DIFFICULTY_META } from "@/types";
import { format } from "date-fns";

interface Props { problems: (Problem & { _count: { submissions: number } })[]; }

export function ProblemTable({ problems }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-5 py-3 text-left">Problem</th>
            <th className="px-5 py-3 text-left">Subject</th>
            <th className="px-5 py-3 text-left">Difficulty</th>
            <th className="px-5 py-3 text-left">Publishes</th>
            <th className="px-5 py-3 text-left">Closes</th>
            <th className="px-5 py-3 text-left">Submissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {problems.map(p => {
            const subject = SUBJECT_META[p.subject];
            const difficulty = DIFFICULTY_META[p.difficulty];
            return (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">{p.title}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: subject.bg, color: subject.color }}>
                    {subject.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs font-semibold" style={{ color: difficulty.color }}>{difficulty.label}</td>
                <td className="px-5 py-3 text-slate-500">{format(new Date(p.publishAt), "MMM d, h:mm a")}</td>
                <td className="px-5 py-3 text-slate-500">{format(new Date(p.closeAt), "MMM d, h:mm a")}</td>
                <td className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">{p._count.submissions}</td>
              </tr>
            );
          })}
          {problems.length === 0 && (
            <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No problems yet. Create your first one!</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
