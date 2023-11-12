import os from 'os';
import which from 'which';


export type isMakeAvailableType = {
    value: boolean,
    writable?: boolean 
};

export type isClangAvailableType = {
    value: boolean,
    writable?: boolean
};

export type isNinjaAvailableType = {
    value: boolean,
    writable?: boolean
};

export type isGPPAvailableType = {
    value: boolean,
    writable?: boolean
}

var _isMakeAvailable: isMakeAvailableType | null = null;
var _isClangAvailable: isClangAvailableType | null = null;
var _isNinjaAvailable: isNinjaAvailableType | null = null;
var _isGPPAvailable: isGPPAvailableType | null = null;

export class Environment {
    static get cmakeJsVersion() {
        return require("../package.json").version
    }
    
    static get platform(){
        return os.platform()
    }

    static get isWin() {
        return  os.platform() === "win32"
    }

    static get isLinux(){
        return  os.platform() === "linux"
    }

    static get isOSX(){
        return  os.platform() === "darwin"
    }
    
    static get arch(){
        return  os.arch()
    }

    static get isX86(){
        return  os.arch() === "ia32" || os.arch() === "x86"
    }
    
    static get isX64(){
        return  os.arch() === "x64"
    }

    static get isArm(){
        return  os.arch() === "arm"
    }

    //runtime: "node",
    //runtimeVersion: process.versions.node,

    static get home(){
        return process.env[(os.platform() === "win32") ? "USERPROFILE" : "HOME"];
    }
    
    static get EOL(){
        return os.EOL
    }

    static get isPosix() {
        return !this.isWin;
    }

    static get isNinjaAvailable(){
        if (_isNinjaAvailable === null) {
            //this._isNinjaAvailable.value = false;
            _isNinjaAvailable = {
                value : false,
                writable : true
            };

            try {
                if (which.sync("ninja")) {
                    (_isNinjaAvailable as isNinjaAvailableType).value = true;
                }
            }
            catch (e) {
                // Ignore
            }
        }
        return _isNinjaAvailable;
    }


    static get isGPPAvailable() : isGPPAvailableType {
        if (_isGPPAvailable === null) {
            //this._isGPPAvailable = false;
            _isGPPAvailable = {
                value: false,
                writable: true
            };

            try {
                if (which.sync("g++")) {
                    (_isGPPAvailable as isGPPAvailableType).value  = true;
                }
            }
            catch (e) {
                // Ignore
            }
        }
        return _isGPPAvailable;
    }

    static get isMakeAvailable() : isMakeAvailableType {
        if (_isMakeAvailable === null) {

            _isMakeAvailable = {
                value: false,
                writable: true
            };
           
            try {
                if (which.sync("make")) {
                    (_isMakeAvailable as isMakeAvailableType).value = true;
                }
            }
            catch (e) {
                // Ignore
            }
        }
        return _isMakeAvailable;
    }

    static get isClangAvailable() : isClangAvailableType {
        if (_isClangAvailable === null) {         

            _isClangAvailable = {
                value: false,
                writable: true
            };

            try {
                if (which.sync("clang++")) {
                    (_isClangAvailable as isClangAvailableType).value = true;
                }
            }
            catch (e) {
                // Ignore
            }
        }
        return _isClangAvailable;
    }
}