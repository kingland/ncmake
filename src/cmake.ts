import { Environment } from "./environment";
import { Log } from "./log";
import { ProcessUtils } from "./processUtils";
import { Toolset } from "./toolset";

import path from 'path';
import fs from 'fs-extra';
import which from "which";
import { TargetOptions } from "./targetOptions";

export class CMake {
    protected m_options : any;
    protected m_log: Log;
    protected m_config: any;
    protected m_path: string;
    protected m_projectRoot: string;
    protected m_workDir: string;
    protected m_buildDir: string;
    protected m_isAvailable: boolean;
    protected m_toolset: Toolset;
    protected m_silent: boolean;
    protected m_targetOptions: TargetOptions;
    protected m_extraCMakeArgs: string[];

    get path() : string {
        return this.m_options.cmakePath || "cmake";
    }

    get isAvailable() : boolean {
        if (this.m_isAvailable === null) {
            this.m_isAvailable = CMake.isAvailable(this.m_options);
        }
        return this.m_isAvailable;
    }
    
    constructor(options: any | null){
        this.m_options = options || {};
    }

    public getGenerators() {
        return CMake.getGenerators(this.m_options, this.m_log);
    }

    public verifyIfAvailable() {
        if (!this.isAvailable) {
            throw new Error("CMake executable is not found. Please use your system's package manager to install it, or you can get installers from there: http://cmake.org.");
        }
    }

    private async getConfigureCommand(): Promise<string[]> {

        // Create command:
        let command = [this.m_path, this.m_projectRoot, "--no-warn-unused-cli"];
    
        const D: any[] = [];
    
        // CMake.js watermark
        D.push({"CMAKE_JS_VERSION": Environment.cmakeJsVersion});
    
        // Build configuration:
        D.push({"CMAKE_BUILD_TYPE": this.m_config});
        
        if (Environment.isWin) {
            D.push({"CMAKE_RUNTIME_OUTPUT_DIRECTORY": this.m_workDir});
        }
        else if (this.m_workDir.endsWith(this.m_config)) {
            D.push({"CMAKE_LIBRARY_OUTPUT_DIRECTORY": this.m_workDir});
        }
        else {
            D.push({"CMAKE_LIBRARY_OUTPUT_DIRECTORY": this.m_buildDir});
        }
    
        // In some configurations MD builds will crash upon attempting to free memory.
        // This tries to encourage MT builds which are larger but less likely to have this crash.
        D.push({"CMAKE_MSVC_RUNTIME_LIBRARY": "MultiThreaded$<$<CONFIG:Debug>:Debug>"})
    
        // Includes:
        //const includesString = await this.getCmakeJsIncludeString();
        //D.push({ "CMAKE_JS_INC": includesString });
    
        // Sources:
        //const srcsString = this.getCmakeJsSrcString();
        //D.push({ "CMAKE_JS_SRC": srcsString });
    
        // Runtime:
        //D.push({"NODE_RUNTIME": this.targetOptions.runtime});
        //D.push({"NODE_RUNTIMEVERSION": this.targetOptions.runtimeVersion});
        //D.push({"NODE_ARCH": this.targetOptions.arch});
    
        // OSX:
        if (Environment.isOSX) {
            if (this.m_targetOptions.arch) {
                let xcodeArch = this.m_targetOptions.arch
                if (xcodeArch === 'x64') xcodeArch = 'x86_64'
                D.push({CMAKE_OSX_ARCHITECTURES: xcodeArch})
            }
        }
    
        // Custom options
        /*for (const [key, value] of Object.entries(this.cMakeOptions)) {
            D.push({ [key]: value });
        }*/
    
        // Toolset:
        await this.m_toolset.initialize(); //false
    
        /*const libsString = this.getCmakeJsLibString()
        D.push({ "CMAKE_JS_LIB": libsString });
    
        if (Environment.isWin) {
            const nodeLibDefPath = this.getNodeLibDefPath()
            if (nodeLibDefPath) {
                const nodeLibPath = path.join(this.m_workDir, 'node.lib')
                D.push({ CMAKE_JS_NODELIB_DEF: nodeLibDefPath })
                D.push({ CMAKE_JS_NODELIB_TARGET: nodeLibPath })
            }
        }*/
    
        if (this.m_toolset.generator) {
            command.push("-G", this.m_toolset.generator);
        }
        if (this.m_toolset.platform) {
            command.push("-A", this.m_toolset.platform);
        }
        if (this.m_toolset.toolset) {
            command.push("-T", this.m_toolset.toolset);
        }
        if (this.m_toolset.cppCompilerPath) {
            D.push({"CMAKE_CXX_COMPILER": this.m_toolset.cppCompilerPath});
        }
        if (this.m_toolset.cCompilerPath) {
            D.push({"CMAKE_C_COMPILER": this.m_toolset.cCompilerPath});
        }
        if (this.m_toolset.compilerFlags.length) {
            D.push({"CMAKE_CXX_FLAGS": this.m_toolset.compilerFlags.join(" ")});
        }
        if (this.m_toolset.linkerFlags.length) {
            D.push({"CMAKE_SHARED_LINKER_FLAGS": this.m_toolset.linkerFlags.join(" ")});
        }
        if (this.m_toolset.makePath) {
            D.push({"CMAKE_MAKE_PROGRAM": this.m_toolset.makePath});
        }
    
        // Load NPM config
        /*for (const [key, value] of Object.entries(npmConfigData)) {
            if (key.startsWith("cmake_")) {
                const sk = key.substr(6);
                if (sk && value) {
                    D.push({ [sk]: value });
                }
            }
        }*/
    
        command = command.concat(D.map( (p) => "-D" + Object.keys(p)[0] + "=" + Object.values(p)[0] ));
    
        return command.concat(this.m_extraCMakeArgs);
    }

