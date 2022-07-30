'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const main_1 = require("./main");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.tsPreview', () => {
        let acEditor = vscode.window.activeTextEditor;
        if (acEditor && acEditor.document.languageId == 'typescript') {
            new main_1.Main(context);
        }
        else {
            vscode.window.showInformationMessage('It‘s not a .ts(x) file');
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map