import React from "react";
import { JoinForm } from "./JoinForm";

export default function JoinPage() {

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
      <JoinForm />
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
