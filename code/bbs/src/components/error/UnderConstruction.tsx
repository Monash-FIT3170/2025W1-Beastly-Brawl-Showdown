import React, { useEffect } from "react";
import { useNavigate } from "react-router";

export const UnderConstruction = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div>
      <h1>🏗️ Under Construction 🏗️</h1>
      <p>You will be redirected shortly...</p>
    </div>
  );
};
