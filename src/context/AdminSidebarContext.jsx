"use client";

import { createContext, useContext, useState } from "react";

const AdminSidebarContext = createContext(null);

export function AdminSidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AdminSidebarContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}
