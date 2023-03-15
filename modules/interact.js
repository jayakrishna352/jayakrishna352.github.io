const { providers, Wallet, Contract } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

const API_URL = process.env.API_URL;
// const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const contract = require("../Vote.json");

// Provider
// const alchemyProvider = new providers.AlchemyProvider(
//   (network = "goerli"),
//   API_KEY
// );
const provider = new providers.JsonRpcProvider(API_URL);

// Signer
// const signer = new Wallet(PRIVATE_KEY, alchemyProvider);
const signer = new Wallet(
  PRIVATE_KEY,
  provider
);

// Contract
module.exports.voteContract = () => {
  const voteContract = new Contract(CONTRACT_ADDRESS, contract.abi, signer);
  return voteContract;
};

// const vote = new Contract(CONTRACT_ADDRESS, contract.abi, signer);
// const exe = async () => {
//   const result = await vote.registerVoter(
//     "4",
//     "JK",
//     "03-05-2002",
//     "1120",
//     "8309445697",
//     "1",
//     "TamilNadu",
//     "Tiruvallur",
//     "Maduravoyal",
//     "4",
//     "4"
//   );
//   // console.log(result.value.toNumber());
//   // const result = await vote.verifyLogin("21");
//   // const result = await vote.functions.registerParty(
//   //   "1",
//   //   "Jana Sena",
//   //   "Maduravoyal"
//   // );
//   // await result.wait();
//   await result.wait();
//   // console.log(result);
//   console.log(await vote.verifyLogin("4"));
//   //   //   const result = await vote.getConstituencies();
//   //   //   console.log(result);
//   //   //   // const json = JSON.stringify(result);
//   //   //   /* Decode Candidates
//   //   //   for (var i = 0; i < result.length; i++) {
//   //   //     for (var j = 0; j < result[i].length; j++) {
//   //   //       if (j == 4) {
//   //   //         console.log(result[i][j].toNumber());
//   //   //       } else {
//   //   //         console.log(result[i][j]);
//   //   //       }
//   //   //     }
//   //   //   }
//   //   //   */
// };

// exe();
