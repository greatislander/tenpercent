const { parse } = require('url');
const fetch = require('node-fetch');
const cache = require('micro-cacheable');

const microFn = async (req, res) => {
  let token = process.env.TRANSIFEX_API_TOKEN;
  let { organization, project } = parse(req.url, true).query;
  let response = await fetch(
    `https://api.transifex.com/organizations/${organization}/projects/${project}/resources/`,
    {
      headers: {
        Authorization:
          'Basic ' + new Buffer(`api:${token}`, 'utf8').toString('base64')
      }
    }
  );
  let json = await response.json();
  let translated = Number(
    (json[0].stats.translated.percentage * 100).toFixed(2)
  );
  return {
    translated: `${translated}%`
  };
};

module.exports = cache(24 * 60 * 60 * 1000, microFn);
