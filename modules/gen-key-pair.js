const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

module.exports.KeyPair = async function () {
  const keyPair = ec.genKeyPair();
  const publicKey = keyPair.getPublic("hex");
  const privateKey = keyPair.getPrivate("hex");
  const signature = privateKey;
  return { publicKey, privateKey, signature };
};
