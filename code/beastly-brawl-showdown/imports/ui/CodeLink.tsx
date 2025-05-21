import React, { useState } from 'react';

export const CodeLink = ({ link }: { link: string }) => {
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