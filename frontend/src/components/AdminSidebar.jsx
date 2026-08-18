import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: "📊",
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: "👥",
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: "📁",
    },
    {
      label: "Quizzes",
      path: "/admin/quizzes",
      icon: "📝",
    },
    {
      label: "Questions",
      path: "/admin/questions",
      icon: "❓",
    },
    {
      label: "Student Attempts",
      path: "/admin/attempts",
      icon: "📋",
    },
  ];

  return (
    <aside style={styles.sidebar}>

      {/* =========================
          BRAND
      ========================= */}

      <div style={styles.logoSection}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>Q</div>

          <div>
            <h2 style={styles.logo}>
              Quiz Platform
            </h2>

            <p style={styles.role}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================= */}

      <div style={styles.menuTitle}>
        MENU
      </div>

      <nav style={styles.navigation}>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive
                ? styles.activeNavItem
                : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  style={{
                    ...styles.icon,
                    ...(isActive
                      ? styles.activeIcon
                      : {}),
                  }}
                >
                  {item.icon}
                </span>

                <span style={styles.navText}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

      </nav>

      {/* =========================
          LOGOUT
      ========================= */}

      <div style={styles.bottomSection}>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "#7f1d1d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              "transparent";
          }}
        >
          <span style={styles.icon}>
            🚪
          </span>

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    background:
      "linear-gradient(180deg, #111827 0%, #172554 100%)",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    boxSizing: "border-box",
    zIndex: 1000,
    borderRight: "1px solid #1e3a5f",
  },

  /* BRAND */

  logoSection: {
    padding: "24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #2563eb, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
    flexShrink: 0,
    boxShadow:
      "0 4px 12px rgba(37,99,235,0.35)",
  },

  logo: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
  },

  role: {
    margin: "4px 0 0 0",
    color: "#93c5fd",
    fontSize: "12px",
    fontWeight: "500",
  },

  /* MENU */

  menuTitle: {
    padding: "22px 22px 8px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.2px",
  },

  navigation: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 12px",
    gap: "5px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "9px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition:
      "all 0.2s ease",
  },

  activeNavItem: {
    background:
      "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "#ffffff",
    boxShadow:
      "0 4px 12px rgba(37,99,235,0.25)",
  },

  navText: {
    whiteSpace: "nowrap",
  },

  icon: {
    width: "23px",
    minWidth: "23px",
    textAlign: "center",
    fontSize: "17px",
  },

  activeIcon: {
    transform: "scale(1.05)",
  },

  /* LOGOUT */

  bottomSection: {
    marginTop: "auto",
    padding: "14px 12px 18px",
    borderTop:
      "1px solid rgba(255,255,255,0.10)",
  },

  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "transparent",
    color: "#fca5a5",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "left",
    transition:
      "background-color 0.2s ease",
  },
};

export default AdminSidebar;