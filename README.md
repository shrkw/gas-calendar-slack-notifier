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

### Set Script Properties

Set the following Script Properties on the Project Settings page:

- CALENDAR_ID_LIST
    - Comma-separated, no spaces
- SLACK_WEBHOOK_URL
    - Create your own Slack app

### Set up the triggers

Set a Time-Driven trigger. Recommend setting it to run every 10 minutes.