    /*private getCmakeJsLibString() {

        const libs: string[] = [];
        if (Environment.isWin) {
            const nodeLibDefPath = this.getNodeLibDefPath()
            if (nodeLibDefPath) {
                libs.push(path.join(this.m_workDir, 'node.lib'))
            } else {
                libs.push(...this.dist.winLibs)
            }
        }
        return libs.join(";");
    }*/

    /*public async getCmakeJsIncludeString() : Promise<any> {
        let incPaths: any[] = [];
        if (!this.m_options.isNodeApi) {
            // Include and lib:
            if (this.dist.headerOnly) {
                incPaths = [path.join(this.dist.internalPath, "/include/node")];
            }
            else {
                const nodeH = path.join(this.dist.internalPath, "/src");
                const v8H = path.join(this.dist.internalPath, "/deps/v8/include");
                const uvH = path.join(this.dist.internalPath, "/deps/uv/include");
                incPaths = [nodeH, v8H, uvH];
            }
    
            // NAN
            const nanH = await locateNAN(this.m_projectRoot);
            if (nanH) {
                incPaths.push(nanH);
            }
        } else {
            // Base headers
            const apiHeaders = require('node-api-headers')
            incPaths.push(apiHeaders.include_dir)
    
            // Node-api
            const napiH = await locateNodeApi(this.m_projectRoot)
            if (napiH) {
                incPaths.push(napiH)
            }
        }
    
        return incPaths.join(";");
    }

    private getCmakeJsSrcString() {
        const srcPaths: string[] = [];
        if (Environment.isWin) {
            const delayHook = path.normalize(path.join(__dirname, 'cpp', 'win_delay_load_hook.cc'));
    
            srcPaths.push(delayHook.replace(/\\/gm, '/'));
        }
    
        return srcPaths.join(";");
    }

    private getNodeLibDefPath () {
        return Environment.isWin && this.m_options.isNodeApi ? path.join(this.m_options.out, 'node-lib.def') : undefined
    }*/

    public async configure() : Promise<any> {
        this.verifyIfAvailable();
    
        this.m_log.info("CMD", "CONFIGURE");
        const listPath = path.join(this.m_projectRoot, "CMakeLists.txt");
        const command = await this.getConfigureCommand();
    
        try {
            await fs.lstat(listPath);
        }
        catch (e) {
            throw new Error("'" + listPath + "' not found.");
        }
    
        try {
            await fs.ensureDir(this.m_workDir);
        }
        catch (e) {
            // Ignore
        }
    
        const cwd = process.cwd();
        process.chdir(this.m_workDir);
        try {
            /*const nodeLibDefPath = this.getNodeLibDefPath()
    
           if (Environment.isWin && nodeLibDefPath) {
                await this.generateNodeLibDef(nodeLibDefPath);
            }*/
    
            await this.run(command);
        }
        finally {
            process.chdir(cwd);
        }
    }

    public async ensureConfigured() : Promise<any>{
        try {
            await fs.lstat(path.join(this.m_workDir, "CMakeCache.txt"));
        }
        catch (e) {
            await this.configure();
        }
    }

