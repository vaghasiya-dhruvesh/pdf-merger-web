"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import DocxMerger from "docx-merger";
import { toast } from "sonner";
import {
  FileText,
  GripVertical,
  Trash2,
  Merge,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatFileSize } from "@/lib/utils";

export interface WordFile {
  id: string;
  file: File;
}

const DEFAULT_MERGED_NAME = "merged-document.docx";

async function fileToBinaryString(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

export function WordMerger() {
  const [files, setFiles] = useState<WordFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const wordOnly = acceptedFiles.filter((f) => f.type === docxMime || f.name.toLowerCase().endsWith(".docx"));
    if (wordOnly.length < acceptedFiles.length) {
      toast.error("Only Word (.docx) files are accepted. Non-supported files were ignored.");
    }
    const newEntries: WordFile[] = wordOnly.map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      file,
    }));
    setFiles((prev: WordFile[]) => [...prev, ...newEntries]);
    if (newEntries.length) {
      toast.success(`${newEntries.length} Word file(s) added.`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: true,
    disabled: isMerging,
  });

  const removeFile = useCallback((id: string) => {
    setFiles((prev: WordFile[]) => prev.filter((f: WordFile) => f.id !== id));
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData("text/plain", String(index));
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = Number(e.dataTransfer.getData("text/plain"));
      if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return;
      setFiles((prev: WordFile[]) => {
        const next = [...prev];
        const [removed] = next.splice(dragIndex, 1);
        next.splice(dropIndex, 0, removed);
        return next;
      });
    },
    []
  );

  const mergeWordFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Add at least one Word file to merge.");
      return;
    }
    setIsMerging(true);
    setMergeProgress(0);
    try {
      const binaries: string[] = [];
      const total = files.length;
      for (let i = 0; i < total; i++) {
        const binary = await fileToBinaryString(files[i].file);
        binaries.push(binary);
        setMergeProgress(Math.round(((i + 1) / total) * 100));
      }

      const docx = new DocxMerger({}, binaries as any);

      await new Promise<void>((resolve, reject) => {
        docx.save("blob", (data: Blob) => {
          try {
            const blob = data;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = DEFAULT_MERGED_NAME;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      toast.success("Word files merged and downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to merge Word files. Please try again.");
    } finally {
      setIsMerging(false);
      setMergeProgress(0);
    }
  }, [files]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Word Merger
          </CardTitle>
          <CardDescription>
            Drop Word (.docx) files here or click to select. Reorder with drag handles, then merge and download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              isMerging && "pointer-events-none opacity-60"
            )}
          >
            <input {...getInputProps()} />
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop Word files here…"
                : "Drag & drop Word (.docx) files here, or click to select"}
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Files ({files.length})
              </p>
              <ul className="space-y-1">
                {files.map((item, index) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 group"
                  >
                    <button
                      type="button"
                      aria-label="Drag to reorder"
                      className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.file.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 opacity-70 hover:opacity-100 hover:text-destructive"
                      onClick={() => removeFile(item.id)}
                      disabled={isMerging}
                      aria-label="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isMerging && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Merging Word files…
              </div>
              <Progress value={mergeProgress} className="h-2" />
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={mergeWordFiles}
            disabled={files.length === 0 || isMerging}
          >
            {isMerging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Merging…
              </>
            ) : (
              <>
                <Merge className="mr-2 h-4 w-4" />
                Merge Word files
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

