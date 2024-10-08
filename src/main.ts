import { Plugin, Notice, MarkdownView, TFile, normalizePath } from "obsidian";

export default class MyPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "process-current-line",
      name: "Process Current Line",
      callback: () => this.processCurrentLine(),
    });
  }

  async processCurrentLine() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice("No active markdown view.");
      return;
    }

    const editor = activeView.editor;
    const cursor = editor.getCursor();
    const lineText = editor.getLine(cursor.line).trim();

    if (lineText.startsWith("move")) {
      const moveCommandRegex = /^move\s+\[\[([^\]|]+)(\|.*)?\]\]/;
      const match = lineText.match(moveCommandRegex);

      if (match) {
        const destinationLink = match[1].trim();
        await this.moveCurrentFile(destinationLink);
      } else {
        new Notice("Invalid move command format.");
      }
    } else if (lineText.startsWith("title")) {
      // Placeholder for "title" action implementation
      new Notice("Title action is not implemented yet.");
    } else {
      new Notice("No recognized action on the current line.");
    }
  }

  async moveCurrentFile(destinationLink: string) {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice("No active file to move.");
      return;
    }

    // Ignore alias if present
    const destinationPath = destinationLink.split("|")[0];

    // Extract folder path and new file name from the destination
    const pathParts = destinationPath.split("/");
    const newFileName = pathParts.pop() + ".md";
    const destinationFolder = pathParts.join("/");

    // Normalize paths
    const destinationFolderPath = normalizePath(destinationFolder);
    const fullDestinationPath = normalizePath(
      `${destinationFolderPath}/${newFileName}`
    );

    // Create the destination folder if it doesn't exist
    if (!(await this.app.vault.adapter.exists(destinationFolderPath))) {
      try {
        await this.app.vault.createFolder(destinationFolderPath);
      } catch (error) {
        new Notice("Failed to create folder: " + (error as Error).message);
        return;
      }
    }

    // Check if the destination file already exists
    const destinationFile = this.app.metadataCache.getFirstLinkpathDest(
      destinationPath,
      ""
    );
    let targetPath: string;

    if (!destinationFile) {
      // Destination file does not exist, move and rename current file
      targetPath = fullDestinationPath;
    } else {
      // Destination file exists, move current file to destination folder, keep current name
      targetPath = `${destinationFolderPath}/${file.name}`;
    }

    try {
      await this.app.fileManager.renameFile(file, targetPath);
      new Notice(`Moved file to ${targetPath}`);
    } catch (error) {
      new Notice("Failed to move file: " + (error as Error).message);
    }
  }
}
