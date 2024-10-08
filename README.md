# Automated Note Mover Plugin for Obsidian

An Obsidian plugin that automates moving and renaming notes within your vault using simple commands written directly in your notes.

## Features

- **Move Notes**: Easily move the current note to a specified folder and rename it by writing a command in the note.
- **Automatic Folder Creation**: If the destination folder does not exist, it will be created automatically.
- **Title Update**: Updates the note's title (first line) to match the new filename after moving.
- **Seamless Integration**: Works within Obsidian's interface without disrupting your workflow.

## Installation

### From GitHub

1. **Download the Plugin**:

   - [Download the latest release](https://github.com/lgandecki/automated-note-mover/releases) from GitHub.
   - Alternatively, clone the repository:

     ```bash
     git clone https://github.com/lgandecki/automated-note-mover.git
     ```

2. **Copy to Obsidian Plugins Folder**:

   - Locate your Obsidian vault's `.obsidian/plugins/` folder.
   - Create a new folder named `automated-note-mover`.
   - Copy the contents of the cloned repository or extracted zip file into this folder.

3. **Enable the Plugin in Obsidian**:

   - Open Obsidian.
   - Go to **Settings** (click the gear icon in the left sidebar).
   - Navigate to **Community Plugins**.
     - If prompted, disable Safe Mode to allow community plugins.
   - Click on **Installed Plugins**.
   - Find **Automated Note Mover** in the list and toggle it **ON**.

### From Obsidian Marketplace (when available)

- **Note**: This plugin is not yet available in the Obsidian Community Plugin Marketplace. Once approved, you can install it directly from within Obsidian. For now, use BART or build manually.

## Usage

### Process Current Line Command

The plugin introduces a new command: **"Process Current Line"**.

- **Accessing the Command**:
  - Open the Command Palette with `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS).
  - Type **"Process Current Line"** to find and execute the command.
- **Shortcut**:
  - For quick access, you can assign a custom keyboard shortcut:
    - Go to **Settings** → **Hotkeys**.
    - Search for **"Process Current Line"**.
    - Assign your preferred key combination.

### Moving and Renaming Notes

1. **Write the Move Command**:

   - In your note, write a line starting with `move` followed by the destination in double square brackets `[[ ]]`.
     ```markdown
     move [[DestinationFolder/NewFileName]]
     ```
   - Examples:
     - Move and rename the note:
       ```
       move [[Projects/NextWeek/MeetingNotes]]
       ```
     - Move to a folder without renaming:
       ```
       move [[Archives/]]
       ```
     - You can keep the alias (which will be ignored):
       ```
       move [[Research/Topic|My Alias]]
       ```

2. **Execute the Command**:

   - Place your cursor anywhere on the line containing the `move` command.
   - Run the **"Process Current Line"** command via the Command Palette or your custom shortcut.

3. **Result**:

   - The current note will be moved to the specified destination.
   - If a new filename is provided, the note will be renamed accordingly.
   - The first line (title) of the note will be updated to match the new filename.
   - If the destination folder does not exist, it will be created automatically.
   - A confirmation notice will appear:
     ```
     Moved file to DestinationFolder/NewFileName.md
     ```

### Notes on Command Syntax

- **Valid Commands**:

  - Must start with `move` followed by a space.
  - The destination must be enclosed in `[[double square brackets]]`.
  - The destination can include folders and subfolders.

- **Invalid Commands**:

  - Commands not starting with `move` (e.g., `mv`, `Move`).
  - Missing brackets or incorrect formatting.

- **Error Handling**:
  - If the command format is invalid, a notice will inform you:
    ```
    Invalid move command format.
    ```
  - If there is no active file or markdown view, appropriate notices will appear.

## Examples

### Move and Rename the Note

```markdown
move [[Work/Reports/Weekly Update]]
```

- **Action**: Moves the current note to `Work/Reports/` and renames it to `Weekly Update.md`.
- **Result**: The note's title is updated to `# Weekly Update`.

### Move to a Folder Without Changing the Filename

```markdown
move [[Personal/Journal/]]
```

- **Action**: Moves the current note to `Personal/Journal/` without renaming.
- **Result**: The note's title remains the same or is updated to match the filename.

### Move with Alias (Alias is Ignored)

```markdown
move [[Books/ToRead|Reading List]]
```

- **Action**: Moves the current note to `Books/` and renames it to `ToRead.md`.
- **Result**: The alias `Reading List` is ignored.

## Configuration

No additional configuration is required. The plugin works out of the box with the default settings.

## Development

### Building from Source

Currently to use the project, or to contribute or modify the plugin:

1. **Prerequisites**:

   - [Node.js](https://nodejs.org/) installed (preferably version 14 or higher).
   - Basic knowledge of TypeScript and Obsidian plugin development.

2. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/automated-note-mover.git
   ```

3. **Install Dependencies**:

   ```bash
   cd automated-note-mover
   pnpm install
   ```

4. **Build the Plugin**:

   - For development (with watch mode).
     note: it will copy the relevant files to your plugins folder initially and on change, but you need to set the OBSIDIAN_VAULT_PLUGINS_PATH

     ```bash
     export OBSIDIAN_VAULT_PLUGINS_PATH="/path/to/vault/.obsidian/plugins/" npm run dev
     ```

     - This will watch for changes and automatically rebuild the plugin.

   - For production:

     ```bash
     npm run build
     ```

5. **Link to Obsidian Vault**:

   - Create a symbolic link from the build folder to your vault's plugins folder:

     ```bash
     ln -s /path/to/automated-note-mover /path/to/your/vault/.obsidian/plugins/automated-note-mover
     ```

6. **Reload Obsidian**:

   - After building, reload Obsidian to see the changes:
     - Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (macOS).

### Contributing

Contributions are welcome! Here's how you can help:

- **Report Bugs**: If you find a bug, please open an issue with detailed information.
- **Suggest Features**: Have an idea for a new feature? Feel free to create an issue to discuss it.
- **Submit Pull Requests**: Code improvements, optimizations, and refactoring are appreciated.

### Code Style Guidelines

- Follow the existing coding style and structure.
- Write clear, concise, and self-documenting code.
- Ensure all changes maintain the plugin's functionality and reliability.

## License

[MIT License](LICENSE)

- This plugin is open-source and free to use under the terms of the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on the [GitHub repository](https://github.com/yourusername/automated-note-mover/issues).

## Acknowledgments

- **Obsidian Community**: Thanks to the Obsidian team and community for creating a powerful and extensible platform.
- **Contributors**: Thank you to everyone who has contributed to this project.

## Disclaimer

- Use this plugin at your own risk.
- Always back up your Obsidian vault before using plugins that modify files.

---

Enjoy streamlined note management with the Automated Note Mover plugin!
