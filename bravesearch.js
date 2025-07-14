const scores = require("./givescores.js");
require("dotenv").config();

const searches = async (claim) => {
  return await fetch(
    `https://api.search.brave.com/res/v1/web/search?${new URLSearchParams({
      q: claim,
      count: 10,
      search_lang: "en",
    })}`,
    {
      headers: {
        "X-Subscription-Token": process.env["Brave_API_KEY"],
      },
    }
  )
    .then((response) => response.json())
    .then(async (data) => {
      const res = data.web.results;
      let output = await Promise.all(
      
      res.map(async(result) => {
        const score= await scores(result.url)
        const data= {
          domain: result.meta_url.hostname,
          link: result.url,
          title: result.title,
          content: result.description,
          Trust_score: score,
        };
        return data
      }))
      return output;
    });
};

module.exports = searches;
