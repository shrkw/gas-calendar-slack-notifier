function run_initial_sync() {
	const calendarIdList =
		PropertiesService.getScriptProperties().getProperty("CALENDAR_ID_LIST");
	for (const calendarId of calendarIdList.split(",")) {
		fetchFirstSyncToken(calendarId);
	}
}

function fetchFirstSyncToken(calendarId: string) {
	// timeMinが無視されるっぽい
	const optionalArgs = {
		timeMin: new Date().toISOString(),
		singleEvents: true,
	};

	const items = Calendar.Events.list(calendarId, optionalArgs);
	const nextSyncToken = items.nextSyncToken;
	PropertiesService.getScriptProperties().setProperty(
		`SYNC_TOKEN_${calendarId}`,
		nextSyncToken,
	);
}
