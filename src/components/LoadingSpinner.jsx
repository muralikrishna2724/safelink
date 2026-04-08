export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-600 text-center">
        Checking URL safety across threat databases...
      </p>
    </div>
  );
}
