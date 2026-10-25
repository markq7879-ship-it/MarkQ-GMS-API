import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (photo: { base64: string; contentType: string }) => void;
}

export default function CameraCapture({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState<{ base64: string; contentType: string } | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setLoading(true);
    setCaptured(null);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access in your browser."
            : err?.name === "NotFoundError"
            ? "No camera found on this device."
            : "Could not access camera."
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  async function capture() {
    if (!videoRef.current) return;
    try {
      const { compressImage } = await import("./imageUtils");
      const result = await compressImage(videoRef.current);
      setCaptured(result);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    } catch {
      setError("Failed to capture photo.");
    }
  }

  function retake() {
    setCaptured(null);
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => setError("Could not restart camera."));
  }

  function confirm() {
    if (captured) {
      onCapture(captured);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5" /> Take Photo
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-3">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-md overflow-hidden aspect-square max-h-96 mx-auto">
            {captured ? (
              <img
                src={`data:${captured.contentType};base64,${captured.base64}`}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                Starting camera…
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {captured ? (
              <>
                <button
                  onClick={retake}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
                <button
                  onClick={confirm}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                >
                  <Check className="w-4 h-4" /> Use Photo
                </button>
              </>
            ) : (
              <button
                onClick={capture}
                disabled={loading || !!error}
                className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
              >
                Capture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
