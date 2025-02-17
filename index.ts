function notifyCreatedHolidayEvents() {
    const calendarId =
        PropertiesService.getScriptProperties().getProperty("CALENDAR_ID");
    const nextSyncToken =
        PropertiesService.getScriptProperties().getProperty("SYNC_TOKEN");
    const optionalArgs = {
        syncToken: nextSyncToken,
    };
    const calendarEvents = Calendar.Events.list(calendarId, optionalArgs);
    Logger.log(calendarEvents.items);
    const events = calendarEvents.items;
    PropertiesService.getScriptProperties().setProperty(
        "SYNC_TOKEN",
        calendarEvents.nextSyncToken,
    );

    // 2. 通知メッセージの組み立て
    let message = "";
    switch (events.length) {
        case 0:
            return;
        case 1:
            message = "*1* event was created";
            break;
        default:
            message = `*${events.length}* events were created`;
    }

    const attachments = events.map(function (event) {
        Logger.log(event);
        return generateSlackMessage(event);
    });

    // 3. Slackに通知
    if (!attachments.length) return;
    postToSlack(message, attachments);
}

function generateSlackMessage(event) {
    if (!event || !event.summary) {
        return null; // 無効なイベントは無視
    }

    var eventTitle = event.summary;
    var eventStart = event.start.dateTime || event.start.date; // 終日イベント対応
    var eventEnd = event.end.dateTime || event.end.date;
    var eventLocation = event.location || "場所なし";
    var eventDescription = event.description
        ? `✏️ *詳細*: ${event.description}`
        : "";
    var eventLink = event.htmlLink;

    var message = `📅 🕒 *${formatDateTime(eventStart)} - ${formatDateTime(eventEnd)}*\n📍 *${eventLocation}*\n${eventDescription}`;

    return new Attachment(eventTitle, eventLink, message);
}

function formatDateTime(dateString) {
    var date = new Date(dateString);
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
    // メッセージがなければ通知しない
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
