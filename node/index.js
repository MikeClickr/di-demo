const express = require("express");
const irma = require("@privacybydesign/irmajs");
const app = express();
const cors = require("cors");
const storage = require("node-persist");
const fs = require("fs");
const skey = fs.readFileSync("../config/private_key.pem", "utf-8");

const port = 8000;

init();

const irmaServer = "http://de4c96f4.eu.ngrok.io";

const request = {
  type: "disclosing",
  content: [
    {
      label: "Uw emailadres",
      attributes: ["pbdf.pbdf.email.email"]
    }
  ]
};

async function init() {
  try {
    await storage.init();

    app.use(express.json());

    app.get("/hello", (req, res) => res.send("Hello World!"));
    // app.get("/", (req, res) => res.send("REST API Server"));

    app.options("/vote", cors());
    app.post("/vote", cors(), vote);
    app.get("/stats", cors(), stats);
    app.get("/getsession", cors(), irmaSession);

    // app.use(express.static("../openstad"));

    app.listen(port, () =>
      console.log(`Voting app listening on port ${port}.`)
    );
  } catch (e) {
    error(e);
  }
}

async function irmaSession(req, res) {
  const authmethod = "publickey";
  const requestorname = "openstad_voting_pk";

  console.log("irma.startSession", {
    irmaServer,
    request: JSON.stringify(request),
    authmethod,
    requestorname
  });

  try {
    const session = await irma.startSession(
      irmaServer,
      request,
      authmethod,
      skey,
      requestorname
    );
    res.json(session);
  } catch (e) {
    error(e, res);
  }
}

async function vote(req, res) {
  try {
    const alreadyVoted = await storage.getItem(req.body.email);

    console.log(req.body.email, "alreadyVoted", alreadyVoted);

    if (!alreadyVoted || true) {
      storage.setItem(req.body.email, true);

      console.log("Voted for", req.body.vote);

      let currentVote = await storage.getItem(req.body.vote);

      if (!currentVote) {
        currentVote = 0;
      }

      currentVote++;

      /*******************************************
       *
       * This is demo code, not for production.
       *
       * Reading and writing a vote should be an atomic operation.
       *
       *******************************************/
      storage.setItem(req.body.vote, currentVote);
    }

    res.json({ alreadyVoted, vote: req.body.vote });
  } catch (e) {
    error(e, res);
  }
}

async function stats(req, res) {
  const search = req.url.substr(req.url.indexOf("?") + 1);
  const params = new URLSearchParams(search);
  const items = params.get("items").split(",");
  const votesPromises = items.map(item => storage.getItem(item));
  try {
    const votesArray = await Promise.all(votesPromises);
    const votes = items.reduce((acc, item, i) => {
      acc[item] = votesArray[i];
      return acc;
    }, {});
    res.json({ votes });
  } catch (e) {
    error(e, res);
  }
}

function error(e, res) {
  console.error("Node error", e);
  if (res) {
    res.json({ error: JSON.stringify(e) });
  }
}
