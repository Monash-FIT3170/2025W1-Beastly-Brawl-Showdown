import React from "react";
import { useNavigate } from "react-router-dom";
import "/imports/ui/global.css";
import { JoinForm } from "./JoinForm";

export default function JoinPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/name")
  }

  // const formRef = useRef();

  // // Function to trigger form submission
  // const handleFormSubmit = () => {
  //   if (formRef.current) {
  //     formRef.current.requestSubmit(); // This triggers the form's submit event
  //   }
  // };

  return (
    <div className="page-container">
      <h1>Join Page</h1>
      <JoinForm onSuccess = {handleSuccess}/>
      {/* <JoinForm ref = {formRef}/> */}
      {/* have a task form that takes room code using marks */}
      {/* <div className="buttons-container">
        <button className="btn name-btn" onClick = {navigate("/name")}>
          CONTINUE
        </button>
      </div> */}
    </div>
  );
}