    private async getBuildCommand() : Promise<any>{
        const command = [this.path, "--build", this.m_workDir, "--config", this.m_config];
        if (this.m_options.target) {
            command.push("--target", this.m_options.target);
        }
        if (this.m_options.parallel) {
            command.push("--parallel", this.m_options.parallel);
        }
        return command.concat(this.m_extraCMakeArgs);
    }

    public async build(){
        this.verifyIfAvailable();
    
        await this.ensureConfigured();
        const buildCommand = await this.getBuildCommand();
        this.m_log.info("CMD", "BUILD");
        await this.run(buildCommand);
    }

    private getCleanCommand() {
        return [this.path, "-E", "remove_directory", this.m_workDir].concat(this.m_extraCMakeArgs);
    }
    
    public clean() {
        this.verifyIfAvailable();
    
        this.m_log.info("CMD", "CLEAN");
        return this.run(this.getCleanCommand());
    }

    public async reconfigure() {
        this.m_extraCMakeArgs = [];
        await this.clean();
        await this.configure();
    }

    public async rebuild() {
        this.m_extraCMakeArgs = [];
        await this.clean();
        await this.build();
    }

    public async compile() {
        this.m_extraCMakeArgs = [];
        try {
            await this.build();
        }
        catch (e) {
            this.m_log.info("REP", "Build has been failed, trying to do a full rebuild.");
            await this.rebuild();
        }
    }

    private run(command: any): Promise<any> {
        this.m_log.info("RUN", command);
        return ProcessUtils.run(command, {silent: this.m_silent});
    }

    /*private async generateNodeLibDef(targetFile: string) {
        try {
            // Compile a Set of all the symbols that could be exported
            const allSymbols = new Set<any>()
            for (const ver of Object.values(headers.symbols)) {
                for (const sym of ver.node_api_symbols) {
                    allSymbols.add(sym)
                }
                for (const sym of ver.js_native_api_symbols) {
                    allSymbols.add(sym)
                }
            }
    
            // Write a 'def' file for NODE.EXE
            const allSymbolsArr = Array.from(allSymbols)
            await fs.writeFile(targetFile, 'NAME NODE.EXE\nEXPORTS\n' + allSymbolsArr.join('\n'))
    
            return targetFile
        } catch(e) {
            // It most likely wasn't found
            throw new Error(`Failed to generate def for node.lib`)
        }
    }*/

    static isAvailable(options: any) : boolean {
        options = options || {};
        try {
            if (options.cmakePath) {
                const stat = fs.lstatSync(options.cmakePath);
                return !stat.isDirectory();
            }
            else {
                which.sync("cmake");
                return true;
            }
        }
        catch (e) {
            // Ignore
        }
        return false;
    }

    static async getGenerators(options: any, log: Log) : Promise<any>{
        const arch = " [arch]";
        options = options || {};
        const gens: string[] = [];

        if (CMake.isAvailable(options)) {
            // try parsing machine-readable capabilities (available since CMake 3.7)
            try {
                const stdout = await ProcessUtils.execFile([options.cmakePath || "cmake", "-E", "capabilities"]) as string;
                const capabilities = JSON.parse(stdout);
                return capabilities.generators.map((x:any) => x.name);
            }
            catch (error) {
                if (log) {
                    log.verbose("TOOL", "Failed to query CMake capabilities (CMake is probably older than 3.7)");
                }
            }

            // fall back to parsing help text
            const stdout = await ProcessUtils.execFile([options.cmakePath || "cmake", "--help"]) as string;
            const hasCr = stdout.includes("\r\n");
            const output = hasCr ? stdout.split("\r\n") : stdout.split("\n");
            let on = false;
            output.forEach((line: string, i: number) => {
                if (on) {
                    const parts = line.split("=");
                    if ((parts.length === 2 && parts[0].trim()) ||
                        (parts.length === 1 && i !== output.length - 1 && output[i + 1].trim()[0] === "=")) {
                        let gen = parts[0].trim();
                        if (gen.endsWith(arch)) {
                            gen = gen.substr(0, gen.length - arch.length);
                        }
                        gens.push(gen);
                    }
                }
                if (line.trim() === "Generators") {
                    on = true;
                }
            });
        }
        else {
            throw new Error("CMake is not installed. Install CMake.");
        }
        return gens;
    }
}
 