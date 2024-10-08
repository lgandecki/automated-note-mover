import {
  Plugin,
  Notice,
  MarkdownView,
  TFile,
  normalizePath,
  Editor,
} from "obsidian";

export default class AutomatedNoteMover extends Plugin {
  async onload() {
    this.addCommand({
      id: "process-current-line",
      name: "Process Current Line",
      callback: () => this.processCurrentLine(),
    });
  }

  async processCurrentLine() {
    const activeView = this.getActiveMarkdownView();
    if (!activeView) return;

    const editor = activeView.editor;
    const lineText = this.getCurrentLineText(editor).trim();

    const { command, args } = this.parseCommand(lineText);

    switch (command) {
      case "move":
        await this.handleMoveCommand(args);
        break;
      case "title":
        await this.handleTitleCommand(args);
        break;
      default:
        new Notice("No recognized action on the current line.");
    }
  }

  private getActiveMarkdownView(): MarkdownView | null {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice("No active markdown view.");
      return null;
    }
    return activeView;
  }

  private getCurrentLineText(editor: Editor): string {
    const cursor = editor.getCursor();
    return editor.getLine(cursor.line);
  }

  private parseCommand(lineText: string): { command: string; args: string } {
    const [command, ...args] = lineText.split(" ");
    return { command: command.toLowerCase(), args: args.join(" ") };
  }

  private async handleMoveCommand(args: string) {
    const moveCommandRegex = /^\[\[([^\]|]+)(?:\|.*)?\]\]/;
    const match = args.match(moveCommandRegex);

    if (match) {
      const destinationLink = match[1].trim();
      await this.moveCurrentFile(destinationLink);
    } else {
      new Notice("Invalid move command format.");
    }
  }

  private async moveCurrentFile(destinationLink: string) {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice("No active file to move.");
      return;
    }

    const { destinationFolderPath, targetFileName, destinationPath } =
      this.getDestinationPath(destinationLink, file.name);

    try {
      await this.createFolderIfNotExists(destinationFolderPath);

      const destinationFile = this.app.metadataCache.getFirstLinkpathDest(
        destinationPath,
        ""
      );

      let targetPath: string;
      let fileExisted = false;

      if (!destinationFile) {
        targetPath = normalizePath(
          `${destinationFolderPath}/${targetFileName}`
        );
      } else {
        targetPath = normalizePath(`${destinationFolderPath}/${file.name}`);
        fileExisted = true;
      }

      // Check if the current file name matches the header before moving
      const shouldUpdateTitle = this.shouldUpdateFileTitle(file);

      await this.app.fileManager.renameFile(file, targetPath);
      new Notice(`Moved file to ${targetPath}`);

      const newFileName = fileExisted ? file.name : targetFileName;

      // Only update the file title if it matched before moving
      if (shouldUpdateTitle) {
        await this.updateFileTitle(targetPath, newFileName);
      }
    } catch (error) {
      new Notice("Failed to move file: " + (error as Error).message);
    }
  }

  private getDestinationPath(destinationLink: string, currentFileName: string) {
    const destinationPath = destinationLink.split("|")[0];

    const pathParts = destinationPath.split("/");
    const newFileName = pathParts.pop() || currentFileName.replace(".md", "");
    const destinationFolder = pathParts.join("/");

    const destinationFolderPath = normalizePath(destinationFolder);
    const targetFileName = `${this.sanitizeFileName(newFileName)}.md`;

    return { destinationFolderPath, targetFileName, destinationPath };
  }

  private async createFolderIfNotExists(folderPath: string) {
    if (!(await this.app.vault.adapter.exists(folderPath))) {
      try {
        await this.app.vault.createFolder(folderPath);
      } catch (error) {
        throw new Error("Failed to create folder: " + (error as Error).message);
      }
    }
  }

  private async updateFileTitle(filePath: string, fileName: string) {
    const sanitizedTitle = this.sanitizeFileName(fileName.replace(".md", ""));

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView?.file?.path === filePath) {
      const editor = activeView.editor;
      const firstLine = editor.getLine(0) || "";

      editor.replaceRange(
        `# ${sanitizedTitle}`,
        { line: 0, ch: 0 },
        { line: 0, ch: firstLine.length }
      );
    } else {
      const newFile = await this.app.vault.getAbstractFileByPath(filePath);
      if (newFile instanceof TFile) {
        const content = await this.app.vault.read(newFile);
        const lines = content.split("\n");
        lines[0] = `# ${sanitizedTitle}`;
        await this.app.vault.modify(newFile, lines.join("\n"));
      }
    }
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[\\/:*?"<>,|]/g, "-");
  }

  private async handleTitleCommand(_args: string) {
    // Placeholder for "title" action implementation
    new Notice("Title action is not implemented yet.");
  }

  // Updated method to check if the file name matches the header
  private shouldUpdateFileTitle(file: TFile): boolean {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView?.file === file) {
      const editor = activeView.editor;
      const firstLine = editor.getLine(0) || "";
      const headerTitle = firstLine.startsWith("# ")
        ? firstLine.substring(2).trim()
        : "";
      const fileName = file.name.replace(".md", "");
      return (
        this.sanitizeFileName(headerTitle) === this.sanitizeFileName(fileName)
      );
    }
    return false;
  }
}
