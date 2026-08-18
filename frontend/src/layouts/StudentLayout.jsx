import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";

function StudentLayout() {
  return (
    <div style={styles.layout}>

      {/* =========================
          STUDENT SIDEBAR
      ========================= */}

      <StudentSidebar />

      {/* =========================
          PAGE CONTENT
      ========================= */}

      <main style={styles.main}>
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

  main: {
    marginLeft: "250px",
    width: "calc(100% - 250px)",
    minHeight: "100vh",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
};

export default StudentLayout;