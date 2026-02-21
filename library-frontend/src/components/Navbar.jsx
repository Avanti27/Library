import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: "15px", background: "#333", color: "white" }}>
      <span>Library Management System</span>
      <button
        style={{ float: "right" }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;