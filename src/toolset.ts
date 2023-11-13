import { TargetOptions } from "./targetOptions";
import { Log } from "./log";
import { Environment } from "./environment";
import { CMake } from "./cmake";

import assert from 'assert';

export class Toolset {
    protected m_options : any;
    protected m_targetOptions : TargetOptions;
    protected m_platform: string | null;
    protected m_generator: string | null;
    protected m_log : Log;
    private m_initialized: boolean;

    protected m_cCompilerPath: string | null;
    protected m_cppCompilerPath: string | null;
    protected m_makePath: string | null;
    protected m_compilerFlags: string[];
    protected m_linkerFlags: string[];

    constructor(options: any){
        this.m_options = options || {};
        this.m_targetOptions = new TargetOptions(options);
        this.m_log = new Log(this.m_options);   

        this.m_initialized = false;
        this.m_cCompilerPath = options.cCompilerPath;
        this.m_cppCompilerPath = options.cppCompilerPath;
        this.m_makePath = options.makePath;
        this.m_compilerFlags = options.compilerFlags || [];
        this.m_linkerFlags = options.linkerFlags || [];        
        this.m_platform = null;
        this.m_generator = null;
    }

    public get generator(){
        return this.m_generator;
    }

    public get platform(){
        return this.m_platform;
    }   

    public get cppCompilerPath(){
        return this.m_cppCompilerPath;
    }

    public get cCompilerPath(){
        return this.m_cCompilerPath;
    }

    public get compilerFlags(){
        return this.m_compilerFlags;
    }

    public get linkerFlags(){
        return this.m_linkerFlags;
    }

    public get makePath(){
        return this.m_makePath;
    }

    public async initialize() { //install: boolean
        if (!this.m_initialized) {
            if (Environment.isWin) {
                await this.initializeWin(); //
            }
            else {
                this.initializePosix(); //
            }
            this.m_initialized = true;
        }
    }

    public async initializePosix() { //install: boolean
        if (!this.m_cCompilerPath || !this.m_cppCompilerPath) {
            // 1: Compiler
            if (!Environment.isGPPAvailable && !Environment.isClangAvailable) {
                if (Environment.isOSX) {
                    throw new Error("C++ Compiler toolset is not available. Install Xcode Commandline Tools from Apple Dev Center, or install Clang with homebrew by invoking: 'brew install llvm --with-clang --with-asan'.");
                }
                else {
                    throw new Error("C++ Compiler toolset is not available. Install proper compiler toolset with your package manager, eg. 'sudo apt-get install g++'.");
                }
            }
    
            if (this.m_options.preferClang && Environment.isClangAvailable) {
                /*if (install) {
                    this.m_log.info("TOOL", "Using clang++ compiler, because preferClang option is set, and clang++ is available.");
                }*/
                this.m_log.info("TOOL", "Using clang++ compiler, because preferClang option is set, and clang++ is available.");
                this.m_cppCompilerPath = this.m_cppCompilerPath || "clang++";
                this.m_cCompilerPath = this.m_cCompilerPath || "clang";
            }
            else if (this.m_options.preferGnu && Environment.isGPPAvailable) {
                /*if (install) {
                    this.m_log.info("TOOL", "Using g++ compiler, because preferGnu option is set, and g++ is available.");
                }*/
                this.m_log.info("TOOL", "Using g++ compiler, because preferGnu option is set, and g++ is available.");
                this.m_cppCompilerPath = this.m_cppCompilerPath || "g++";
                this.m_cCompilerPath = this.m_cCompilerPath || "gcc";
            }
        }
        // if it's already set because of options...
        if (this.m_generator) {
            /*if (install) {
                this.m_log.info("TOOL", "Using " + this.m_generator + " generator, as specified from commandline.");
            }*/
            this.m_log.info("TOOL", "Using " + this.m_generator + " generator, as specified from commandline.");
        }
        // 2: Generator
        else if (Environment.isOSX) {
            if (this.m_options.preferXcode) {
                /*if (install) {
                    this.m_log.info("TOOL", "Using Xcode generator, because preferXcode option is set.");
                }*/
                this.m_log.info("TOOL", "Using Xcode generator, because preferXcode option is set.");
                this.m_generator = "Xcode";
            }
            else if (this.m_options.preferMake && Environment.isMakeAvailable) {
                /*if (install) {
                    this.m_log.info("TOOL", "Using Unix Makefiles generator, because preferMake option is set, and make is available.");
                }*/
                this.m_log.info("TOOL", "Using Unix Makefiles generator, because preferMake option is set, and make is available.");
                this.m_generator = "Unix Makefiles";
            }
            else if (Environment.isNinjaAvailable) {
                /*if (install) {
                    this.m_log.info("TOOL", "Using Ninja generator, because ninja is available.");
                }*/
                this.m_log.info("TOOL", "Using Ninja generator, because ninja is available.");
                this.m_generator = "Ninja";
            }
            else {
                /*if (install) {
                    this.m_log.info("TOOL", "Using Unix Makefiles generator.");
                }*/
                this.m_log.info("TOOL", "Using Unix Makefiles generator.");
                this.m_generator = "Unix Makefiles";
            }
        }
        else {
            if (this.m_options.preferMake && Environment.isMakeAvailable) {
                /*if (install) {
                    this.m_log.info("TOOL", "Using Unix Makefiles generator, because preferMake option is set, and make is available.");
                }*/
                this.m_log.info("TOOL", "Using Unix Makefiles generator, because preferMake option is set, and make is available.");
                this.m_generator = "Unix Makefiles";
            }
            else if (Environment.isNinjaAvailable) {
                /*if (install) {
                    this.m_log.info("TOOL", "Using Ninja generator, because ninja is available.");
                }*/
                this.m_log.info("TOOL", "Using Ninja generator, because ninja is available.");
                this.m_generator = "Ninja";
            }
            else {
                /*if (install) {
                    this.m_log.info("TOOL", "Using Unix Makefiles generator.");
                }*/
                this.m_log.info("TOOL", "Using Unix Makefiles generator.");
                this.m_generator = "Unix Makefiles";
            }
        }
    
        // 3: Flags
        if (Environment.isOSX) {
            /*if (install) {
                this.m_log.verbose("TOOL", "Setting default OSX compiler flags.");
            }*/
            this.m_log.verbose("TOOL", "Setting default OSX compiler flags.");
            this.m_compilerFlags.push("-D_DARWIN_USE_64_BIT_INODE=1");
            this.m_compilerFlags.push("-D_LARGEFILE_SOURCE");
            this.m_compilerFlags.push("-D_FILE_OFFSET_BITS=64");
            this.m_linkerFlags.push("-undefined dynamic_lookup");
        }
        
        this.m_compilerFlags.push("-DBUILDING_NODE_EXTENSION");
    
        // 4: Build target
        if (this.m_options.target) {
            this.m_log.info("TOOL", "Building only the " + this.m_options.target + " target, as specified from the command line.");
        }
    }

