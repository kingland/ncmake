import fs from 'fs';
import os from 'os';

export function writeFile(filePath: string, lines: string[]): void {
    fs.writeFileSync(filePath, lines.join(os.EOL),{encoding: 'utf8'});
}

export function appendFile(filePath: string, lines: string[]){
    fs.appendFileSync(filePath,lines.join(os.EOL),{encoding: 'utf8'});
}

export function writeFileSections(filePath: string, linesSections: { [sectionName: string]: string[] }): void {
    var allLines: string[] = [];
    var props = Object.keys(linesSections);
    for (var i = 0, size = props.length; i < size; i++) {
        var sectionLines = linesSections[props[i]];
        Array.prototype.push.apply(allLines, sectionLines);
    }

    writeFile(filePath, allLines);
}

export function appendFileSections(filePath: string, linesSections: { [sectionName: string]: string[] }): void {
    var allLines: string[] = [];
    var props = Object.keys(linesSections);
    for (var i = 0, size = props.length; i < size; i++) {
        var sectionLines = linesSections[props[i]];
        Array.prototype.push.apply(allLines, sectionLines);
    }
    appendFile(filePath, allLines);
}

export function joinLinesForFile(text: string) {
    var res = text.replace(/\n/g, "\r\n").replace(/\t/g, "    ");
    return res;
}

export function writeFileLines(fileName: string, srcLines: string[]): void {
    var text = srcLines.join("\n");
    text = joinLinesForFile(text);

    fs.writeFileSync(fileName, text);
}

export function appendFileLines(fileName: string, srcLines: string[]): void {
    var text = srcLines.join("\n");
    text = joinLinesForFile(text);

    fs.appendFileSync(fileName, text);
}

export function writeFileLinesAsync(fileName: string, srcLines: string[], 
    doneCb: (msg: string) => void, errorCb: (errMsg: string) => void,
    postFileWritten?: (fileName: string, successCb: () => void, errorCb: (err: any) => void) => void): void {
    var text = srcLines.join("\n");
    text = joinLinesForFile(text);

    fs.writeFile(fileName, text, (writeErr) => {
        if (writeErr) {
            errorCb("error writing generated '" + fileName + "': " + writeErr);
            return;
        }

        if (postFileWritten) {
            postFileWritten(fileName, 
            () => {
                doneCb("'" + fileName + "' " + srcLines.length + " lines");
            }, 
            (compileErr) => {
                errorCb("error writing file '" + fileName + "': " + compileErr);
            });
        }
        else {
            doneCb("'" + fileName + "' " + srcLines.length + " lines");
        }
    });
}

export function appendFileLinesAsync(fileName: string, srcLines: string[], 
    doneCb: (msg: string) => void, errorCb: (errMsg: string) => void,
    postFileWritten?: (fileName: string, successCb: () => void, errorCb: (err: any) => void) => void): void {
    
    var text = srcLines.join("\n");
    text = joinLinesForFile(text);

    fs.appendFile(fileName, text, (writeErr) => {
        if (writeErr) {
            errorCb("error writing generated '" + fileName + "': " + writeErr);
            return;
        }

        if (postFileWritten) {
            postFileWritten(fileName, 
            () => {
                doneCb("'" + fileName + "' " + srcLines.length + " lines");
            }, 
            (compileErr) => {
                errorCb("error writing file '" + fileName + "': " + compileErr);
            });
        }
        else {
            doneCb("'" + fileName + "' " + srcLines.length + " lines");
        }
    });
}