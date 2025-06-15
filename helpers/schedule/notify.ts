export async function notify(title: string, message: string) {
	await Bun.$`kitten notify -s system -a "ctql" "${title}" "${message}"`;
}
