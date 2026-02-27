"use client";

import { useState } from "react";
import { PdfMerger } from "@/components/pdf-merger";
import { WordMerger } from "@/components/word-merger";
import { Button } from "@/components/ui/button";

type ToolId = "pdf" | "word";

const tools: { id: ToolId; label: string; description: string }[] = [
  {
    id: "pdf",
    label: "Merge PDF",
    description: "Combine multiple PDF files into a single document.",
  },
  {
    id: "word",
    label: "Merge Word",
    description: "Combine multiple Word files into a single document.",
  },
];

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);

  const renderSelectedTool = () => {
    if (selectedTool === "pdf") {
      return <PdfMerger />;
    }
    if (selectedTool === "word") {
      return <WordMerger />;
    }
    return null;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl text-center mb-8 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          File Merger
        </h1>
        <p className="mt-2 text-sm sm:text-base max-w-md mx-auto">
          Choose what you want to merge. Everything runs in your browser—your files never leave your device.
        </p>
      </div>

      <div className="w-full max-w-2xl mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            type="button"
            variant={selectedTool === tool.id ? "default" : "outline"}
            className="h-auto py-4 px-4 flex flex-col items-start gap-1 text-left"
            onClick={() => setSelectedTool(tool.id)}
          >
            <span className="text-sm font-semibold">{tool.label}</span>
            <span className="text-xs text-muted-foreground">
              {tool.description}
            </span>
          </Button>
        ))}
      </div>

      {renderSelectedTool()}

      <p className="mt-8 text-xs text-gray-500">
        No server uploads. Client-side only processing for your privacy.
      </p>
    </main>
  );
}

