const QRCode = require("qrcode");

const generateQR = async (data) => {
  const qrString = JSON.stringify(data);
  const qrBase64 = await QRCode.toDataURL(qrString);
  return qrBase64;
};

module.exports = { generateQR };