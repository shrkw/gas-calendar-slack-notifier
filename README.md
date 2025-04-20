# gas-calendar-slack-notifier

A Google Apps Script project that notifies new Calendar Events to Slack.
Since Google Calendar for Team Events was discontinued, this serves as a replacement.

## Installation

### Create Project and Push

This project is intended to be run on a DevContainer.

If you are not using a DevContainer, you will need to install `@google/clasp` with the following command:

```sh
npm install -g @google/clasp
```

Then, run the following commands:

```sh
clasp login
clasp create YOUR_NEW_PROJECT
clasp push
clasp open
```

Your default credential will be stored at `/home/node/.clasprc.json`.

## Set Script Properties

Set the following Script Properties on the Project Settings page:

- CALENDAR_ID_LIST
    - Comma-separated, no spaces
- SLACK_WEBHOOK_URL
    - Create your own Slack app

## Run initial sync to fetch calendar next sync token

Run `run_initial_sync` from the GAS console.
If you want to run for group calendars, there may be cases where the `nextSyncToken` is not included. This is because the `timeMin` parameter is ignored in such scenarios.
In such cases, set the `maxResults` parameter to 2500 and add the `nextPageToken` parameter. Repeat the process until the `nextSyncToken` is retrieved.

## Set up the triggers

Set a Time-Driven trigger. Recommend setting it to run every 10 minutes.
