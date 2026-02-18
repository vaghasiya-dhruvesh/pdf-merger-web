import { PdfMerger } from "@/components/pdf-merger";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          PDF Merger
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base max-w-md mx-auto">
          Merge multiple PDFs into one. Everything runs in your browser—your files never leave your device.
        </p>
      </div>
      <PdfMerger />
      <p className="mt-8 text-xs text-gray-500">
        No server uploads. Client-side only with pdf-lib.
      </p>
    </main>
  );
}