    public async initializeWin() { //install: boolean
        const noGenerator = !this.m_generator;
        if (noGenerator) {
            const foundVsInfo = await this.getTopSupportedVisualStudioGenerator();
            if (foundVsInfo) {
                /*if (install) {
                    this.m_log.info("TOOL", `Using ${foundVsInfo.generator} generator.`);
                }*/
                this.m_log.info("TOOL", `Using ${foundVsInfo.generator} generator.`);
                this.m_generator = foundVsInfo.generator;    
                const isAboveVS16 = foundVsInfo.versionMajor >= 16;
    
                // The CMake Visual Studio Generator does not support the Win64 or ARM suffix on
                // the generator name. Instead the generator platform must be set explicitly via
                // the platform parameter
                if (!this.m_platform && isAboveVS16) {
                    switch(this.m_targetOptions.arch) {
                        case "ia32":
                        case "x86":
                            this.m_platform = "Win32";
                            break;
                        case "x64":
                            this.m_platform = "x64";
                            break;
                        case "arm":
                            this.m_platform = "ARM";
                            break;
                        case "arm64":
                            this.m_platform = "ARM64";
                            break;
                        default:
                            this.m_log.warn("TOOL", "Unknown NodeJS architecture: " + this.m_targetOptions.arch);
                            break;
                    }
                }
            } else {
                throw new Error("There is no Visual C++ compiler installed. Install Visual C++ Build Toolset or Visual Studio.");
            }
        } else {
            // if it's already set because of options...
            /*if (install) {
                this.m_log.info("TOOL", "Using " + this.m_options.generator + " generator, as specified from commandline.");
            }*/
            this.m_log.info("TOOL", "Using " + this.m_options.generator + " generator, as specified from commandline.");
        }
    
        this.m_linkerFlags.push("/DELAYLOAD:NODE.EXE");
    
        if (this.m_targetOptions.isX86) {
            /*if (install) {
                this.m_log.verbose("TOOL", "Setting SAFESEH:NO linker flag.");
            }*/
            this.m_log.verbose("TOOL", "Setting SAFESEH:NO linker flag.");
            this.m_linkerFlags.push("/SAFESEH:NO");
        }
    }

    private async getTopSupportedVisualStudioGenerator() {
        //const CMake = require("./cMake");
        assert(Environment.isWin);
    
        //const selectedVs = await findVisualStudio(this.m_options.msvsVersion)
        //if (!selectedVs) return null;
    
        const list = await CMake.getGenerators(this.m_options, this.m_log);
        for (const gen of list) {
            const found = gen.startsWith(`Visual Studio ${selectedVs.versionMajor}`)
            if (!found) {
                continue;
            }
    
            // unlike previous versions "Visual Studio 16 2019" and onwards don't end with arch name
            const isAboveVS16 = selectedVs.versionMajor >= 16;
            if (!isAboveVS16) {
                const is64Bit = gen.endsWith("Win64");
                if ((this.m_targetOptions.isX86 && is64Bit) || (this.m_targetOptions.isX64 && !is64Bit)) {
                    continue;
                }
            }
    
            return {
                ...selectedVs,
                generator: gen
            }
        }
    
        // Nothing matched
        return null;
    }
}