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
		resource = 0;
	}

	const data = await fetch(
		`https://api.transifex.com/organizations/${organization}/projects/${project}/resources/`,
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
		if (Object.prototype.hasOwnProperty.call(json, resource)) {
			const translated = Number(
				(json[resource].stats.translated.percentage * 100).toFixed(2)
			);
			response.status(200).send({
				status: translated
			});
		} else {
			response.status(404).send('The resource could not be found.');
		}
	}
};
