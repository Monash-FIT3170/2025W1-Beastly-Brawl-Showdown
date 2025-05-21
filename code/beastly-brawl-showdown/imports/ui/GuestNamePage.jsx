import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";


export const GuestNamePage = () => {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    const [searchParams] = useSearchParams();
    const [name, setName] = useState("");
    const [showNameForm, setShowNameForm] = useState(false);

    const target = searchParams.get("target");
    // check if a user logged in as a guest
    const alreadyGuest = sessionStorage.getItem("guestLoggedIn") == "true";
    useEffect(() => {

        // get the stored guest name
        const storedGuestName = sessionStorage.getItem("guestName");
        // if the user is already a guest and name exists, navigate to the room
        if (alreadyGuest && storedGuestName) {
            navigate(`/room/${roomCode}/${encodeURIComponent(storedGuestName)}`);
        }
    }, [alreadyGuest, roomCode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;
            // store guest session info
            sessionStorage.setItem("guestLoggedIn", "true");
            sessionStorage.setItem("guestName", name);

            if (target == "host") {
                navigate(`/host/${encodeURIComponent(name)}`);
            } else if (roomCode) {
                navigate(`/room/${roomCode}/${encodeURIComponent(name)}`);
            } else if (target == "home") {
                navigate("/home");
            } else {
                console.log("UNknown route")
            }
    };


    // if not already a guest and joining by code, show choice between login and guest
    if (!showNameForm && !alreadyGuest) {
        return (
        <div>
            <h1>Join Room {roomCode}</h1>
            <p>How would you like to join?</p>
            <button>Login</button>
            <button onClick={() => setShowNameForm(true)}>Play as Guest</button>
        </div>
        );
    }
    // else, show name entry form
    return (
        <>
        <h1>Enter Your Name:</h1>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Your name..." value={name} onChange={(e) => setName(e.target.value)}></input>
            <button type="submit">Enter</button>
        </form> 
        </>
    );
};
