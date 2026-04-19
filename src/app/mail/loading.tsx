export default function MailLoading() {
  return (
    <div
      className="relative flex min-h-dvh h-dvh w-full items-center justify-center bg-[#09090b]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-white/15 border-t-white/80"
          aria-hidden="true"
        />
        <span className="text-[12.5px] font-medium tracking-tight text-white/80">
          Loading
        </span>
      </div>
    </div>
  );
}
