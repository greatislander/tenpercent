const { parse } = require('url');
const { Buffer } = require('safe-buffer');
const fetch = require('node-fetch');
const { createError } = require('micro');
const cache = require('micro-cacheable');

const microFn = async req => {
  const token = process.env.TRANSIFEX_API_TOKEN;
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
  const response = await fetch(
    `https://api.transifex.com/organizations/${organization}/projects/${project}/resources/`,
    {
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`api:${token}`, 'utf8').toString('base64')
      }
    }
  );
  const json = await response.json();

  if (response.status === 401) {
    throw createError(401, 'The API token is missing or invalid.');
  } else if (response.status === 404) {
    throw createError(404, 'The organization or project could not be found.');
  } else if (response.status === 200) {
    if (Object.prototype.hasOwnProperty.call(json, resource)) {
      const translated = Number(
        (json[resource].stats.translated.percentage * 100).toFixed(2)
      );
      return {
        status: translated
      };
    }
    throw createError(404, 'The resource could not be found.');
  }
};

module.exports = cache(24 * 60 * 60 * 1000, microFn);
