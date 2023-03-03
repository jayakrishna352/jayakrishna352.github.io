const crypto = require("crypto");

module.exports.genHash = function (s) {
  //creating hash object
  var hash = crypto.createHash("sha256");
  data = hash.update(s, "utf-8");
  gen_hash = data.digest("hex");

  return gen_hash;
};

// var keyPair = require("./gen-key-pair.js");
// //Printing the output on the console
// var { publicKey, privateKey } = keyPair.KeyPair();
// console.log(publicKey + "\n" + privateKey);
// async function hash(string) {
//   const { createHash } = await import("node:crypto");
//   return createHash("sha256").update(string).digest("hex");
// }

// async function hash(string) {
//   const utf8 = new TextEncoder().encode(string);
//   const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hashHex = await hashArray
//     .map((bytes) => bytes.toString(16).padStart(2, "0"))
//     .join("");
//   return hashHex;
// }

// console.log(hash("hello"));
