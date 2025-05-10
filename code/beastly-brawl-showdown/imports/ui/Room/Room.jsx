import { Meteor } from 'meteor/meteor';
import React, { useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import { generateQRCode } from '../../qrcode';

export const Room = () => {
  const { id } = useParams();
  
  //qrcode code
  const qrRef = useRef(null);

  useEffect(() => {
    //check if id exists and qrRef is attached to the DOM
    if (qrRef.current && id) {
      //test 
      //const joinURL = 'https://www.youtube.com/watch?v=IzoXcgG9X2k';

      //sets up the base url with room id
      // Meteor.absoluteUrl - used to set up base url (i.e http://project_domain_name)
      const joinURL = Meteor.absoluteUrl(`h/${id}`);
      generateQRCode(qrRef.current, joinURL);
    }
  }, [id]);
  return (
    <div>
      <h1>ROOM VIEW</h1>
      <p>Room ID: {id}</p>
      <div ref={qrRef}></div>
    </div>
  );
};
