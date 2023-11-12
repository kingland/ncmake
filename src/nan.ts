import path from 'path';
import fs from 'fs/promises';

async function isNANModule (dir: string) {
    const h = path.join(dir, "nan.h");
    try {
        const stat = await fs.stat(h);
        return stat.isFile();
    }
    catch (e) {
        return false;
    }
}

async function isNodeJSProject (dir: string) {
    const pjson = path.join(dir, "package.json");
    const node_modules = path.join(dir, "node_modules");
    try {
        let stat = await fs.stat(pjson);
        if (stat.isFile()) {
            return true;
        }
        stat = await fs.stat(node_modules);
        if (stat.isDirectory()) {
            return true;
        }
    }
    catch (e) {
        // Ignore
    }
    return false;
}


export async function locateNAN (projectRoot: string) : Promise<any> {
    /*if (locateNAN.__projectRoot) {
        // Override for unit tests
        projectRoot = locateNAN.__projectRoot;
    }*/

    let result = await isNodeJSProject(projectRoot);
    if (!result) {
        return null;
    }

    const nanModulePath = path.join(projectRoot, "node_modules", "nan");
    result = await isNANModule(nanModulePath);
    if (result) {
        return nanModulePath;
    }

    // Goto upper level:
    return await locateNAN(goUp(projectRoot));
}

function goUp(dir: string) {
    const items = dir.split(path.sep);
    const scopeItem = items[items.length - 2];
    if (scopeItem && scopeItem[0] === "@") {
        // skip scope
        dir = path.join(dir, "..");
    }
    dir = path.join(dir, "..", "..");
    return path.normalize(dir);
}
