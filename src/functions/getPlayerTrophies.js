const { existsSync, readFileSync } = require("fs");
const { join } = require("path");
const { fetch } = require("undici");
const agent = require("../config/agent.js")

module.exports = {
  name: "$getPlayerTrophies",
  type: "djs",
  code: async (d) => {
  const data = d.util.aoiFunc(d);
  const [id, tokenName] = data.inside.splits;

  if (!id || id.trim() === "") {
    return d.aoiError.fnError(d, "custom", {}, "No game id provided.");
  }

  if (!tokenName || tokenName.trim() === "") {
    return d.aoiError.fnError(d, "custom", {}, "No token name provided.");
  }

  const idRegex = /^#[A-Za-z0-9]+$/;
  if (!idRegex.test(id.trim())) {
    return d.aoiError.fnError(d, "custom", {}, "Invalid game id. The id must start with '#'.");
  }

  const filePath = join(process.cwd(), "./src/config/.tokens.json");

  if (!existsSync(filePath)) {
    return d.aoiError.fnError(d, "custom", {}, "Token file does not exist.");
  }

  const tokens = JSON.parse(readFileSync(filePath, "utf8"));
  const tokenValue = tokens[tokenName];

  if (tokenValue === undefined) {
    return d.aoiError.fnError(d, "custom", {}, `No token found with the name '${tokenName}'.`);
  }

  try {
    const response = await fetch(`https://api.brawlstars.com/v1/players/%23${id.slice(1)}`, {
      headers: {
        Authorization: `Bearer ${tokenValue}`
      },
      agent: agent
    });

  if (!response.ok) {
  console.error(
    "\x1b[37m%s\x1b[36m%s\x1b[37m%s\x1b[0m \x1b[31m%s\x1b[0m: %s",
    "[", "aoi.brawlapi", "]",
    "Network response error",
    response.statusText,
    response.status,
    reponse.url
  );
  return d.aoiError.fnError(d, "custom", {}, "Failed to retrieve player club. Please check the ID and token.");;
}

  const playerData = await response.json();
  const playerTrophies = playerData.trophies;

  data.result = playerTrophies;

  return {
    code: d.util.setCode(data)
    };
  } catch (error) {
    return d.aoiError.fnError(d, "custom", {}, "Failed to retrieve player trophies. Please check the id and token.");
  }
}
}
