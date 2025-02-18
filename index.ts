function notifyCreatedHolidayEvents() {
	const events = fetchUpdatedEvent();
	if (events.length === 0) return;

	const message = buildPrimaryMessage(events);
	const attachments = buildSlackAttachments(events);

	if (!attachments.length) return;
	postToSlack(message, attachments);
}

function buildSlackAttachments(
	events, // : GoogleAppsScript.Calendar.Schema.Event[],
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

function buildPrimaryMessage(events) {
	switch (events.length) {
		case 0:
			return null;
		case 1:
			return "*1* event was updated";
		default:
			return `*${events.length}* events were updated`;
	}
}

function fetchUpdatedEvent() {
	const calendarId =
		PropertiesService.getScriptProperties().getProperty("CALENDAR_ID");
	const nextSyncToken =
		PropertiesService.getScriptProperties().getProperty("SYNC_TOKEN");
	const optionalArgs = {
		syncToken: nextSyncToken,
	};
	const calendarEvents = Calendar.Events.list(calendarId, optionalArgs);
	PropertiesService.getScriptProperties().setProperty(
		"SYNC_TOKEN",
		calendarEvents.nextSyncToken,
	);
	return calendarEvents.items;
}

function generateCancelSlackMessage(event) {
	return new Attachment(
		"🚫 イベントがキャンセルされました",
		null,
		`${formatDateTime(event.originalStartTime.dateTime)}, id: ${event.id}`,
	);
}

function generateUpdateSlackMessage(event) {
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

	return new Attachment(event.summary, event.htmlLink, message);
}

function formatDateTime(dateString) {
	const date = new Date(dateString);
	return Utilities.formatDate(
		date,
		Session.getScriptTimeZone(),
		"yyyy/MM/dd HH:mm",
	);
}

class Attachment {
	/*
	 * https://api.slack.com/reference/messaging/attachments
	 * @param {String} title 一番上に表示する文字列
	 * @param {String} titleLink titleに付与するリンク
	 * @param {String} text titleの下に表示する文字列
	 * @param {String} color Attachmentの縦線の色（#36a64eで固定）
	 */
	constructor(title, titleLink, text) {
		this.title = title;
		this.title_link = titleLink;
		this.text = text;
		this.color = "#36a64f";
	}
}

function postToSlack(message, attachments) {
	if (!message) return;

	const payload = {
		text: message,
		attachments: attachments,
	};
	const body = {
		method: "POST",
		payload: JSON.stringify(payload),
	};

	const webhookUrl =
		PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
	const response = UrlFetchApp.fetch(webhookUrl, body);
}
