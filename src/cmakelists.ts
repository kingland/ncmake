

export class CMakeLists {

    protected m_cmakeMinVer: string;
    protected m_projectName: string;
    protected m_srcDir: string[];
    protected m_incDir: string[];
    protected m_extIncDir: string[];
    protected m_pchDir: string[];
    protected m_initialize : boolean;

    constructor(options: any){
        this.m_cmakeMinVer = options.cmakeMinVer || {};
        this.m_projectName = options.projectName || {};      
        this.m_srcDir = options.srcDir || [];
        this.m_incDir = options.incDir || [];
        this.m_extIncDir = options.extIncDir || [];
        this.m_pchDir = options.pchDir || [];
        this.m_initialize = false;
    }

    protected async initialize(): Promise<boolean>{
        if(this.m_initialize) return true;

        return this.m_initialize = true;      
    }

    protected async genCmakefile(): Promise<void>{

    }

    protected async genHeader(): Promise<void>{
        
    }

    protected async genOptions(): Promise<void>{

    }

    protected async genInclude(): Promise<void>{

    }

    protected async genSource(): Promise<void>{

    }

    protected async genConfig(): Promise<void>{
        
    }
}