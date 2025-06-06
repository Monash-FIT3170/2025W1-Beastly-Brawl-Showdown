import React, { useEffect, useRef } from "react";
import { generateQRCode } from "../../../api/QRCode";

export const QRBox = ({ joinUrl }: { joinUrl: string }) => {
  //qrcode code
  const qrRef = useRef(null);

  useEffect(() => {
    //check if id exists and qrRef is attached to the DOM
    if (qrRef.current && joinUrl) {
      //test
      //const joinURL = 'https://www.youtube.com/watch?v=IzoXcgG9X2k';

      //sets up the base url with room id
      // Meteor.absoluteUrl - used to set up base url (i.e http://project_domain_name)
      generateQRCode(qrRef.current, joinUrl);
    }
  }, [joinUrl]);
  return <div className="qr-box" ref={qrRef}></div>;
};
