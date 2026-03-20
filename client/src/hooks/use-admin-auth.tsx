import { useEffect } from "react";
import { useLocation } from "wouter";

export function useAdminAuth() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");
    const isAdminRoute =
      location.startsWith("/admin") &&
      location !== "/admin/login" &&
      location !== "/admin/password-reset-request" &&
      location !== "/admin/password-reset-confirm";

    if (isAdminRoute && !adminUser) {
      setLocation("/admin/login");
    }
  }, [location, setLocation]);

  const getAdminUser = () => {
    const adminUserStr = localStorage.getItem("adminUser");
    if (adminUserStr) {
      try {
        return JSON.parse(adminUserStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem("adminUser");
    setLocation("/admin/login");
  };

  return { getAdminUser, logout };
}
