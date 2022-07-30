"use strict";
/**
 * @file 格式化 单vue组件 文件
 * @author fe_bean
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ts = require("typescript");
const path = require("path");
const read_file_1 = require("./read_file");
let { window, Position, Range, workspace, } = vscode;
let editor;
let previewColumn = 2;
let tplStr = '';
class Main {
    constructor(context) {
        // 活动窗口
        editor = window.activeTextEditor;
        // 当前窗口document
        this.doc = editor.document;
        this.tsDoc = undefined;
        this.text = '';
        this.newText = '';
        this.previewMode = this.getConfig().mode || 'editor';
        this.context = context;
        this.themeSource = '';
        this.scriptSource = '';
        this.init();
    }
    init() {
        // 获取配置
        // let conf = this.getConfig();
        // vscode.window.showInformationMessage('gogo');
        this.takeTrans(0);
        this.bindEvn();
    }
    bindEvn() {
        let that = this;
        let timer;
        workspace.onDidChangeTextDocument(function (e) {
            clearTimeout(timer);
            if (window.visibleTextEditors.length < 1) {
                return;
            }
            let lineStart = 0;
            timer = setTimeout(() => {
                if (e.contentChanges.length > 0) {
                    lineStart = e.contentChanges[0].range.start.line;
                }
                if (e.document === that.doc) {
                    // 触发 ts 编译
                    that.takeTrans(lineStart);
                }
            }, 100);
        });
    }
    takeTrans(lineStart) {
        // 内容
        this.text = this.doc.getText();
        // ts 转化 js
        this.newText = this.tsTpJsContent();
        //****************** 计划加入 markdown.preview 形式，可能会有性能提升 */
        if (this.previewMode === 'webview') {
            // webview 展示
            if (!tplStr) {
                tplStr = read_file_1.rHtml('../resource/template.html', { mini: true });
            }
            if (!this.scriptSource) {
                this.scriptSource = this.getScript();
            }
            if (!this.themeSource) {
                this.themeSource = this.getThemes();
            }
            this.previewOnWebview();
        }
        else if (this.previewMode === 'editor') {
            // 新窗口展示 js preview | 编辑器形式
            this.previewOnDoc();
        }
    }
    getThemes() {
        const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'resource', 'theme.css'));
        return onDiskPath.with({ scheme: 'vscode-resource' });
    }
    getScript() {
        const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'resource', 'highlight.pack.js'));
        return onDiskPath.with({ scheme: 'vscode-resource' });
    }
    tsTpJsContent() {
        let oContent = ts.transpileModule(this.text, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2016,
            },
            reportDiagnostics: true,
        });
        return oContent.outputText;
    }
    getPreviewDoc() {
        window.showTextDocument(this.tsDoc, {
            viewColumn: previewColumn,
            preserveFocus: true,
            preview: true,
        }).then((textEditor) => {
            if (textEditor.document === this.tsDoc) {
                this.writeFile(textEditor);
                return;
            }
        });
    }
    previewOnDoc() {
        if (this.tsDoc) {
            this.getPreviewDoc();
        }
        else {
            workspace.openTextDocument({
                content: this.newText,
                language: 'javascript',
            }).then(doc => {
                this.tsDoc = doc;
                window.showTextDocument(this.tsDoc, {
                    viewColumn: previewColumn,
                    preserveFocus: true,
                    preview: true,
                });
            });
        }
    }
    previewOnWebview() {
        // webview 形式预览 ? 只支持html?
        if (!this.panel) {
            this.panel = window.createWebviewPanel('js.preview', 'ts-preview', previewColumn, {
                enableScripts: true
            });
        }
        let code = `<code class="javascript">${this.newText}</code>`;
        let tplStr1 = tplStr
            .replace(/\$\{code\}/, code)
            .replace(/\$\{themeSource\}/, `${this.themeSource.scheme}:${this.themeSource.path}`)
            .replace(/\$\{scriptSource\}/, `${this.scriptSource.scheme}:${this.scriptSource.path}`)
            .trim();
        this.panel.webview.html = tplStr1;
    }
    /**
     * 更新已有的 js preview 内容
     * @param tarEditor
     */
    writeFile(tarEditor) {
        // 行数
        let lineCount = tarEditor.document.lineCount || 0;
        let start = new Position(0, 0);
        let end = new Position(lineCount + 1, 0);
        let range = new Range(start, end);
        void tarEditor.edit((editBuilder) => {
            editBuilder.replace(range, this.newText);
        });
    }
    getConfig() {
        let configMode = workspace.getConfiguration('ts-preview').get('mode');
        console.log(configMode);
        return {
            mode: configMode
        };
    }
}
exports.Main = Main;
//# sourceMappingURL=main.js.map