import log from 'npmlog'
import debug from 'debug'

export class Log {
    protected m_options : any;
    protected m_debug : debug.Debugger;

    get level(){
        if (this.m_options.noLog) {
            return "silly";
        }
        else {
            return log.level;
        }
    }

    constructor(options: any){
        this.m_options = options;
        this.m_debug = debug(this.m_options.logName || "cmake-js");
    }   

    public silly(cat:string, msg: string) {
        if (this.m_options.noLog) {
            this.m_debug(cat + ": " + msg);
        }
        else {
            log.silly(cat, msg);
        }
    }

    public verbose(cat: string, msg: string) {
        if (this.m_options.noLog) {
            this.m_debug(cat + ": " + msg);
        }
        else {
            log.verbose(cat, msg);
        }
    }

    public info(cat: string, msg: string) {
        if (this.m_options.noLog) {
            this.m_debug(cat + ": " + msg);
        }
        else {
            log.info(cat, msg);
        }
    }
    
    public warn(cat: string, msg: string) {
        if (this.m_options.noLog) {
            this.m_debug(cat + ": " + msg);
        }
        else {
            log.warn(cat, msg);
        }
    }

    public http(cat: string, msg: string) {
        if (this.m_options.noLog) {
            this.m_debug(cat + ": " + msg);
        }
        else {
            log.http(cat, msg);
        }
    }

    public error(cat: string, msg: string) {
        if (this.m_options.noLog) {
            this.m_debug(cat + ": " + msg);
        }
        else {
            log.error(cat, msg);
        }
    }
}