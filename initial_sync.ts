function initialSync() {
    const calendarId =
        PropertiesService.getScriptProperties().getProperty("CALENDAR_ID");
    const optionalArgs = {
        timeMin: new Date().toISOString(),
        singleEvents: true,
    };

    const items = Calendar.Events.list(calendarId, optionalArgs);
    const nextSyncToken = items.nextSyncToken;
    PropertiesService.getScriptProperties().setProperty(
        "SYNC_TOKEN",
        nextSyncToken,
    );
}
