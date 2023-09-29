export function formatCommitMessage(message: string, newVersion: string): string {
	return message.replace(new RegExp("{{currentTag}}", "g"), newVersion);
}
