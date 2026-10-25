import { useRef, useState } from "react";
import {
  Camera, Upload, Trash2, User as UserIcon, CheckCircle2, AlertTriangle,
} from "lucide-react";
import CameraCapture from "./CameraCapture";
import { compressImage } from "./imageUtils";

const MAX_KB = 55;

interface Props {
  photoBase64?: string | null;
  photoContentType?: string | null;
  onChange: (photo: { base64: string; contentType: string } | null) => void;
}

export default function PhotoPicker({ photoBase64, photoContentType, onChange }: Props) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const compressedKb = photoBase64
    ? Math.round((photoBase64.length / 1024) * 10) / 10
    : 0;
  const originalMb = originalSize > 0
    ? (originalSize / (1024 * 1024)).toFixed(2)
    : null;
  const isCompliant = compressedKb > 0 && compressedKb <= MAX_KB;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large (max 10 MB).");
      return;
    }
    try {
      setOriginalSize(file.size);
      const result = await compressImage(file);
      onChange(result);
    } catch {
      setError("Could not process the image.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleCameraCapture(photo: { base64: string; contentType: string }) {
    setOriginalSize(0);
    onChange(photo);
  }

  function removePhoto() {
    setOriginalSize(0);
    setError(null);
    onChange(null);
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-2">Photo</label>
      <div className="flex items-start gap-4">
        <div className="w-36 h-36 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          {photoBase64 ? (
            <img
              src={`data:${photoContentType ?? "image/jpeg"};base64,${photoBase64}`}
              alt="Member"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-14 h-14 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold"
            >
              <Camera className="w-4 h-4" /> Take Photo
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 font-bold"
            >
              <Upload className="w-4 h-4" /> Choose File
            </button>
            {photoBase64 && (
              <button
                type="button"
                onClick={removePhoto}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 font-bold"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {photoBase64 && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isCompliant ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span
                  className={`text-xs font-bold ${
                    isCompliant ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  Size: {compressedKb} KB
                </span>
                {isCompliant && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    Under {MAX_KB} KB
                  </span>
                )}
                {!isCompliant && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                    Over {MAX_KB} KB
                  </span>
                )}
              </div>
              {originalMb && (
                <p className="text-[11px] text-slate-500">
                  Original: {originalMb} MB → Compressed: {compressedKb} KB
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
