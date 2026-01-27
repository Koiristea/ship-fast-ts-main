"use client";

import { useState } from "react";
import DataGrid from "@/components/DataGrid";
import FileUploader from "@/components/FileUploader";

// Datos de ejemplo - reemplaza con datos reales de tu API
const sampleData = [
  { id: 1, nombre: "Proyecto A", estado: "Activo", fecha: "2025-01-15", archivos: 3 },
  { id: 2, nombre: "Proyecto B", estado: "Pendiente", fecha: "2025-01-20", archivos: 1 },
  { id: 3, nombre: "Proyecto C", estado: "Completado", fecha: "2025-01-10", archivos: 5 },
  { id: 4, nombre: "Proyecto D", estado: "Activo", fecha: "2025-01-25", archivos: 2 },
];

export default function DataPage() {
  const [data, setData] = useState(sampleData);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesUploaded = async (files: File[]) => {
    setUploadedFiles(files);
    
    // Aquí puedes hacer la llamada a tu API para procesar los archivos
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Archivos subidos exitosamente:', result);
        // Actualizar la grilla con nuevos datos si es necesario
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "estado", label: "Estado" },
    { key: "fecha", label: "Fecha" },
    { key: "archivos", label: "Archivos" },
  ];

  return (
    <main className="min-h-screen p-8 pb-24 bg-base-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Gestión de Datos
          </h1>
        </div>

        {/* File Uploader */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Subir Archivos</h2>
          <FileUploader onFilesSelected={handleFilesUploaded} />
          
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium">
                {uploadedFiles.length} archivo(s) seleccionado(s)
              </p>
            </div>
          )}
        </div>

        {/* Data Grid */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Datos</h2>
          <DataGrid data={data} columns={columns} />
        </div>
      </div>
    </main>
  );
}
