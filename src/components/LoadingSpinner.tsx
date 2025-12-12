export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-950 dark:border-zinc-700 dark:border-t-zinc-50"></div>
    </div>
  );
}

