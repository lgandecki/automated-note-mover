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

      // Sanitize the new file name and remove the extension
      const sanitizedTitle = this.sanitizeFileName(
        newFileName.replace(".md", "")
      );

      // If the file is open in the editor, replace the first line using the editor
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

      if (activeView && activeView.file.path === targetPath) {
        const editor = activeView.editor;
        const firstLine = editor.getLine(0);

        // Replace the first line
        editor.replaceRange(
          `# ${sanitizedTitle}`,
          { line: 0, ch: 0 },
          { line: 0, ch: firstLine.length }
        );
      } else {
        // If the file is not open, read the content, modify, and write back
        const newFile = await this.app.vault.getAbstractFileByPath(targetPath);
        if (newFile instanceof TFile) {
          const content = await this.app.vault.read(newFile);
          const lines = content.split("\n");

          // Replace the first line with the new title
          lines[0] = `# ${sanitizedTitle}`;

          // Join the content back together and write to the file
          await this.app.vault.modify(newFile, lines.join("\n"));
        }
      }
    } catch (error) {
      new Notice("Failed to move file: " + (error as Error).message);
    }
  }

  // Method to sanitize the filename by replacing invalid characters
  sanitizeFileName(name: string): string {
    // Replace invalid filename characters with a hyphen
    return name.replace(/[\\/:*?"<>,|]/g, "-");
  }
}
