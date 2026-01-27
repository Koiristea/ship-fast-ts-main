"use client";

import { useState } from "react";

interface Column {
  key: string;
  label: string;
}

interface DataGridProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
}

export default function DataGrid({ data, columns, onRowClick }: DataGridProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Función de ordenamiento
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Aplicar ordenamiento
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Aplicar búsqueda
  const filteredData = sortedData.filter((row) =>
    columns.some((column) =>
      String(row[column.key])
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="w-full">
      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="input input-bordered w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className="cursor-pointer hover:bg-base-300 select-none"
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortConfig?.key === column.key && (
                      <span className="text-xs">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8">
                  No se encontraron datos
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "cursor-pointer hover:bg-base-200" : ""}
                >
                  {columns.map((column) => (
                    <td key={column.key}>{row[column.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Información de registros */}
      <div className="mt-4 text-sm text-base-content/70">
        Mostrando {filteredData.length} de {data.length} registros
      </div>
    </div>
  );
}
