import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload, Film, AlertCircle } from "lucide-react";
import { AnalysisStatus } from "../types";

interface Props {
  status: AnalysisStatus;
  onFile: (file: File) => void;
  onDemo: () => void;
}

const ACCEPTED = ["video/mp4", "video/avi", "video/quicktime", "video/x-msvideo", "video/webm"];

export default function UploadZone({ status, onFile, onDemo }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const isLoading = status === "uploading" || status === "analyzing";

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSubmit(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSubmit(file);
  }

  function validateAndSubmit(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      setFileError("Please upload a video file (MP4, AVI, MOV, WebM)");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setFileError("File size must be under 500MB");
      return;
    }
    setFileError(null);
    onFile(file);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer
          ${dragging
            ? "border-teal-400 bg-teal-400/10 scale-[1.02]"
            : "border-slate-600 hover:border-teal-500/60 hover:bg-slate-800/40"
          }
          ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
          bg-slate-900/60 backdrop-blur-sm
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
            ${dragging ? "bg-teal-500/20 scale-110" : "bg-slate-800"}
          `}>
            {isLoading ? (
              <Film className="w-9 h-9 text-teal-400 animate-pulse" />
            ) : (
              <Upload className={`w-9 h-9 transition-colors ${dragging ? "text-teal-300" : "text-slate-400"}`} />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-200">
              {isLoading ? "Analyzing video..." : "Drop your video here"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading
                ? "Extracting frames and computing Grad-CAM heatmaps"
                : "MP4, AVI, MOV, WebM — up to 500MB"}
            </p>
          </div>

          {!isLoading && (
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
              >
                Choose File
              </button>
              <span className="text-slate-600 text-sm">or</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDemo(); }}
                className="px-5 py-2.5 border border-slate-600 hover:border-teal-500/60 hover:text-teal-400 text-slate-400 font-medium rounded-lg text-sm transition-colors"
              >
                Run Demo
              </button>
            </div>
          )}
        </div>

        {dragging && (
          <div className="absolute inset-0 rounded-2xl border-2 border-teal-400 pointer-events-none animate-pulse" />
        )}
      </div>

      {fileError && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm px-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
}
