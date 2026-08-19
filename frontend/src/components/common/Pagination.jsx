import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-500 font-mono">Page {page} of {totalPages || 1}</p>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={isPrevDisabled} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => onPageChange(page + 1)} disabled={isNextDisabled} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}