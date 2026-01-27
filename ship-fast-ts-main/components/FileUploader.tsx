"use client";

import { useState, useRef, DragEvent } from "react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function FileUploader({
  onFilesSelected,
  acceptedTypes = "*",
  maxFiles = 10,
  maxSizeMB = 10,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: FileList | null): File[] => {
    if (!fileList) return [];

    const filesArray = Array.from(fileList);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Validar cantidad de archivos
    if (filesArray.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos`);
      return [];
    }

    // Validar tamaño de archivos
    const oversizedFiles = filesArray.filter(
      (file) => file.size > maxSizeBytes,
    );
    if (oversizedFiles.length > 0) {
      setError(`Algunos archivos exceden el tamaño máximo de ${maxSizeMB}MB`);
      return [];
    }

    setError("");
    return filesArray;
  };

  const handleFileSelect = (fileList: FileList | null) => {
    const validFiles = validateFiles(fileList);
    if (validFiles.length > 0) {
      setFiles(validFiles);
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Zona de arrastre */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-base-300 hover:border-primary/50 hover:bg-base-200"
          }
        `}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-base-content/40"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-base-content">
            <span className="font-medium text-primary">
              Haz clic para subir
            </span>
            {" o arrastra y suelta"}
          </div>
          <p className="text-sm text-base-content/60">
            Hasta {maxFiles} archivos (máx. {maxSizeMB}MB cada uno)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Mensajes de error */}
      {error && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Lista de archivos seleccionados */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Archivos seleccionados:</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg
                    className="h-6 w-6 text-base-content/60 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-base-content/60">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="btn btn-ghost btn-sm btn-circle"
                  type="button"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
