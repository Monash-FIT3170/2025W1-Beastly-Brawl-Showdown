import React from "react";
import { ParticipantBox } from "./ParticipantBox";

export const ParticipantDisplayBox = ({ name }: { name: string }) => {
    const names = name
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n); // remove empty strings

    if (names.length === 0) {
        return (
            <div className="participants-display-box">
            </div>
        );
    }

    return (
        <div className="participants-display-box">
            {names.map((n) => (
                <ParticipantBox key={n} name={n} />
            ))}
        </div>
    );
};
