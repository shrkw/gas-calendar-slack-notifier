function run() {
	const calendarIds = parseCalendarId();
	for (const calendarId of calendarIds) {
		const events = fetchUpdatedEvent(calendarId);
		if (events.length === 0) {
			Logger.log("No events to update");
			continue;
		}

		const message = buildPrimaryMessage(events);
		const attachments = buildSlackAttachments(events);

		if (!attachments.length) continue;
		postToSlack(message, attachments);
	}
}

function fetchUpdatedEvent(
	calendarId: string,
): GoogleAppsScript.Calendar.Schema.Event[] {
	Logger.log(`fetchUpdatedEvent: ${calendarId}`);
	const nextSyncToken = PropertiesService.getScriptProperties().getProperty(
		`SYNC_TOKEN_${calendarId}`,
	);
	const optionalArgs = {
		syncToken: nextSyncToken,
	};
	const calendarEvents = Calendar.Events.list(calendarId, optionalArgs);
	PropertiesService.getScriptProperties().setProperty(
		`SYNC_TOKEN_${calendarId}`,
		calendarEvents.nextSyncToken,
	);
	return calendarEvents.items;
}

function parseCalendarId(): string[] {
	const calendarIdList =
		PropertiesService.getScriptProperties().getProperty("CALENDAR_ID_LIST");
	return calendarIdList.split(",");
}

function buildSlackAttachments(
	events: GoogleAppsScript.Calendar.Schema.Event[],
) {
	return events.map((event) => {
		Logger.log(event);
		switch (event.status) {
			case "confirmed":
				return generateUpdateSlackMessage(event);
			case "cancelled":
				return generateCancelSlackMessage(event);
			default:
				return null;
		}
	});
}

function buildPrimaryMessage(
	events: GoogleAppsScript.Calendar.Schema.Event[],
): string {
	switch (events.length) {
		case 0:
			return "No events to update";
		case 1:
			return "*1* event was updated";
		default:
			return `*${events.length}* events were updated`;
	}
}

function generateCancelSlackMessage(
	event: GoogleAppsScript.Calendar.Schema.Event,
): Attachment {
	return {
		title: "🚫 イベントがキャンセルされました",
		title_link: null,
		text: `${formatDateTime(event.originalStartTime.dateTime)}, id: ${event.id}`,
		color: "#36a64f",
	};
}

function generateUpdateSlackMessage(
	event: GoogleAppsScript.Calendar.Schema.Event,
): Attachment {
	if (!event || !event.summary) {
		return null;
	}

	const eventStart = event.start.dateTime || event.start.date;
	const eventEnd = event.end.dateTime || event.end.date;
	const eventLocation = event.location || "場所なし";
	const eventDescription = event.description
		? `✏️ *詳細*: ${event.description}`
		: "";
	const message = `📅 🕒 *${formatDateTime(eventStart)} - ${formatDateTime(eventEnd)}*\n📍 *${eventLocation}*\n${eventDescription}`;

	return {
		title: event.summary,
		title_link: event.htmlLink,
		text: message,
		color: "#36a64f",
	};
}

function formatDateTime(dateString) {
	const date = new Date(dateString);
	return Utilities.formatDate(
		date,
		Session.getScriptTimeZone(),
		"yyyy/MM/dd HH:mm",
	);
}

// https://api.slack.com/reference/messaging/attachments
type Attachment = {
	title: string;
	title_link: string;
	text: string;
	color: string;
};

function postToSlack(message: string, attachments: Attachment[]) {
	if (!message) return;

	const payload = {
		text: message,
		attachments: attachments,
	};
	const body: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
		method: "post",
		contentType: "application/json",
		payload: JSON.stringify(payload),
	};

	const webhookUrl =
		PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
	const response = UrlFetchApp.fetch(webhookUrl, body);
}
