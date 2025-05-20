import React from "react";
import { useNavigate } from "react-router-dom";
// import "/imports/ui/global.css";
// import { NameForm } from "./NameForm";
import MonsterList from "./MonsterList";

export default function MonsterPage() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/");
    };

    return (
        <div className="page-container">
            <h1>Monster Page</h1>
            <MonsterList />
            <div className="buttons-container">
                <button className="btn name-btn" onClick={() => navigate("/")}>
                    CONTINUE
                </button>
            </div>
        </div>
    );
}
