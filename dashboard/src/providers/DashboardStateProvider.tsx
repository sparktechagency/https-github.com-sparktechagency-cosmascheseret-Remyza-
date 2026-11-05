"use client";

import { createContext, useContext, useState } from "react";

type DashboardContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pageTitle: string;
  setPageTitle: React.Dispatch<React.SetStateAction<string>>;
  openNotificationsModal: boolean;
  setOpenNotificationsModal: React.Dispatch<React.SetStateAction<boolean>>;
  openProfileModal: boolean;
  setOpenProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
  isExportModalOpen: boolean;
  setIsExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isViewModalOpen: boolean;
  setIsViewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openNotificationsModal, setOpenNotificationsModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


  const values = {
    sidebarOpen,
    setSidebarOpen,
    pageTitle,
    setPageTitle,
    openNotificationsModal,
    setOpenNotificationsModal,
    openProfileModal,
    setOpenProfileModal,
    isExportModalOpen,
    setIsExportModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
  };

  return (
    <DashboardContext.Provider value={values}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }

  return context;
}
