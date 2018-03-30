const fetch = require('node-fetch');
const { parse } = require('url');
const { createError } = require('micro');
const cache = require('micro-cacheable');

const microFn = async (req, res) => {
  let statusCode, data;
  let token = process.env.TRANSIFEX_API_TOKEN;
  let { organization, project, resource } = parse(req.url, true).query;
  if (!organization) {
    throw createError(500, 'You must specify an organization.');
  }
  if (!project) {
    throw createError(500, 'You must specify a project.');
  }
  if (!resource) {
    resource = 0;
  }
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
  console.log(response);

  if (response.status === 401) {
    throw createError(401, 'The API token is missing or invalid.');
  } else if (response.status === 404) {
    throw createError(404, 'The organization or project could not be found.');
  } else if (response.status === 200) {
    if (json.hasOwnProperty(resource)) {
      let translated = Number(
        (json[resource].stats.translated.percentage * 100).toFixed(2)
      );
      return {
        status: translated
      };
    } else {
      throw createError(404, 'The resource could not be found.');
    }
  }
};

module.exports = cache(24 * 60 * 60 * 1000, microFn);
