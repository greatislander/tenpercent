const fetch = require('node-fetch');
const {Buffer} = require('safe-buffer');

async function fetchResource(organization, project, resource) {
	const token = process.env.TRANSIFEX_API_TOKEN;
	const endpoint = `https://api.transifex.com/organizations/${organization}/projects/${project}/resources/${resource}`;
	const data = await fetch(
		endpoint,
		{
			headers: {
				Authorization: 'Basic ' + Buffer.from(`api:${token}`, 'utf8').toString('base64')
			}
		}
	);
	const json = await data.json();
	return json;
}

module.exports = async (request, response) => {
	const token = process.env.TRANSIFEX_API_TOKEN;
	let {organization, project, resource, language} = request.query;
	if (!organization) {
		response.status(500).send('You must specify an organization.');
	}

	if (!project) {
		response.status(500).send('You must specify a project.');
	}

	if (!resource) {
		resource = 'all';
	}

	const endpoint = `https://api.transifex.com/organizations/${organization}/projects/${project}/resources/`;

	const data = await fetch(
		endpoint,
		{
			headers: {
				Authorization: 'Basic ' + Buffer.from(`api:${token}`, 'utf8').toString('base64')
			}
		}
	);
	const json = await data.json();

	if (data.status === 401) {
		response.status(401).send('The API token is missing or invalid.');
	} else if (data.status === 404) {
		response.status(404).send('The organization or project could not be found.');
	} else if (data.status === 200) {
		if (language) {
			// Handle language-specific requests.
			if (resource === 'all') {
				let stringCount = 0;
				let translatedStringCount = 0;
				let languageExists = true;
				const validLanguages = [];

				const promises = [];

				for (const element of json) {
					promises.push(fetchResource(organization, project, element.slug));
				}

				const resources = await Promise.all(promises);

				resources.forEach(element => {
					if (Object.prototype.hasOwnProperty.call(element.stats, language)) {
						stringCount += element.stringcount;
						translatedStringCount += element.stringcount * element.stats[language].translated.percentage;
					} else {
						languageExists = false;
						if (validLanguages.length === 0) {
							Object.keys(element.stats).forEach(key => {
								validLanguages.push(key);
							});
						}
					}
				});

				if (languageExists) {
					response.setHeader('Cache-Control', 's-maxage=86400');
					response.status(200).send({
						status: Number(
							(translatedStringCount / stringCount * 100).toFixed(2)
						)
					});
				} else {
					response.status(404).send(`The language '${language}' was not found in this project. Valid languages: ${validLanguages.join(', ')}`);
				}
			} else {
				const endpoint = `https://api.transifex.com/organizations/${organization}/projects/${project}/resources/${resource}`;

				const data = await fetch(
					endpoint,
					{
						headers: {
							Authorization: 'Basic ' + Buffer.from(`api:${token}`, 'utf8').toString('base64')
						}
					}
				);
				const json = await data.json();
				if (Object.prototype.hasOwnProperty.call(json.stats, language)) {
					response.setHeader('Cache-Control', 's-maxage=86400');
					response.status(200).send({
						resource: json,
						status: Number(
							(json.stats[language].translated.percentage * 100).toFixed(2)
						)
					});
				}
			}
		} else if (resource === 'all') {
			let stringCount = 0;
			let translatedStringCount = 0;

			for (const resource of json) {
				stringCount += resource.stringcount;
				translatedStringCount += resource.stringcount * resource.stats.translated.percentage;
			}

			response.setHeader('Cache-Control', 's-maxage=86400');
			response.status(200).send({
				status: Number(
					(translatedStringCount / stringCount * 100).toFixed(2)
				)
			});
		} else {
			const element = json.find(element => element.slug === resource);

			response.setHeader('Cache-Control', 's-maxage=86400');
			response.status(200).send({
				status: Number(
					(element.stats.translated.percentage * 100).toFixed(2)
				)
			});
		}
	}
};
