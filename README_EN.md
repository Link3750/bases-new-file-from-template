# Bases New Vault From Template

A simple Obsidian plugin that allows you to create new files using custom templates and specified folder locations, replacing bases's default new file behavior.

## 📖 Introduction

Bases New Vault From Template plugin intercepts Obsidian's new file creation operation, enabling you to:
- Create new files using custom templates
- Manually select which template to use
- Specify the location where new files are created
- Quickly search and select folders

This plugin is particularly suitable for users who frequently need to create standardized documents using templates, such as journals, notes, project documents, etc.

## ✨ Features

### Core Features

- **Template-based File Creation**: Create new files using predefined template files, maintaining consistent document formatting
- **Override Default Behavior**: Completely intercept bases's new file operation and replace it with custom logic
- **Smart Folder Selection**: Choose the target folder when creating files, with search functionality
- **Template Selector**: Optional manual template selection feature, supporting selection from multiple templates
- **Blank File Support**: Automatically create blank files with notifications if template files don't exist

### Advanced Features

- **Search Folders**: Enter keywords in the folder selector to quickly find target folders
- **Current Folder Detection**: Automatically detect the folder of the currently open note as the default creation location
- **File Naming**: Automatically generate timestamped filenames to avoid naming conflicts

## 🚀 Installation

### Install from Source

1. Clone or download this repository
2. Run in the project directory:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Copy the compiled files to your Obsidian plugins directory:
   - `main.js`
   - `styles.css`
   - `manifest.json`
   
   Target path: `<Your Vault>/.obsidian/plugins/bases-new-vault-from-template/`

5. Enable the plugin in Obsidian: **Settings → Community plugins → Enable plugin**

### Install from Community Plugin Market (if published)

1. Open Obsidian Settings
2. Go to **Community plugins**
3. Search for "Bases New Vault From Template"
4. Click Install and Enable

## 📝 Usage

### Basic Usage

1. **Configure Default Template**:
   - Open **Settings → Plugin Options → Bases New Vault From Template**
   - Enter your template file path in "Default Template File Path" (e.g., `Templates/Journal Template.md`)

2. **Click New File Button**:
   - Click the new file button in the toolbar (class: `bases-toolbar-item bases-toolbar-new-item-menu`)
   - The plugin will automatically create a new file using the configured template

### Advanced Usage

#### Enable Template Selector

1. In plugin settings, enable the "Manual Template Selection" toggle
2. Set "Template Folder Path" (e.g., `Templates`)
3. When clicking the new file button, a template selector will pop up
4. Select the template to use from the list, or choose "Blank Template" to create an empty file

#### Select Folder Location

When the template selector is enabled:
1. At the top of the template selector, a folder selector will be displayed
2. Click the folder input box to expand the dropdown list
3. Enter folder name in the search box to search
4. Select the target folder
5. After selecting a template, the new file will be created in the selected folder

## ⚙️ Configuration

### Settings Options

| Setting | Description | Default |
|---------|-------------|---------|
| **Manual Template Selection** | When enabled, clicking the new file button will pop up a template selector | Off |
| **Template Folder Path** | The folder path where template files are located | `Templates` |
| **Default Template File Path** | Default template path used when manual selection is not enabled | `Templates/模板.md` |

### Configuration Examples

**Scenario 1: Using a Single Template**
```
Manual Template Selection: Off
Default Template File Path: Templates/Journal Template.md
```

**Scenario 2: Multiple Template Selection**
```
Manual Template Selection: On
Template Folder Path: Templates
Default Template File Path: Templates/Default Template.md
```

## ⚠️ Important Notes

### Important Warnings

1. **Button Class Name Dependency**: This plugin depends on a specific button class name (`bases-toolbar-item bases-toolbar-new-item-menu`). If Obsidian updates cause class name changes, the plugin may not work properly.

2. **Template File Path**:
   - Template file paths are relative to the vault root directory
   - Ensure template files exist, otherwise blank files will be created
   - Paths are case-sensitive

3. **Folder Selection**:
   - If the selected folder doesn't exist, file creation may fail
   - It's recommended to ensure the target folder exists before creation

4. **File Naming**:
   - New files use timestamp naming: `新文件-YYYY-MM-DD-HH-MM-SS.md`
   - If filename conflicts occur, Obsidian will handle them automatically

5. **Performance Considerations**:
   - If there are many folders in the vault, loading the folder list may take some time
   - It's recommended to keep template files organized in a single folder

### Compatibility

- **Obsidian Version**: Requires version 0.15.0 or higher
- **Platform Support**: Supports both desktop and mobile (`isDesktopOnly: false`)

## 🛠️ Development

### Development Environment Setup

1. Ensure Node.js version >= 16
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development mode:
   ```bash
   npm run dev
   ```
4. After modifying `main.ts`, it will automatically compile to `main.js`

### Project Structure

```
obsidian-sample-plugin/
├── main.ts          # Main plugin file
├── styles.css       # Stylesheet
├── manifest.json    # Plugin manifest
├── package.json     # Project configuration
└── README.md        # Documentation
```

### Build Production Version

```bash
npm run build
```

## 🐛 Issue Reporting

If you encounter problems or have feature suggestions, please provide feedback through:

- Submit an Issue in the GitHub repository
- Contact the author: Link3750

## 📄 License

Please see the LICENSE file in the project root directory.

## 🙏 Acknowledgments

- Developed based on [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- Thanks to the Obsidian team for providing excellent APIs

## 📝 Changelog

### v1.0.0
- Initial release
- Support for template-based file creation
- Support for manual template selection
- Support for folder selection
- Support for folder search functionality

