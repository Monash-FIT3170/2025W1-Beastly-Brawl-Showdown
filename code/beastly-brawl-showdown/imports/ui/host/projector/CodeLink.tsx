import React from 'react';

export const CodeLink = (link: string ) => {
  let displayLink = link;
  if (!link || link == "") {
    displayLink = "Link will appear here soon!";
  }

  return (
    <div className="code-link">
      {displayLink}
    </div>
  );

};