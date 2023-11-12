
import Stream, {WritableOptions}  from 'readable-stream';

export class ReadableStream extends Stream.Readable {
    private _data: any;

    constructor(data: any){
        super();
        this._data = data;
    }

    public override _read(n : number){
        this.push(this._data);
        this._data = '';
    }

    public append(data: any){
        this.push(data);       
    } 
}


export class WritableStream extends Stream.Writable {
    constructor(options?: WritableOptions){
        super(options);
    }

    public writex(chunk: any, encoding?: string, callback?: (error: Error | null | undefined) => void): boolean{
        //var ret = Stream.Writable.prototype.write.apply(this, arguments);
        let ret: boolean = super.write(chunk,encoding,callback);
        if (!ret) this.emit('drain');
        return ret;
    }

    public override _write(chunk: any, encoding?: string, callback?: (error: Error | null | undefined) => void) {
        this.writex(chunk, encoding, callback);
    }

    public toString() {  
        return this.toBuffer().toString();
    }

    public toBuffer() {
        var buffers:any[] = [];
        this._writableState.buffer.forEach(function(data) {
          buffers.push(data.chunk);
        });
        
        return Buffer.concat(buffers);
    }
    
    public endx (chunk: any, encoding?: string, callback?: () => void) {
        //var ret = Stream.Writable.prototype.end.apply(this, arguments);
        let ret = super.end(chunk,encoding,callback);
        // In memory stream doesn't need to flush anything so emit `finish` right away
        // base implementation in Stream.Writable doesn't emit finish
        this.emit('finish');
        return ret;
    }
}

export class MemoryStream extends Stream.Writable {
    private _buffer: any[] ; 
    private _options?: WritableOptions & {encoding?:string};

    constructor(options?: WritableOptions){       
        super(options);
        this._buffer = [];
        this._options = options;

        if(!this._options) this._options = {};
        this._options.encoding = 'Buffer';
    }

    public override _write (chunk: string, encoding?: string, cb? : () => void) {
        if (!this._writableState.objectMode && this._options!.encoding === 'Buffer' && encoding === 'utf8') {
          this._buffer.push(new Buffer(chunk));
        } else if (this._writableState.objectMode) {
          this._buffer.push(Buffer.isBuffer(chunk) ? JSON.parse(chunk) : chunk);
        } else {
          this._buffer.push(chunk);
        }
        if(cb) cb();
    }

    public get() {
        if (this._writableState.objectMode) {
          return this._buffer;
        } else {
          return this.toBuffer();
        }
    }

    public toString() {
        if (this._writableState.objectMode) {
          return JSON.stringify(this._buffer);
        } else {
          return this._buffer.join('');
        }
    }

    public toBuffer() {
        if (this._writableState.objectMode) {
          return new Buffer(this.toString());
        } else {
          return Buffer.concat(this._buffer);
        }
    }
}