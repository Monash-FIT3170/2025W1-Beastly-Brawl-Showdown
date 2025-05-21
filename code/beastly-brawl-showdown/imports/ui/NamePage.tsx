import React from "react";
import { useNavigate } from "react-router-dom";
import { NameForm } from "./NameForm";

export default function NamePage() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/choose")
      }


    return (
        <div className="page-container">
        <h1>Name Page</h1>
        <NameForm onSuccess={handleSuccess}/>
        {/* <div className="buttons-container">
            <button className="btn name-btn" onClick={() => navigate("/")}>
            CONTINUE
            </button>

        </div> */}
        </div>
    );
}