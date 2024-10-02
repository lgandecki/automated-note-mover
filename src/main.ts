import { Plugin, TFile, Editor, MarkdownView, debounce } from "obsidian";

export default class RenameOnHeaderChangePlugin extends Plugin {
	// Store the last known header to prevent unnecessary renames
	private lastHeader = "";

	// Debounce the onEditorChange method
	private debouncedOnEditorChange = debounce(
		this.onEditorChange.bind(this),
		250,
		true
	);

	async onload() {
		this.registerEvent(
			this.app.workspace.on("editor-change", this.debouncedOnEditorChange)
		);
	}

	async onEditorChange(editor: Editor, markdownView: MarkdownView) {
		const file = markdownView.file;
		if (!file) return;

		// Get the content of the first line
		const firstLine = editor.getLine(0);
		// Match the first header (e.g., # Heading)
		const headerMatch = firstLine.match(/^#\s+(.*)/);

		if (headerMatch) {
			// Extract the heading text
			let newName = headerMatch[1].trim();

			// If the heading hasn't changed, do nothing
			if (newName === this.lastHeader) return;

			this.lastHeader = newName;

			// Sanitize the new filename
			newName = this.sanitizeFileName(newName) + ".md";

			// If the filename has changed, debounce the rename operation
			if (file.name !== newName) {
				this.debounceRenameFile(file, newName);
			}
		}
	}

	// Debounce the renameFile operation
	private debounceRenameFile = debounce(
		async (file: TFile, newName: string) => {
			const newFilePath = file.path.replace(file.name, newName);
			await this.app.fileManager.renameFile(file, newFilePath);
		},
		100,
		true
	);

	// Method to sanitize the filename by replacing invalid characters
	sanitizeFileName(name: string): string {
		// Replace invalid filename characters with an underscore
		return name.replace(/[\\/:*?"<>,|]/g, "-");
	}
}
