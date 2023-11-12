import { Environment } from "./environment";

export class TargetOptions {
    protected m_options: any;

    constructor(options: any){
        this.m_options = options || {};
    }

    get arch(){
        return this.m_options.arch || Environment.arch;
    }

    get isX86(){
        return this.arch === "ia32" || this.arch === "x86";
    }

    get isX64(){
        return this.arch === "x64";
    }

    get isArm(){
        return this.arch === "arm";
    }

    /*get runtime(){
        return this.m_options.runtime || environment.runtime;
    }

    get runtimeVersion(){
        return this.m_options.runtimeVersion || environment.runtimeVersion;
    }*/
}