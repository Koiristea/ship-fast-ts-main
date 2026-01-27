"use client";

import { useEffect, useState } from "react";
import DataGrid from "@/components/DataGrid";
import FileUploader from "@/components/FileUploader";

interface Purchase {
  id: string;
  fecha: string;
  monto: number;
  moneda: string;
  estado: string;
  enlace?: string | null;
  tipo?: string;
}

interface DashboardData {
  user: {
    id?: string;
    name?: string;
    email?: string;
    plan?: string | null;
    hasAccess?: boolean;
    customerId?: string | null;
  } | null;
  purchases: Purchase[];
}

export default function DataPage() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    user: null,
    purchases: [],
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/purchases");
        if (!res.ok) throw new Error("No se pudieron cargar los datos");

        const json = await res.json();
        setDashboard({
          user: json.user ?? null,
          purchases: json.purchases ?? [],
        });
      } catch (e) {
        setError("No se pudieron cargar los datos reales");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilesUploaded = async (files: File[]) => {
    setUploadedFiles(files);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Archivos subidos exitosamente:", result);
      }
    } catch (uploadError) {
      console.error("Error al subir archivos:", uploadError);
    }
  };

  const purchaseColumns = [
    { key: "id", label: "ID" },
    { key: "fecha", label: "Fecha" },
    {
      key: "monto",
      label: "Monto",
      format: (value: number, row: Purchase) => `$${value.toFixed(2)} ${row.moneda}`,
    },
    { key: "tipo", label: "Tipo" },
    { key: "estado", label: "Estado" },
    {
      key: "enlace",
      label: "Comprobante",
      format: (value?: string | null) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="link link-primary"
          >
            Ver
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <main className="min-h-screen p-8 pb-24 bg-base-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-base-content/60">Panel privado</p>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Gestión de cuentas y compras
            </h1>
          </div>
        </div>

        {/* Estado de carga / error */}
        {loading && (
          <div className="alert alert-info">Cargando datos reales...</div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Resumen de cuenta */}
        {dashboard.user && (
          <div className="bg-base-100 rounded-lg shadow-lg p-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-base-content/60">Usuario</p>
              <p className="font-semibold">{dashboard.user.name || "Sin nombre"}</p>
              <p className="text-sm text-base-content/70">{dashboard.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Plan</p>
              <p className="font-semibold">{dashboard.user.plan ?? "Sin plan"}</p>
              <p className="text-sm text-base-content/70">
                Acceso: {dashboard.user.hasAccess ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Stripe</p>
              <p className="font-semibold">
                {dashboard.user.customerId ? "Cliente registrado" : "Sin cliente"}
              </p>
              {dashboard.user.customerId && (
                <p className="text-xs text-base-content/60 break-all">
                  {dashboard.user.customerId}
                </p>
              )}
            </div>
          </div>
        )}

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Compras</h2>
            {!dashboard.user?.customerId && (
              <span className="text-sm text-base-content/70">
                Aún no hay cliente Stripe asociado a esta cuenta
              </span>
            )}
          </div>

          <DataGrid data={dashboard.purchases} columns={purchaseColumns} />
        </div>
      </div>
    </main>
  );
}
