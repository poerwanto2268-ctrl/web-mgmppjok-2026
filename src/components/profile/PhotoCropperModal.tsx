import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  AlertCircle,
  Crop,
  Move,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface PhotoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photoDataUrl: string) => void;
  initialImage?: string;
  memberName?: string;
}

export const PhotoCropperModal: React.FC<PhotoCropperModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialImage,
  memberName,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(initialImage || '');
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [errorMsg, setErrorMsg] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load initial image if provided
  useEffect(() => {
    if (initialImage) {
      setImageSrc(initialImage);
    }
  }, [initialImage, isOpen]);

  // Load image element and draw on canvas
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
    img.onerror = () => {
      setErrorMsg('Gagal memuat format gambar. Silakan gunakan format JPG atau PNG.');
    };
  }, [imageSrc, zoom, offsetX, offsetY]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Target dimensions: 3:4 portrait aspect ratio (360 x 480 px)
    const targetW = 360;
    const targetH = 480;
    canvas.width = targetW;
    canvas.height = targetH;

    // Fill background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetW, targetH);

    // Calculate dimensions with zoom
    const scale = Math.max(targetW / img.width, targetH / img.height) * zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    const centerX = (targetW - drawW) / 2 + offsetX;
    const centerY = (targetH - drawH) / 2 + offsetY;

    ctx.drawImage(img, centerX, centerY, drawW, drawH);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check type: JPG/JPEG/PNG/WEBP
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Format file tidak didukung. Harap gunakan format JPG, JPEG, PNG, atau WEBP.');
      return;
    }

    // Check size: max 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Ukuran file melebihi batas maksimal 5 MB. Silakan pilih foto dengan ukuran lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export as high quality JPEG (quality: 0.88 - crisp yet lightweight ~70KB)
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onSave(croppedDataUrl);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Foto Profil Kartu Anggota"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
        />

        {/* Photo Canvas Area */}
        <div className="flex flex-col items-center justify-center space-y-3">
          {imageSrc ? (
            <div className="space-y-3 text-center w-full">
              <div
                className="relative mx-auto w-[240px] h-[320px] rounded-2xl overflow-hidden shadow-lg border-4 border-amber-400/80 cursor-grab active:cursor-grabbing bg-slate-950 select-none touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Helpful drag indicator overlay */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs pointer-events-none">
                  <Move className="w-2.5 h-2.5" />
                  <span>Geser untuk atur posisi</span>
                </div>
              </div>

              {/* Zoom & Adjustment Controls */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                    Perbesar / Perkecil (Zoom)
                  </span>
                  <span className="font-mono text-slate-800">{Math.round(zoom * 100)}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.1))}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min="0.6"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.1))}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline"
                  >
                    Reset Posisi & Zoom
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold"
                  >
                    Ganti Foto Lain
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Empty State */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-12 px-6 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl bg-slate-50/70 hover:bg-blue-50/30 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Pilih Foto Profil dari Perangkat
                </p>
                <p className="text-xs text-slate-500">
                  Mendukung format JPG, JPEG, PNG, atau WEBP (Maksimal 5 MB)
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Pilih File Foto
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold flex items-center gap-1.5 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Tips Foto Kartu Tanda Anggota:
          </p>
          <p className="text-blue-800/90 text-[11px]">
            Gunakan foto formal/setengah badan dengan latar belakang polos, pakaian rapi/seragam olahraga/dinas guru PJOK, dan wajah menghadap lurus ke depan.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!imageSrc}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Simpan & Gunakan di Kartu</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
