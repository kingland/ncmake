import {spawn, execFile} from 'child_process';

export class ProcessUtils {

    public static async run(command:string[], options: any) : Promise<any>{
        if (!options) options = {};

        return new Promise((resolve, reject) => {
            const env = Object.assign({}, process.env);
            if (env.Path && env.PATH && env.Path !== env.PATH) {
                env.PATH = env.Path + ';' + env.PATH;
                delete env.Path;
            }
            const child = spawn(command[0], command.slice(1), {
                stdio: options.silent ? "ignore" : "inherit", 
                env
            });
            let ended = false;
            child.on("error",  (e: Error) => {
                if (!ended) {
                    reject(e);
                    ended = true;
                }
            });
            child.on("exit", (code: number, signal: any) => {
                if (!ended) {
                    if (code === 0) {
                        resolve(code);
                    }
                    else {
                        reject(new Error("Process terminated: " + code || signal));
                    }
                    ended = true;
                }
            });
        });
    }

    public static async execFile(command: string[]){
        return new Promise((resolve, reject) =>{
            execFile(command[0], command.slice(1), (err, stdout, stderr) => {
                if (err) {
                    reject(new Error(err.message + "\n" + (stdout || stderr)));
                }
                else {
                   resolve(stdout);
                }
            });
        });
    }
}
