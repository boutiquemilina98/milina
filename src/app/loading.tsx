export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black"></div>
    </div>
  );
}
