const express = require("express");
const app = express();
const serverless = require("serverless-http");
var { check, validationResult } = require("express-validator");
const fs = require("fs");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

var interact = require("./modules/interact.js");
var keyPair = require("./modules/gen-key-pair.js");
var genHash = require("./modules/hash-256.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

app.use(
  sessions({
    secret: process.env.SESSION_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 8640000 }, // OneDay
    resave: false,
  })
);

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

app.get("/", (req, res) => {
  if (!res.headersSent) {
    const filePath = path.join(__dirname, "pages", "index.html");
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(err.message);
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content, "utf-8");
      }
    });
  }
});

// app.get("registerParty", checkUser, (req, res) => {});

app.get("/login", (req, res) => {
  if (req.session != null && req.session.userid) {
    res.redirect("/register");
  } else {
    res.sendFile(path.join(__dirname, "pages", "login.html"));
  }
});

// handle login requests
app.post("/login", async (req, res) => {
  if (req.session != null && req.session.userid) {
    res.redirect("/register");
  } else if (req.body.username == username && req.body.password == password) {
    let session = req.session;
    session.userid = req.body.username;
    res.redirect("/register");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (req.session != null && req.session.userid) {
    res.sendFile(path.join(__dirname, "pages", "register.html"));
  } else {
    res.redirect("login");
  }
});

app.post(
  "/register",
  [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("dob")
      .custom((value) => {
        const dob = new Date(value);
        const now = new Date();
        const eighteenYearsAgo = new Date(
          now.getFullYear() - 18,
          now.getMonth(),
          now.getDate()
        );
        return dob < eighteenYearsAgo;
      })
      .withMessage("You must be at least 18 years old"),
    check("idNum")
      .not()
      .isEmpty()
      .withMessage("Identity Number is required")
      .matches(/^[0-9]{12}$/)
      .withMessage("Identity Number must be 12 digits"),
    check("mobileNum")
      .not()
      .isEmpty()
      .withMessage("Mobile Number is required")
      .matches(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/)
      .withMessage("Invalid Mobile Number"),
    check("fingerprint").not().isEmpty().withMessage("Fingerprint is required"),
    check("state").not().isEmpty().withMessage("State is required"),
    check("district").not().isEmpty().withMessage("District is required"),
    check("constituency")
      .not()
      .isEmpty()
      .withMessage("Constituency is required"),
  ],
  async (req, res) => {
    if (req.session != null && req.session.userid) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const json = req.body;
      const { publicKey, privateKey, signature } = await keyPair.KeyPair();
      const hash = genHash.genHash(JSON.stringify(json));
      const isRegVoter = await interact.voteContract().verifyVoter(publicKey);
      if (isRegVoter) {
        res.send(
          '<center><h1>Voter have already registered!</h1><br /><a href="/register">Redirect to Voter registration page.</a></center>'
        );
      } else {
        console.log(`PublicKey: ${publicKey}, PrivateKey: ${privateKey}`);
        const returnValue = await interact
          .voteContract()
          .registerVoter(
            hash,
            json.name,
            json.dob,
            json.idNum,
            json.mobileNum,
            json.fingerprint,
            json.state,
            json.district,
            json.constituency,
            publicKey,
            signature
          );
        await returnValue.wait();
        const result = await interact.voteContract().verifyLogin(publicKey);
        // console.log(result);
        if (result) {
          const msg = `Dear Voter (${json.name}), To cast your vote in the ${json.constituency} constituency election - PUBLIC KEY is ${publicKey} and PRIVATE KEY is ${privateKey}. Please do not share the PUBLIC and PRIVATE KEYS with anyone.`;
          client.messages
            .create({
              body: msg,
              from: "+447723457952",
              to: `+91${json.mobileNum}`,
            })
            .then((message) => console.log("Voter registered successfully!"))
            .catch((err) => console.log(err));
          res.send(
            '<center><h1>Voter registered successfully!</h1><br /><a href="/register">Redirect to Voter registration page.</a></center>'
          );
        } else {
          res.send(
            '<center><h1>Voter registration unsuccessful!</h1><br /><a href="/register">Redirect to Voter registration page.</a></center>'
          );
        }
      }
    } else {
      res.redirect("/login");
    }
  }
);

