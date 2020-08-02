const fetch = require('node-fetch');
const {Buffer} = require('safe-buffer');

module.exports = async (request, response) => {
	const token = process.env.TRANSIFEX_API_TOKEN;
	let {organization, project, resource} = request.query;
	if (!organization) {
		response.status(500).send('You must specify an organization.');
	}

	if (!project) {
		response.status(500).send('You must specify a project.');
	}

	if (!resource) {
		resource = 'all';
	}

	const endpoint = (resource === 'all') ? `https://api.transifex.com/organizations/${organization}/projects/${project}/resources/` : `https://api.transifex.com/organizations/${organization}/projects/${project}/resources/${resource}`;

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
		if (resource === 'all') {
			let stringCount = 0;
			let translatedStringCount = 0;

			for (const resource of json) {
				stringCount += resource.stringcount;
				translatedStringCount += resource.stringcount * resource.stats.translated.percentage;
			}

			response.status(200).send({
				status: Number(
					(translatedStringCount / stringCount * 100).toFixed(2)
				)
			});
		} else {
			let stringCount = 0;

			for (const element of Object.values(json.stats)) {
				stringCount += element.translated.stringcount;
			}

			const translated = Number(
				(stringCount / (Object.values(json.stats).length * json.stringcount) * 100).toFixed(2)
			);

			response.status(200).send({
				status: translated
			});
		}
	}
};
