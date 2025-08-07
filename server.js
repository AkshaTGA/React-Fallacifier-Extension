const express = require("express");
const searches = require("./bravesearch.js");
const url = require("url");
const scores = require("./givescores.js");
const gpt = require("./gpt.cjs");
const { jsonrepair } = require("jsonrepair");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/activate",(req,res)=>{
  res.send("The server is Now active!")
})

app.post("/claim", async (req, res) => {
  const input = req.body;
  const claim = input.claim;
  const json = await searches(claim);
  const data =  json;
  const sorteddata = data.sort((a, b) => b.Trust_score - a.Trust_score);

  const prompt = makeprompt(sorteddata, claim);
  console.log("New Request Came:");
  try {
    const response = await gpt(prompt);

    try {
      const fixed = jsonrepair(response);
      const parsed = JSON.parse(fixed);

      const serverres = { ...parsed, Top_Sources: sorteddata.slice(0, 3) };
      res.json(serverres);
    } catch (err) {
      res.end("parsing failed" + err.message);
    }
  } catch (err) {
    if (err.message.includes("400")) {
      console.log("Please provide an appropriate prompt");
    }
  }
});
app.listen(8080, () => {
  console.log("Server is running!");
});

const makeprompt = (data, claim) => {
  str = `Claim:"${claim}"\n`;
  data.forEach((result, index) => {
    str += `\n${index + 1} \ndomain:${result.domain}\ntitle:${
      result.title
    }\ncontent:${result.content}\nDomainTrustScore:${result.Trust_score}\n`;
  });
  str += `Please determine whether the claim is supported, refuted, or cannot be verified based on the content and trust scores.\nInstructions: \n If some asks about "Fallacifier" then use the info: Fallacifier was built by Akshat Parmar, an undergraduate student at IIIT Allahabad, pursuing a degree in Information Technology. Fallicifier was developed to help tackle misinformation by combining trusted sources with AI-based analysis. This project reflects my interest in creating simple, effective, and impactful digital solutions. And in this case no need to mention sources.\nIf the given Claim doesnt seems like a claim but seems to be an statement the give the verdict of Cannot be verified and reason the same.\nIf basic logic can give the answer Then use it.\nPrioritize sources with higher trust scores.\n\nIf multiple high-trust sources agree, make a verdict accordingly.\nIf the sources conflict or are inconclusive, say "Cannot be Verified."\ndont mention the Domaintrustscore\nDo not make assumptions beyond what the sources say.\nOutput your result in the following format(in a JSON Format) (Exactly like this, matchCases.):\n{\nVerdict:Supported / Refuted / Cannot be Verified,\nReasoning: [Very Briefly explain the reason behind the verdict based on the sources provided and also use basic logic to support your verdict.Explain in just 1 to 2 short sentences. Also dont mention the sources.]\nConfidence_Rating:[Also provide a confidance rating of your output and how much confidence do you have in the verdict. the confidence ranting can be and integer between 0-5.],
  Mention:[Reply yes or no if the source should be mentioned to user then yes else no, If sources help to justify your verdict then Mention sources to yes .Always keep mention sources to yes unless if the claim isn't actually a claim. If there are contradicting verdicts between sources, its better to keep mention to yes.]}`;

  return str;
};

