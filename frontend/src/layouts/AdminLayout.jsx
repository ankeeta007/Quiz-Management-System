import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
  return (
    <div style={styles.layout}>

      {/* ADMIN SIDEBAR */}
      <AdminSidebar />

      {/* ADMIN PAGE CONTENT */}
      <main style={styles.content}>
        <Outlet />
      </main>

    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#f5f7fb",
  },

  content: {
    marginLeft: "250px",
    minHeight: "100vh",
    width: "calc(100% - 250px)",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
};

export default AdminLayout;