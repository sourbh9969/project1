"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function rHtml(dir, opt) {
    let htmlStr = '';
    let absoluteDir = path.resolve(__dirname, dir);
    if (fs.existsSync(absoluteDir)) {
        htmlStr = fs.readFileSync(absoluteDir, 'utf-8');
    }
    else {
        console.log(absoluteDir, 'is not exit');
    }
    if (opt.mini) {
        htmlStr = htmlStr.replace(/[\r\t\n\s]+/, ' ');
    }
    return htmlStr;
}
exports.rHtml = rHtml;
//# sourceMappingURL=read_file.js.map