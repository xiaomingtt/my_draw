var CryptoJS = require('aes.js');  //引用AES源码js
var key = CryptoJS.enc.Utf8.parse("WOHUANICAIMIYAO0");//十六位十六进制数作为秘钥
var iv = CryptoJS.enc.Utf8.parse('WOHUANICAIIV1234');//十六位十六进制数作为秘钥偏移量
//解密方法
function Decrypt(word) {
  var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  //忽略上面两句，可直接解密PHP生成的BASE64编码的密文
  srcs = word;
  var decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}
//加密方法
function Encrypt(word) {
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  var txt = encrypted.ciphertext.toString().toUpperCase();
  //到上面已经获得最终加密结果，下面两步将最终加密结果还原为BASE64编码，便于PHP解密
  var encryptedHexStr = CryptoJS.enc.Hex.parse(txt);
  var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  return srcs;
}

//暴露接口
module.exports.Decrypt = Decrypt;
module.exports.Encrypt = Encrypt;
