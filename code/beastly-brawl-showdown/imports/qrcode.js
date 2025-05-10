import QRCode from 'easyqrcodejs';

export function generateQRCode(container, text) {
  //html container
  container.innerHTML = '';
  var options = {
    text, //the url 
    width: 200, //width of qrcode
    height: 200, //height of qrcode
    colorDark: '#111242', // color of the qrcode dots
    colorLight: '#ffffff', //background color of qrcode
    correctLevel: QRCode.CorrectLevel.H, //error correction level, H = highest
    
    //logo settings
    logo: '/logo.png',
    logoWidth: 94,
    logoHeight: 94,
    logoBackgroundTransparent: true,

  }
  return new QRCode(container, options);
}
