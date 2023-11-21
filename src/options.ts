export class Options {
    protected platform: string | null;
    protected buildDir: string | null;
    protected target: string | null;
    protected parallel: string | null;  
    protected cmakePath: string | null;
    protected generator: string | null;

    constructor(){
        this.platform = null;
        this.target = null;
        this.parallel = null;
        this.buildDir = 'build';
        this.cmakePath = null;
        this.generator = null;
    }
}