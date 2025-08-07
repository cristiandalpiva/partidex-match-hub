import React, { useRef, useState } from 'react';
import { Upload, X, Image, FileText } from 'lucide-react';
import { GlassmorphismButton } from './glassmorphism-button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUrlChange?: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  currentUrl?: string;
  placeholder?: string;
  className?: string;
}

export const FileUpload = ({
  onFileSelect,
  onUrlChange,
  accept = "image/*",
  maxSize = 5,
  currentUrl = "",
  placeholder = "Seleccionar archivo o ingresar URL",
  className
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [urlMode, setUrlMode] = useState(!!currentUrl);
  const [urlValue, setUrlValue] = useState(currentUrl);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`El archivo es muy grande. Tamaño máximo: ${maxSize}MB`);
      return;
    }
    
    onFileSelect(file);
    setUrlMode(false);
    setUrlValue("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlValue && onUrlChange) {
      onUrlChange(urlValue);
      setUrlMode(false);
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlValue(e.target.value);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileInputChange}
      />
      
      <div className="space-y-3">
        {/* File Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
            dragActive
              ? "border-green-dynamic bg-green-dynamic/5"
              : "border-border hover:border-green-dynamic/50 hover:bg-muted/20"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-foreground font-medium">
                Arrastra y suelta tu archivo aquí
              </p>
              <p className="text-sm text-muted-foreground">
                o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Máximo {maxSize}MB • {accept.replace(/[^a-zA-Z,]/g, '').toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle between File and URL */}
        <div className="flex items-center justify-center gap-2">
          <GlassmorphismButton
            variant={!urlMode ? "green" : "default"}
            size="sm"
            icon={Image}
            onClick={() => {
              setUrlMode(false);
              setUrlValue("");
            }}
          >
            Archivo
          </GlassmorphismButton>
          <span className="text-muted-foreground text-sm">o</span>
          <GlassmorphismButton
            variant={urlMode ? "green" : "default"}
            size="sm"
            icon={FileText}
            onClick={() => setUrlMode(true)}
          >
            URL
          </GlassmorphismButton>
        </div>

        {/* URL Input Mode */}
        {urlMode && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlValue}
                onChange={handleUrlInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-dynamic/50 text-foreground"
              />
              <GlassmorphismButton
                variant="green"
                size="sm"
                onClick={handleUrlSubmit}
                disabled={!urlValue}
              >
                Usar URL
              </GlassmorphismButton>
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa la URL de una imagen desde internet
            </p>
          </div>
        )}

        {/* Current Image Preview */}
        {(currentUrl || urlValue) && !urlMode && (
          <div className="relative">
            <img 
              src={currentUrl || urlValue} 
              alt="Vista previa" 
              className="w-20 h-20 rounded-lg object-cover border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <button
              onClick={() => {
                setUrlValue("");
                if (onUrlChange) onUrlChange("");
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};