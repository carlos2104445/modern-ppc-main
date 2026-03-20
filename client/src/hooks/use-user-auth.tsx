import { useEffect } from "react";
import { useLocation } from "wouter";

export function useUserAuth() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const protectedUserRoutes = [
      "/dashboard",
      "/earn",
      "/campaigns",
      "/wallet",
      "/referrals",
      "/achievements",
      "/leaderboards",
      "/challenges",
      "/levels",
      "/support",
      "/subscription",
      "/payment-methods",
      "/settings",
    ];

    const isProtectedUserRoute = protectedUserRoutes.some((route) => location.startsWith(route));

    if (isProtectedUserRoute && !currentUser) {
      setLocation("/signin");
    }
  }, [location, setLocation]);

  const getCurrentUser = () => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setLocation("/");
  };

  return { getCurrentUser, logout };
}