app.get("/registerParty", (req, res) => {
  if (req.session != null && req.session.userid) {
    res.sendFile(path.join(__dirname, "pages", "registerParty.html"));
  } else {
    res.redirect("login");
  }
});

app.post("/registerParty", async (req, res) => {
  if (req.session != null && req.session.userid) {
    const body = req.body;
    if (
      body.publicKey !== "" &&
      body.party !== "" &&
      body.constituency !== ""
    ) {
      const contract = await interact.voteContract();
      const voterCheck = await contract.verifyLogin(body.publicKey);
      const partyCheck = await contract.verifyParty(body.party);
      if (voterCheck && !partyCheck) {
        const returnValue = await contract.registerParty(
          body.publicKey,
          body.party,
          body.constituency
        );
        await returnValue.wait();
        const result = await contract.verifyParty(body.party);
        // console.log(result);
        if (result) {
          // const mobileNum = await contract.getMobile(body.publicKey);
          // const msg = `Dear Candidate, you have successfully registered to participate as a candidate in the ${body.constituency} constituency from ${body.party}.`;
          // client.messages
          //   .create({
          //     body: msg,
          //     from: "+447723457952",
          //     to: `+91${json.mobileNum}`,
          //   })
          //   .then((message) => console.log("Candidate  registered successfully!"))
          //   .catch((err) => console.log(err));
          res.send(
            '<center><h1>Party registration and CM Candidate as Candidate registration successful!</h1><br /><a href="/registerParty">Redirect to Party registration page.</a></center>'
          );
        } else {
          res.send(
            '<center><h1>Party registration and CM Candidate as Candidate registration unsuccessful!</h1><br /><a href="/registerParty">Redirect to Party registration page.</a></center>'
          );
        }
      }
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/registerCandidate", (req, res) => {
  if (req.session != null && req.session.userid) {
    res.sendFile(path.join(__dirname, "pages", "registerCandidate.html"));
  } else {
    res.redirect("login");
  }
});

app.post("/registerCandidate", async (req, res) => {
  if (req.session != null && req.session.userid) {
    const body = req.body;
    if (
      body.publicKey !== "" &&
      body.constituency !== "" &&
      body.party !== ""
    ) {
      const contract = await interact.voteContract();
      const voterCheck = await contract.verifyLogin(body.publicKey);
      const candidateCheck = await contract.verifyCandidate(body.party);
      if (voterCheck && !candidateCheck) {
        const returnValue = await interact
          .voteContract()
          .registerCandidate(body.publicKey, body.constituency, body.party);
        await returnValue.wait();
        const result = await contract.verifyCandidate(body.party);
        if (result) {
          res.send(
            '<center><h1>Candidate registration successful!</h1><br /><a href="/registerCandidate">Redirect to Candidate registration page.</a></center>'
          );
        } else {
          res.send(
            '<center><h1>Candidate registration unsuccessful!</h1><br /><a href="/registerCandidate">Redirect to Candidate registration page.</a></center>'
          );
        }
      } else {
        res.send(
          '<center><h1>Candidate registration unsuccessful!</h1><br /><a href="/registerCandidate">Redirect to Candidate registration page.</a></center>'
        );
      }
    } else {
      res.redirect("/registerCandidate");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/castVote", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "castVote.html"));
});

app.post("/castVote/getFP", async (req, res) => {
  const isVoter = await interact.voteContract().verifyLogin(req.body.publicKey);
  if (!isVoter) {
    res.send({
      fp: "",
    });
  } else {
    // var result;
    const returnValue = await interact
      .voteContract()
      .getFingerprint(req.body.publicKey);
    var data = {
      fp: returnValue,
    };
    res.send(data);
  }
});

app.post("/castVote", async (req, res) => {
  const body = req.body;
  if (
    body.publicKey !== "" &&
    body.privateKey !== "" &&
    body.matchingScore > 175
  ) {
    const contract = await interact.voteContract();
    const isVoter = await contract.verifyLogin(body.publicKey);
    if (!isVoter) {
      res.send(
        '<center><h2>Voter not registered!</h2><br /><a href="/castVote">Redirect to Cast Vote page.</a></center>'
      );
    } else {
      const key = ec.keyFromPrivate(await contract.getSign(body.publicKey));
      const signature = key.sign("Hello, World!");
      const result = await key.verify("Hello, World!", signature, "hex");
      // console.log(result);
      if (result) {
        const returnValue = await contract.verifyVote(body.publicKey);
        // console.log(returnValue);
        if (!returnValue) {
          let session = req.session;
          session.publicKey = body.publicKey;
          // console.log(req.session2.publicKey);
          // console.log("Inside castVote Success");
          res.redirect("/castVote/vote");
        } else {
          res.send(
            '<center><h2>You have already Voted!</h2><br /><a href="/castVote">Redirect to Cast Vote page.</a></center>'
          );
        }
      } else {
        res.send(
          '<center><h2>Login credentials are invalid!</h2><br /><a href="/castVote">Redirect to Cast Vote page.</a></center>'
        );
      }
    }
  } else {
    res.redirect("/castVote");
  }
});

app.post("/castVote/vote/getCandidates", async (req, res) => {
  // console.log("start");
  if (req.session != null && req.session.publicKey) {
    // console.log(req.session.publicKey);
    const cands = await interact
      .voteContract()
      .getCandidates(req.session.publicKey);
    // console.log(cands);
    res.send(cands);
  } else {
    res.redirect("/castVote");
  }
});

app.get("/castVote/vote", (req, res) => {
  if (req.session != null && req.session.publicKey) {
    res.sendFile(path.join(__dirname, "pages", "castVote_Cands.html"));
  } else {
    res.redirect("/castVote");
  }
});

app.post("/castVote/vote", async (req, res) => {
  const body = req.body;
  if (req.session != null && req.session.publicKey) {
    if (body.candidate !== "") {
      const contract = await interact.voteContract();
      const isVoted = await contract.verifyVote(req.session.publicKey);
      // console.log(isVoted);
      if (!isVoted) {
        // console.log("From app.js: Candidate Hash - " + body.candidate);
        const result = await contract.vote(
          req.session.publicKey,
          body.candidate
        );
        await result.wait();
        const returnValue = await contract.verifyVote(req.session.publicKey);
        console.log(returnValue);
        if (returnValue) {
          res.send(
            '<center><h2>Your have casted your vote successfully!!</h2><br /><a href="/castVote">Redirect to Cast Vote page.</a></center>'
          );
        } else {
          res.send(
            '<center><h2>Your vote was invalid!</h2><br /><a href="/castVote">Redirect to Cast Vote page.</a></center>'
          );
        }
      } else {
        res.send(
          '<center><h2>Your have already casted your vote!</h2><br /><a href="/castVote">Redirect to Cast Vote page.</a></center>'
        );
      }
    } else {
      res.send(
        '<center><h2>You have\'nt chosen a candidate!</h2><br /><a href="/castVote">Redirect to Cast Vote page.</a></center>'
      );
    }
    // console.log("THE END");
    req.session.destroy((err) => {});
  } else {
    res.redirect("/castVote");
  }
});

app.get("/results", (req, res) => {
  if (req.session != null && req.session.userid) {
    res.sendFile(path.join(__dirname, "pages", "results.html"));
  } else {
    res.redirect("/login");
  }
});

app.post("/results/constituencies", async (req, res) => {
  if (req.session != null && req.session.userid) {
    const constituencies = await interact.voteContract().getConstituencies();
    res.send(constituencies);
  } else {
    res.redirect("/login");
  }
});

app.post("/results/fetch", async (req, res) => {
  if (req.session != null && req.session.userid) {
    // console.log(req.session.publicKey);
    if (req.body.constituency !== "") {
      const contract = await interact.voteContract();
      const cands = await contract.getConstituencyCandidates(
        req.body.constituency
      );
      // console.log(cands);
      res.send(cands);
    } else {
      res.send(
        '<center><h2>You have\'nt chosen any constituency!</h2><br /><a href="/login">Redirect to Cast Login page.</a></center>'
      );
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/");
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Listening on port https://localhost:${port}`)
);

module.exports.handler = serverless(app);
