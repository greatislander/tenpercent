# Ten Percent

Ten Percent (l10n percent) is a Node.js microservice which uses the [Transifex REST API](https://docs.transifex.com/api/introduction) to retrieve the localization status of a given Transifex resource. I made Ten Percent so that I could use a [Shields.io dynamic badge](http://shields.io/#dynamic-badge) to display the localization status of the [Pressbooks](https://github.com/pressbooks/pressbooks) Open Source project's resources and encourage ongoing localization efforts. Hopefully others will find it useful for their projects as well.

## Requirements

- A [Transifex API token](https://www.transifex.com/user/settings/api/)
- A [Now](https://zeit.co/now) account (other hosting services should work too — Heroku, etc.)


## Setup

1. Install the [Now CLI](https://zeit.co/download#now-cli) on your device and log in to your Now account.
2. Add your Transifex API token as a [secret](https://zeit.co/docs/getting-started/secrets):

```
$ now secrets add transifex-api-token "<TOKEN>"
```
3. Deploy [greatislander/tenpercent](https://github.com/greatislander/tenpercent/) to [Now](https://zeit.co/docs/features/repositories). Be sure to assign the secret you created in step 2 to the `TRANSIFEX_API_TOKEN` environment variable:

```
$ now greatislander/tenpercent -e TRANSIFEX_API_TOKEN=@transifex-api-token
```

## Usage

1. Visit your Now deploy, supplying the query parameters for `organization`, `project`, and optionally `resource` (`resource` defaults to `0`, the first resource by numeric index; if the project has multiple resources, you can select the appropriate one by supplying a different value). Verify that the resulting JSON object reflects the localization status of the desired resource (a numeric value corresponding to the percentage translated):

```
$ curl 'https://<SUBDOMAIN>.now.sh?organization=<ORGANIZATION>&project=<PROJECT>[&resource=<RESOURCE INDEX>]'
$ {"status":"10"}
```

If the API token is missing or invalid or if you have specified a non-existent Transifex organization, project or resource, `status` will provide an error message.

2. Use the URL you determined in step 1 to generate a [Shields.io dynamic badge](http://shields.io/#dynamic-badge) that shows the localization status of your Transifex project. You'll need to set the data type to JSON and the query to `$.status`.

```
https://img.shields.io/badge/dynamic/json.svg?url=<URL>&label=translated&query=$.status.&colorB=<COLOR>&prefix=<PREFIX>&suffix=%25
```

This URL will produce the following badge layout with the example response in step 1:

![Example Badge](https://img.shields.io/badge/translated-10%25-red.svg)

Now you can add a badge to your GitHub readme which will reflect the current localization status of your project.

## Notes

Responses from the Transifex REST API are cached for 24 hours to prevent excessive API calls, so you may not see the changes immediately.
