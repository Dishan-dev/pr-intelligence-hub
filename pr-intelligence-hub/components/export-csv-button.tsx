"use client";

import { Download } from "lucide-react";

type CsvValue = string | number | null | undefined;

type ExportCsvButtonProps = {
  filename: string;
  headers: string[];
  rows: CsvValue[][];
};

function escapeCsv(value: CsvValue) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function ExportCsvButton({ filename, headers, rows }: ExportCsvButtonProps) {
  function exportCsv() {
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-950">
      <Download className="size-4" />
      Export CSV
    </button>
  );
}
