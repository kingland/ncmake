
import { Log } from "./log";
import { MemoryStream } from "./stream";

import crypto from 'crypto';
import axios from 'axios';
//import MemoryStream  from 'memory-stream'
import zlib from 'zlib';
import tar from 'tar';
import fs from 'fs';

export class Downloader {
    protected m_options: any;
    protected m_log: Log;
    
    constructor(options: any){
        this.m_options = options || {};
        this.m_log = new Log(this.m_options);
    }

    public async downloadToStream(url: string, stream: any, hash = null) : Promise<any> {
        const self = this;
        const shasum = hash ? crypto.createHash(hash) : null;
        return new Promise((resolve, reject) => {
            let length = 0;
            let done = 0;
            let lastPercent = 0;
            axios
                .get(url, { responseType: "stream" })
                .then((response) => {
                    length = parseInt(response.headers["content-length"]);
                    if (typeof length !== 'number') {
                        length = 0;
                    }
    
                    response.data.on('data', (chunk: string) => {
                        if (shasum) {
                            shasum.update(chunk);
                        }
                        if (length) {
                            done += chunk.length;
                            let percent = done / length * 100;
                            percent = Math.round(percent / 10) * 10 + 10;
                            if (percent > lastPercent) {
                                self.m_log.verbose("DWNL", "\t" + lastPercent + "%");
                                lastPercent = percent;
                            }
                        }
                    });
    
                    response.data.pipe(stream);
                })
                .catch((err) => {
                    reject(err);
                });
    
            stream.once("error", (err: Error) => {
                reject(err);
            });
    
            stream.once("finish", () => {
                resolve(shasum ? shasum.digest("hex") : undefined);
            });
        });
    }

    public async downloadString(url: string) {
        const result = new MemoryStream();
        await this.downloadToStream(url, result);
        return result.toString();
    }

    public async downloadFile(url: string, options: any) {
        if (typeof options === 'string') {
            options = {
                path : options
            };
        }
        const result = fs.createWriteStream(options.path);
        const sum = await this.downloadToStream(url, result, options.hash);
        this.testSum(url, sum, options);
        return sum;
    }
 
    public async downloadTgz(url: string, options: any) {
        if (typeof options === 'string') {
            options = {
                cwd : options
            }
        }
        const gunzip = zlib.createGunzip();
        const extractor = tar.extract(options);
        gunzip.pipe(extractor);
        const sum =  await this.downloadToStream(url, gunzip, options.hash);
        this.testSum(url, sum, options);
        return sum;
    }

    private testSum(url: string, sum: string, options: any) {
        if (options.hash && sum && options.sum && options.sum !== sum) {
            throw new Error(options.hash.toUpperCase() + " sum of download '" + url + "' mismatch!");
        }
    }
}