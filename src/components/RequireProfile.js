import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireProfile({ user, profile }) {
  if (!user) {
    return <Navigate to="/auth" />;
  }
  if (!profile || !profile.profileComplete) {
    return <Navigate to="/complete-profile" />;
  }
  return <Outlet />;
}
