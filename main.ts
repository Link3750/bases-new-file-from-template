import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	templatePath: string; // 模板文件路径
	showTemplateSelector: boolean; // 是否显示模板选择器
	templateFolder: string; // 模板文件夹路径
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	templatePath: 'Templates/模板.md', // 默认模板路径
	showTemplateSelector: false, // 默认不显示模板选择器
	templateFolder: 'Templates' // 默认模板文件夹
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// 添加设置标签页
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// 监听特定 class 按钮的点击事件
		this.registerDomEvent(document, 'click', async (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
		
			// 检查点击的元素或其父元素是否包含目标 class
			const button = target.closest('.bases-toolbar-item.bases-toolbar-new-item-menu');
		
			if (button) {
				// 阻止默认行为，取消 Obsidian 的新建文件操作
				evt.preventDefault();
				evt.stopPropagation();
				evt.stopImmediatePropagation();
				
				console.log('目标按钮被点击了！', button);
				
				// 如果启用了模板选择器，显示选择器；否则使用配置的模板
				if (this.settings.showTemplateSelector) {
					new TemplateSelectorModal(this.app, this).open();
				} else {
					await this.createFileFromTemplate();
				}
			}
		}, true);
	}

	// 根据模板创建新文件
	async createFileFromTemplate(templatePath?: string, folderPath?: string) {
		try {
			// 判断是否是明确选择空白模板
			const isBlankTemplate = templatePath === '';
			
			// 从配置中获取模板文件路径，如果传入了参数则使用参数
			const path = isBlankTemplate ? '' : (templatePath || this.settings.templatePath || 'Templates/模板.md');
			
			// 获取模板内容
			const templateContent = await this.getTemplateContent(path);
			
			// 生成新文件名（使用当前日期时间）
			const now = new Date();
			const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
			const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
			const newFileName = `新文件-${dateStr}-${timeStr}.md`;
			
			// 确定文件夹路径：优先使用传入的参数，否则使用当前文件所在文件夹，最后使用根目录
			let targetFolderPath = folderPath;
			if (!targetFolderPath) {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					const parent = activeFile.parent;
					if (parent) {
						targetFolderPath = parent.path;
					}
				}
			}
			
			// 确定文件内容
			let content = templateContent;
			if (isBlankTemplate) {
				// 明确选择空白模板，创建空文件
				content = '';
			} else if (!content) {
				// 模板文件不存在，创建空白文件并给出提醒
				content = '';
				new Notice(`模板文件未找到 (${path})，已创建空白文件`);
			}
			
			// 创建新文件
			const newFilePath = targetFolderPath ? `${targetFolderPath}/${newFileName}` : newFileName;
			const newFile = await this.app.vault.create(newFilePath, content);
			
			// 打开新创建的文件
			await this.app.workspace.getLeaf().openFile(newFile);
			
			if (templateContent) {
				new Notice(`已根据模板创建新文件: ${newFileName}`);
			} else if (isBlankTemplate) {
				new Notice(`已创建空白文件: ${newFileName}`);
			}
		} catch (error) {
			console.error('创建新文件时出错：', error);
			new Notice(`创建新文件失败: ${error.message}`);
		}
	}

	// 读取模板文件内容
	async getTemplateContent(templatePath: string): Promise<string> {
		try {
			// 如果模板路径为空，直接返回空字符串
			if (!templatePath || templatePath.trim() === '') {
				return '';
			}

			const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
			
			if (templateFile instanceof TFile) {
				return await this.app.vault.read(templateFile);
			} else {
				console.warn(`模板文件未找到: ${templatePath}`);
				return '';
			}
		} catch (error) {
			console.error('读取模板文件时出错：', error);
			return '';
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

// 模板选择器模态框
class TemplateSelectorModal extends Modal {
	plugin: MyPlugin;
	templateFiles: TFile[] = [];
	selectedFolderPath: string = '';
	allFolders: TFolder[] = [];

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: '选择模板' });

		// 加载所有文件夹
		this.loadAllFolders();

		// 文件夹选择器
		const folderSetting = new Setting(contentEl)
			.setName('选择文件夹')
			.setDesc('选择新文件要创建的位置（可在搜索框中搜索文件夹名称）');
		
		// 创建文件夹选择器容器
		const folderContainer = folderSetting.controlEl.createDiv('folder-selector-container');
		
		// 获取默认文件夹路径
		const activeFile = this.app.workspace.getActiveFile();
		let defaultFolderPath = '';
		let defaultFolderText = '根目录';
		if (activeFile) {
			const parent = activeFile.parent;
			if (parent) {
				defaultFolderPath = parent.path;
				defaultFolderText = `当前文件夹 (${defaultFolderPath})`;
			}
		} else {
			// 如果没有打开的笔记，默认选择根目录
			defaultFolderPath = '';
			defaultFolderText = '根目录';
		}
		
		// 存储所有文件夹选项数据
		const folderOptions: Array<{value: string, text: string}> = [];
		if (defaultFolderPath) {
			folderOptions.push({ value: defaultFolderPath, text: defaultFolderText });
		}
		this.allFolders.forEach(folder => {
			folderOptions.push({ value: folder.path, text: folder.path });
		});
		
		// 设置默认选中值
		this.selectedFolderPath = defaultFolderPath || '';
		
		// 显示当前选中值的输入框（只读）
		const displayInput = folderContainer.createEl('input', {
			type: 'text',
			value: defaultFolderText,
			cls: 'folder-display-input'
		});
		displayInput.readOnly = true;
		
		// 创建一个包装容器，将输入框和下拉列表组合在一起
		const inputWrapper = folderContainer.createDiv('folder-input-wrapper');
		inputWrapper.appendChild(displayInput);
		
		// 搜索输入框（用于过滤和搜索）
		const searchInput = inputWrapper.createEl('input', {
			type: 'text',
			placeholder: '搜索文件夹名称...',
			cls: 'folder-search-input'
		});
		searchInput.style.display = 'none'; // 初始隐藏
		
		// 悬浮下拉列表容器（放在同一个包装容器中）
		const dropdownList = inputWrapper.createDiv('folder-dropdown-list');
		dropdownList.style.display = 'none';
		
		// 当前显示的选项列表
		let currentOptions = [...folderOptions];
		let selectedIndex = defaultFolderPath ? 1 : 0; // 如果有默认文件夹，选中它；否则选中根目录（索引0）
		
		// 渲染下拉列表
		const renderDropdown = (options: Array<{value: string, text: string}>) => {
			dropdownList.empty();
			
			if (options.length === 0) {
				const noResult = dropdownList.createDiv('folder-dropdown-item folder-dropdown-item-disabled');
				noResult.textContent = '未找到匹配的文件夹';
				return;
			}
			
			options.forEach((option, index) => {
				const item = dropdownList.createDiv('folder-dropdown-item');
				item.textContent = option.text;
				item.dataset.value = option.value;
				
				if (index === selectedIndex && option.value === this.selectedFolderPath) {
					item.classList.add('folder-dropdown-item-selected');
				}
				
				item.addEventListener('click', () => {
					this.selectedFolderPath = option.value;
					displayInput.value = option.text;
					searchInput.value = '';
					hideDropdown();
				});
				
				item.addEventListener('mouseenter', () => {
					// 移除所有选中状态
					dropdownList.querySelectorAll('.folder-dropdown-item-selected').forEach(el => {
						el.classList.remove('folder-dropdown-item-selected');
					});
					item.classList.add('folder-dropdown-item-selected');
					selectedIndex = index;
				});
			});
		};
		
		// 显示下拉列表
		const showDropdown = () => {
			renderDropdown(currentOptions);
			dropdownList.style.display = 'block';
			searchInput.style.display = 'block';
			inputWrapper.classList.add('folder-dropdown-open');
			searchInput.focus();
		};
		
		// 隐藏下拉列表
		const hideDropdown = () => {
			dropdownList.style.display = 'none';
			searchInput.style.display = 'none';
			inputWrapper.classList.remove('folder-dropdown-open');
			searchInput.value = '';
			currentOptions = [...folderOptions];
			selectedIndex = defaultFolderPath ? 1 : 0; // 如果有默认文件夹，选中它；否则选中根目录
		};
		
		// 点击显示输入框时显示下拉列表
		displayInput.addEventListener('click', (e) => {
			e.stopPropagation();
			if (dropdownList.style.display === 'none') {
				showDropdown();
			} else {
				hideDropdown();
			}
		});
		
		// 搜索功能
		searchInput.addEventListener('input', (e) => {
			const searchTerm = (e.target as HTMLInputElement).value.toLowerCase().trim();
			
			if (searchTerm === '') {
				currentOptions = [...folderOptions];
				selectedIndex = defaultFolderPath ? 1 : 0; // 如果有默认文件夹，选中它；否则选中根目录
			} else {
				currentOptions = folderOptions.filter(option => {
					return option.text.toLowerCase().includes(searchTerm);
				});
				selectedIndex = 0;
			}
			
			renderDropdown(currentOptions);
		});
		
		// 键盘导航
		searchInput.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, currentOptions.length - 1);
				renderDropdown(currentOptions);
				const items = dropdownList.querySelectorAll('.folder-dropdown-item');
				if (items[selectedIndex]) {
					items[selectedIndex].scrollIntoView({ block: 'nearest' });
				}
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				renderDropdown(currentOptions);
				const items = dropdownList.querySelectorAll('.folder-dropdown-item');
				if (items[selectedIndex]) {
					items[selectedIndex].scrollIntoView({ block: 'nearest' });
				}
			} else if (e.key === 'Enter') {
				e.preventDefault();
				if (currentOptions[selectedIndex]) {
					const option = currentOptions[selectedIndex];
					this.selectedFolderPath = option.value;
					displayInput.value = option.text;
					searchInput.value = '';
					hideDropdown();
				}
			} else if (e.key === 'Escape') {
				e.preventDefault();
				hideDropdown();
			}
		});
		
		// 点击外部区域时隐藏下拉列表
		const handleClickOutside = (e: MouseEvent) => {
			if (!folderContainer.contains(e.target as Node)) {
				hideDropdown();
			}
		};
		
		document.addEventListener('click', handleClickOutside);
		
		// 清理事件监听器（在模态框关闭时）
		const originalOnClose = this.onClose.bind(this);
		this.onClose = () => {
			document.removeEventListener('click', handleClickOutside);
			originalOnClose();
		};
		
		// 初始渲染
		renderDropdown(currentOptions);

		// 获取模板文件夹中的所有文件
		this.loadTemplateFiles();

		// 显示模板文件列表
		const templateList = contentEl.createDiv('template-list');
		
		if (this.templateFiles.length === 0) {
			templateList.createEl('p', { 
				text: `未找到模板文件。请检查模板文件夹路径: ${this.plugin.settings.templateFolder || 'Templates'}` 
			});
			
			// 添加"使用空白模板"选项
			const blankOption = templateList.createDiv('template-item');
			const blankInfo = blankOption.createDiv('template-info');
			blankInfo.createEl('span', {
				text: '空白模板',
				cls: 'template-name'
			});
			blankInfo.createEl('span', {
				text: ' - 创建一个空白的 Markdown 文件',
				cls: 'template-path'
			});
			const blankButton = blankOption.createEl('button', { 
				text: '选择',
				cls: 'mod-cta template-button'
			});
			blankButton.addEventListener('click', async () => {
				await this.plugin.createFileFromTemplate('', this.selectedFolderPath);
				this.close();
			});
		} else {
			// 显示所有模板文件
			this.templateFiles.forEach(template => {
				const templateItem = templateList.createDiv('template-item');
				
				// 创建左侧内容区域（名称和路径在同一行）
				const templateInfo = templateItem.createDiv('template-info');
				templateInfo.createEl('span', {
					text: template.basename,
					cls: 'template-name'
				});
				templateInfo.createEl('span', {
					text: ` - ${template.path}`,
					cls: 'template-path'
				});
				
				// 创建右侧按钮
				const button = templateItem.createEl('button', { 
					text: '选择',
					cls: 'mod-cta template-button'
				});

				button.addEventListener('click', async () => {
					await this.plugin.createFileFromTemplate(template.path, this.selectedFolderPath);
					this.close();
				});
			});

			// 添加"使用空白模板"选项
			const blankOption = templateList.createDiv('template-item');
			const blankInfo = blankOption.createDiv('template-info');
			blankInfo.createEl('span', {
				text: '空白模板',
				cls: 'template-name'
			});
			blankInfo.createEl('span', {
				text: ' - 创建一个空白的 Markdown 文件',
				cls: 'template-path'
			});
			const blankButton = blankOption.createEl('button', { 
				text: '选择',
				cls: 'mod-secondary template-button'
			});
			blankButton.addEventListener('click', async () => {
				await this.plugin.createFileFromTemplate('', this.selectedFolderPath);
				this.close();
			});
		}

		// 添加取消按钮
		const cancelButton = contentEl.createEl('button', {
			text: '取消',
			cls: 'mod-secondary'
		});
		cancelButton.style.marginTop = '1rem';
		cancelButton.addEventListener('click', () => {
			this.close();
		});
	}

	loadAllFolders() {
		// 获取所有文件夹
		this.allFolders = [];
		const root = this.app.vault.getRoot();
		
		const traverse = (folder: TFolder) => {
			this.allFolders.push(folder);
			if (folder.children) {
				folder.children.forEach(child => {
					if (child instanceof TFolder) {
						traverse(child);
					}
				});
			}
		};
		
		if (root instanceof TFolder) {
			traverse(root);
		}
		
		// 按路径排序
		this.allFolders.sort((a, b) => a.path.localeCompare(b.path));
	}

	loadTemplateFiles() {
		const templateFolder = this.plugin.settings.templateFolder || 'Templates';
		
		// 获取模板文件夹
		const folder = this.app.vault.getAbstractFileByPath(templateFolder);
		
		if (folder instanceof TFolder) {
			// 如果是文件夹，获取其中的所有 .md 文件
			this.templateFiles = folder.children
				.filter((file): file is TFile => file instanceof TFile && file.extension === 'md')
				.sort((a: TFile, b: TFile) => a.basename.localeCompare(b.basename));
		} else {
			// 如果文件夹不存在，尝试在整个仓库中查找模板文件
			this.templateFiles = this.app.vault.getMarkdownFiles()
				.filter(file => {
					const path = file.path;
					return path.startsWith(templateFolder + '/') || path === templateFolder;
				})
				.sort((a: TFile, b: TFile) => a.basename.localeCompare(b.basename));
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: '插件设置' });

		// 是否显示模板选择器
		new Setting(containerEl)
			.setName('手动选择模板')
			.setDesc('启用后，点击新建按钮时会弹出模板选择器，让你手动选择要使用的模板文件。')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTemplateSelector)
				.onChange(async (value) => {
					this.plugin.settings.showTemplateSelector = value;
					await this.plugin.saveSettings();
				}));

		// 模板文件夹配置
		new Setting(containerEl)
			.setName('模板文件夹路径')
			.setDesc('设置模板文件夹路径（例如: Templates）。当启用"手动选择模板"时，将从此文件夹中查找模板文件。')
			.addText(text => text
				.setPlaceholder('Templates')
				.setValue(this.plugin.settings.templateFolder)
				.onChange(async (value) => {
					this.plugin.settings.templateFolder = value;
					await this.plugin.saveSettings();
				}));

		// 模板路径配置
		new Setting(containerEl)
			.setName('默认模板文件路径')
			.setDesc('设置用于创建新文件的默认模板文件路径（例如: Templates/模板.md）。当未启用"手动选择模板"时使用此路径。如果模板文件不存在，将创建空白文件。')
			.addText(text => text
				.setPlaceholder('Templates/模板.md')
				.setValue(this.plugin.settings.templatePath)
				.onChange(async (value) => {
					this.plugin.settings.templatePath = value;
					await this.plugin.saveSettings();
				}));
	}
}
