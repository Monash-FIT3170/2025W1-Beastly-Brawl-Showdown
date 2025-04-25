import React from "react";
import { useNavigate } from "react-router-dom";
import "/imports/ui/global.css";

export default function NamePage() {
    const navigate = useNavigate();
    return (
        <div className="page-container">
        <h1>Name Page</h1>
        <div className="buttons-container">
            <button className="btn name-btn" onClick={() => navigate("/")}>
            CONTINUE
            </button>

        </div>
        </div>
    );
}