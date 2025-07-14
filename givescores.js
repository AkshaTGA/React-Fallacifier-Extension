const url = require("url");
const { parse } = require("tldts");
const firebase = require("firebase/compat/app");
require("firebase/compat/database");
require("dotenv").config();


const firebaseConfig = {
  apiKey: process.env["firebase_API_KEY"],
  authDomain: process.env["firebase_AuthDomain"],
  projectId: process.env["firebase_ProjectID"],
  storageBucket: process.env["firebase_StorageBucket"],
  messagingSenderId: process.env["firebase_messagingSenderId"],
  appId: process.env["firebase_AppID"],
  measurementId: process.env["firebase_measurementId"],
  databaseURL:process.env["firebase_databaseURL"],
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function giveurlscores(domain = null, domainobj = null) {
  let score = 0;
  const tld = parse(domain).publicSuffix;
  const protocoll = domainobj.protocol;
  if (protocoll == "https:") score += 1;
  if (
    tld == "gov" ||
    tld == "gov.in" ||
    tld == "ac.uk" ||
    tld == "int" ||
    tld == "mil" ||
    tld == "nic.in"
  )
    score += 6;
  else if (tld == "edu") score += 3;
  else if (tld == "org") score += 2;
  else if (tld === "com" || tld === "in" || tld === "dev" || tld === "io")
    score += 1;
  else if (
    tld == "xyz" ||
    tld == "abcd" ||
    tld == "tk" ||
    tld == "ml" ||
    tld == "cf"
  )
    score -= 1;
  else {
    score -= 1;
  }
  if (domain.split(".").length > 4) score -= 1;

  const regex =
    /(blog|blogspot|wordpress|weebly|free|host|unofficial|altnews|clickbait)/i;

  if (regex.test(domain)) {
    score -= 2;
  }
  score = Math.max(0, Math.min(score, 10));

  return score;
}


function getOrUpdateScore(urll) {
  
  const domainobj = url.parse(urll);
  const domain = domainobj.protocol + "//" + domainobj.hostname;



  return new Promise((resolve, reject) => {
    const domainKey = domain.replaceAll('.', '_');
    const domainRef = db.ref("domains/" + domainKey); 

    domainRef.once("value")
      .then(snapshot => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          const newScore = giveurlscores(domain,domainobj);
          domainRef.set(newScore)
            .then(() => {
              resolve(newScore)})
            .catch(reject);
        }
      })
      .catch(reject);
  });
}





module.exports = getOrUpdateScore;
