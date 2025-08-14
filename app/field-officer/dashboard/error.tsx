"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mb-4">{error.message}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
