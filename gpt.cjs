const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env["Nvidia_API_KEY"],
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main(prompt) {
  const response = await openai.chat.completions.create({
    model: "mistralai/mistral-nemotron",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    top_p: 0.7,
    max_tokens: 4096,
    stream: false,
  });
  const reply=response.choices[0].message.content
  return reply;
 

}
main().catch((err) => {
  console.log("The sample encountered an error: " + err.message);
});

module.exports = main;
