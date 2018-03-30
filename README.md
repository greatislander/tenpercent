# Ten Percent

Ten Percent (l10n percent) is a Node.js microservice which uses the [Transifex REST API](https://docs.transifex.com/api/introduction) to retrieve the translation status of a given Transifex project. I made Ten Percent so that I could use a [Shields.io dynamic badge](http://shields.io/#dynamic-badge) to display the translation status of the [Pressbooks](https://github.com/pressbooks/pressbooks) Open Source project and encourage ongoing localization efforts. Hopefully others will find it useful for their projects as well!

## Requirements

- A [Transifex API token](https://www.transifex.com/user/settings/api/)
- A [Now](https://zeit.co/now) account (other hosting services should work too — Heroku, etc.)


## Setup

1. Install the [Now CLI](https://zeit.co/download#now-cli) on your device and log in to your Now account.
2. Add your Transifex API token as a [secret](https://zeit.co/docs/getting-started/secrets):

```
$ now secrets add transifex-api-token "<your token>"
```
3. Deploy [greatislander/tenpercent](https://github.com/greatislander/tenpercent/) to [Now](https://zeit.co/docs/features/repositories). Be sure to assign the secret you created in step 2 to the `TRANSIFEX_API_TOKEN` environment variable:

```
$ now greatislander/tenpercent -e TRANSIFEX_API_TOKEN=@transifex-api-token
```

## Usage

TODO.