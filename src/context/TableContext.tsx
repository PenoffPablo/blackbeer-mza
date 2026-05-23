"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TableContextType {
  tableNumber: string | null;
  setTableNumber: (table: string | null) => void;
  clearTable: () => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tableNumber, setTableNumberState] = useState<string | null>(null);

  useEffect(() => {
    // Cargar la mesa desde localStorage al montar
    const savedTable = localStorage.getItem("blackbeer_table");
    if (savedTable) {
      setTableNumberState(savedTable);
    }
  }, []);

  const setTableNumber = (table: string | null) => {
    setTableNumberState(table);
    if (table) {
      localStorage.setItem("blackbeer_table", table);
    } else {
      localStorage.removeItem("blackbeer_table");
    }
  };

  const clearTable = () => {
    setTableNumber(null);
  };

  return (
    <TableContext.Provider value={{ tableNumber, setTableNumber, clearTable }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}
