(function(){
const WINDOW=typeof window!=="undefined"? window: typeof self!=="undefined"?self: false;
let ab_map=[], str_map={__proto__:null} //arrayBuffer_map[number]=letter, string_map[letter]=number
for(let i=0;i<256;i++){
  ab_map[i]=String.fromCharCode(i);
  str_map[ab_map[i]]=i;
}
function ab2str(buf) {
  let arr=new Uint8Array(buf), chars="";
  for(let i=0;i<arr.length;i++) chars+=ab_map[arr[i]];
  return chars;
}
function str2ab(str) {
  let buf=Buffer.alloc(str.length);
  for (let i=0;i<str.length;i++) buf[i]=str_map[str[i]];
  return buf;
}
function str2bfr(str,typedarray) {
  let buf=Buffer.alloc(str.length);
  for (let i=0;i<str.length;i++) buf[i]=str_map[str[i]];
  return !typedarray? buf: new typedarray(buf);
}
function bfr2str(buf) {
  let chars="";
  for(let i=0;i<buf.length;i++) chars+=ab_map[buf[i]];
  return chars;
}
//aes256key and salt are both of length 32, encrypted text is base64(iv+ciphertext)
async function AES_ENC(data,key,s,throwErrors){
  return new Promise(function(resolve,reject){
    webcrypto.scrypt(key,s,32,function(err,key){
      if(err) return throwErrors?reject(err):resolve("");
      const iv=Buffer.from( webcrypto.getRandomValues(new Uint8Array(16)) )
      let cipher=webcrypto.createCipheriv('aes-256-ctr',key,iv), str=bfr2str(iv)
      cipher.on('error',function(err){throwErrors?reject(err):resolve("")})
      cipher.on('data',function(chunk){str+=bfr2str(chunk)})
      cipher.on('end',function(){resolve(btoa(str))})
      cipher.write(data)
      cipher.end()
    })
  })
}
async function browser_AES_ENC(data,key,s,throwErrors){
  return new Promise(async function(resolve,reject){
    try{
      key = await browserScrypt(key,s,32,{N:16384,r:8,p:1})
      key = await webcrypto.subtle.importKey("raw",str2ab(key),{name:"AES-CTR"},true,["encrypt"])
      const iv=new ArrayBuffer( webcrypto.getRandomValues(new Uint8Array(16)) )
      let algorithm={name:"AES-CTR",iv}
      return resolve( await webcrypto.subtle.encrypt(algorithm,key,str2ab(data)) )
    }
    catch(err){ return throwErrors?reject(err):resolve("") }
  })
}
async function AES_DEC(base64str,key,s,throwErrors){
  const encrypted=atob(base64str), iv=str2bfr(encrypted.substring(0,16)), data=encrypted.substring(16)
  return new Promise(function(resolve,reject){
    webcrypto.scrypt(key,s,32,function(err,key){
      if(err) return throwErrors?reject(err):resolve("");
      let decipher=webcrypto.createDecipheriv('aes-256-ctr',key,iv), str=""
      decipher.on('readable',function(){
        for(let chunk=decipher.read(); chunk!==null; chunk=decipher.read())
          str+=bfr2str(chunk);
      })
      decipher.on('error',function(err){throwErrors?reject(err):resolve("")})
      decipher.on('end',function(){resolve(str)})
      decipher.write(data,'binary')
      decipher.end()
    })
  })
}
async function browser_AES_DEC(base64str,key,s,throwErrors){
  const encrypted=atob(base64str), iv=str2ab(encrypted.substring(0,16)), data=encrypted.substring(16)
  return new Promise(async function(resolve,reject){
    try{
      key = await browserScrypt(key,s,32,{N:16384,r:8,p:1})
      key = await webcrypto.subtle.importKey("raw",str2ab(key),{name:"AES-CTR"},true,["decrypt"])
      let algorithm={name:"AES-CTR",iv}
      return resolve( await webcrypto.subtle.decrypt(algorithm,key,str2ab(data)) )
    }
    catch(err){ return throwErrors?reject(err):resolve("") }
  })
}

//adapted from https://github.com/dchest/fast-sha256-js/blob/master/sha256.js
let browserHash=function(){var t=new Uint32Array([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]);function e(e,s,f,h,i){for(var r,n,u,a,b,o,c,g,p,y,L,l,d;i>=64;){for(r=s[0],n=s[1],u=s[2],a=s[3],b=s[4],o=s[5],c=s[6],g=s[7],y=0;y<16;y++)L=h+4*y,e[y]=(255&f[L])<<24|(255&f[L+1])<<16|(255&f[L+2])<<8|255&f[L+3];for(y=16;y<64;y++)l=((p=e[y-2])>>>17|p<<15)^(p>>>19|p<<13)^p>>>10,d=((p=e[y-15])>>>7|p<<25)^(p>>>18|p<<14)^p>>>3,e[y]=(l+e[y-7]|0)+(d+e[y-16]|0);for(y=0;y<64;y++)l=(((b>>>6|b<<26)^(b>>>11|b<<21)^(b>>>25|b<<7))+(b&o^~b&c)|0)+(g+(t[y]+e[y]|0)|0)|0,d=((r>>>2|r<<30)^(r>>>13|r<<19)^(r>>>22|r<<10))+(r&n^r&u^n&u)|0,g=c,c=o,o=b,b=a+l|0,a=u,u=n,n=r,r=l+d|0;s[0]+=r,s[1]+=n,s[2]+=u,s[3]+=a,s[4]+=b,s[5]+=o,s[6]+=c,s[7]+=g,h+=64,i-=64}return h}const s=new Uint8Array(32);const f=new(function(){function t(){this.digestLength=32,this.blockSize=64,this.state=new Int32Array(8),this.temp=new Int32Array(64),this.buffer=new Uint8Array(128),this.bufferLength=0,this.bytesHashed=0,this.clean()}return t.prototype.clean=function(){var t;for(t=0;t<this.buffer.length;t++)this.buffer[t]=0;for(t=0;t<this.temp.length;t++)this.temp[t]=0;this.state[0]=1779033703,this.state[1]=3144134277,this.state[2]=1013904242,this.state[3]=2773480762,this.state[4]=1359893119,this.state[5]=2600822924,this.state[6]=528734635,this.state[7]=1541459225,this.bufferLength=0,this.bytesHashed=0},t.prototype.update=function(t){let s=t.length,f=0;if(this.bytesHashed+=s,this.bufferLength>0){for(;this.bufferLength<64&&s>0;)this.buffer[this.bufferLength++]=t[f++],s--;64===this.bufferLength&&(e(this.temp,this.state,this.buffer,0,64),this.bufferLength=0)}for(s>=64&&(f=e(this.temp,this.state,t,f,s),s%=64);s>0;)this.buffer[this.bufferLength++]=t[f++],s--},t.prototype.finish=function(){var t,f=this.bytesHashed,h=this.bufferLength,i=f/536870912|0,r=f<<3,n=f%64<56?64:128;for(this.buffer[h]=128,t=h+1;t<n-8;t++)this.buffer[t]=0;for(this.buffer[n-8]=i>>>24&255,this.buffer[n-7]=i>>>16&255,this.buffer[n-6]=i>>>8&255,this.buffer[n-5]=i>>>0&255,this.buffer[n-4]=r>>>24&255,this.buffer[n-3]=r>>>16&255,this.buffer[n-2]=r>>>8&255,this.buffer[n-1]=r>>>0&255,e(this.temp,this.state,this.buffer,0,n),t=0;t<8;t++)s[4*t+0]=this.state[t]>>>24&255,s[4*t+1]=this.state[t]>>>16&255,s[4*t+2]=this.state[t]>>>8&255,s[4*t+3]=this.state[t]>>>0&255},t}());return function(t){return f.update(t),f.finish(),f.clean(),btoa(ab2str(s.buffer))}}();
//adapted from https://github.com/juanelas/scrypt-pbkdf/blob/main/dist/bundle.iife.js
let browserScrypt=function(e){"use strict";const r=function(e){function r(e,r){return e<<r|e>>>32-r}const t=e.slice(0);for(let e=8;e>0;e-=2)t[4]^=r(t[0]+t[12],7),t[8]^=r(t[4]+t[0],9),t[12]^=r(t[8]+t[4],13),t[0]^=r(t[12]+t[8],18),t[9]^=r(t[5]+t[1],7),t[13]^=r(t[9]+t[5],9),t[1]^=r(t[13]+t[9],13),t[5]^=r(t[1]+t[13],18),t[14]^=r(t[10]+t[6],7),t[2]^=r(t[14]+t[10],9),t[6]^=r(t[2]+t[14],13),t[10]^=r(t[6]+t[2],18),t[3]^=r(t[15]+t[11],7),t[7]^=r(t[3]+t[15],9),t[11]^=r(t[7]+t[3],13),t[15]^=r(t[11]+t[7],18),t[1]^=r(t[0]+t[3],7),t[2]^=r(t[1]+t[0],9),t[3]^=r(t[2]+t[1],13),t[0]^=r(t[3]+t[2],18),t[6]^=r(t[5]+t[4],7),t[7]^=r(t[6]+t[5],9),t[4]^=r(t[7]+t[6],13),t[5]^=r(t[4]+t[7],18),t[11]^=r(t[10]+t[9],7),t[8]^=r(t[11]+t[10],9),t[9]^=r(t[8]+t[11],13),t[10]^=r(t[9]+t[8],18),t[12]^=r(t[15]+t[14],7),t[13]^=r(t[12]+t[15],9),t[14]^=r(t[13]+t[12],13),t[15]^=r(t[14]+t[13],18);for(let r=0;r<16;r++)e[r]=t[r]+e[r]},t=function(e,r){for(let t=0;t<e.length;t++)e[t]^=r[t]},n=function(e){const n=e.byteLength/128,i=16*(2*n-1),o=e.slice(i,i+16),a=new Uint32Array(e.length/2);let s=!0;for(let i=0;i<2*n;i++){const n=16*i,f=e.subarray(n,n+16);t(o,f),r(o);const c=16*(i>>1);if(s)for(let r=0;r<16;r++)e[c+r]=o[r];else for(let e=0;e<16;e++)a[c+e]=o[e];s=!s}const f=16*n;for(let r=0;r<f;r++)e[f+r]=a[r]},i=function(e,r){const i=e.byteLength/128,o=new Array(r);for(let t=0;t<r;t++)o[t]=e.slice(0),n(e);function a(e){const t=64*(2*i-1);return new DataView(e.buffer,t,64).getUint32(0,!0)%r}for(let i=0;i<r;i++){const r=a(e);t(e,o[r]),n(e)}},o={"SHA-1":{outputLength:20,blockSize:64},"SHA-256":{outputLength:32,blockSize:64},"SHA-384":{outputLength:48,blockSize:128},"SHA-512":{outputLength:64,blockSize:128}};function a(e,r,t,n,i="SHA-256"){return new Promise(((a,c)=>{i in o||c(new RangeError(`Valid hash algorithm values are any of ${Object.keys(o).toString()}`)),"string"==typeof e?e=(new TextEncoder).encode(e):e instanceof ArrayBuffer?e=new Uint8Array(e):ArrayBuffer.isView(e)||c(RangeError("P should be string, ArrayBuffer, TypedArray, DataView")),"string"==typeof r?r=(new TextEncoder).encode(r):r instanceof ArrayBuffer?r=new Uint8Array(r):ArrayBuffer.isView(r)?r=new Uint8Array(r.buffer,r.byteOffset,r.byteLength):c(RangeError("S should be string, ArrayBuffer, TypedArray, DataView")),crypto.subtle.importKey("raw",e,"PBKDF2",!1,["deriveBits"]).then((u=>{const y={name:"PBKDF2",hash:i,salt:r,iterations:t};crypto.subtle.deriveBits(y,u,8*n).then((e=>a(e)),(u=>{(async function(e,r,t,n,i){if(!(i in o))throw new RangeError(`Valid hash algorithm values are any of ${Object.keys(o).toString()}`);if(!Number.isInteger(t)||t<=0)throw new RangeError("c must be a positive integer");const a=o[i].outputLength;if(!Number.isInteger(n)||n<=0||n>=(2**32-1)*a)throw new RangeError("dkLen must be a positive integer < (2 ** 32 - 1) * hLen");const c=Math.ceil(n/a),u=n-(c-1)*a,y=new Array(c);0===e.byteLength&&(e=new Uint8Array(o[i].blockSize));const l=await crypto.subtle.importKey("raw",e,{name:"HMAC",hash:{name:i}},!0,["sign"]),w=async function(e,r){const t=await crypto.subtle.sign("HMAC",e,r);return new Uint8Array(t)};for(let e=0;e<c;e++)y[e]=await g(l,r,t,e+1);async function g(e,r,t,n){const i=await w(e,s(r,function(e){const r=new ArrayBuffer(4);return new DataView(r).setUint32(0,e,!1),new Uint8Array(r)}(n)));let o=i;for(let r=1;r<t;r++)o=await w(e,o),f(i,o);return i}return y[c-1]=y[c-1].slice(0,u),s(...y).buffer})(e,r,t,n,i).then((e=>a(e)),(e=>c(e)))}))}),(e=>c(e)))}))}function s(...e){const r=e.reduce(((e,r)=>e+r.length),0);if(0===e.length)throw new RangeError("Cannot concat no arrays");const t=new Uint8Array(r);let n=0;for(const r of e)t.set(r,n),n+=r.length;return t}function f(e,r){for(let t=0;t<e.length;t++)e[t]^=r[t]}return e.salsa208Core=r,e.salt=function(e=16){if(!Number.isInteger(e)||e<0)throw new RangeError("length must be integer >= 0");return 0===e?new ArrayBuffer(0):crypto.getRandomValues(new Uint8Array(e)).buffer},e.scrypt=async function(e,r,t,n){if("string"==typeof e)e=(new TextEncoder).encode(e);else if(e instanceof ArrayBuffer)e=new Uint8Array(e);else if(!ArrayBuffer.isView(e))throw RangeError("P should be string, ArrayBuffer, TypedArray, DataView");if("string"==typeof r)r=(new TextEncoder).encode(r);else if(r instanceof ArrayBuffer)r=new Uint8Array(r);else if(!ArrayBuffer.isView(r))throw RangeError("S should be string, ArrayBuffer, TypedArray, DataView");if(!Number.isInteger(t)||t<=0||t>137438953440)throw RangeError("dkLen is the intended output length in octets of the derived key; a positive integer less than or equal to (2^32 - 1) * hLen where hLen is 32");const o=void 0!==n&&void 0!==n.N?n.N:131072,s=void 0!==n&&void 0!==n.r?n.r:8,f=void 0!==n&&void 0!==n.p?n.p:1;if(!Number.isInteger(o)||o<=0||0!=(o&o-1))throw RangeError("N must be a power of 2");if(!Number.isInteger(s)||s<=0||!Number.isInteger(f)||f<=0||f*s>1073741823.75)throw RangeError("Parallelization parameter p and blocksize parameter r must be positive integers satisfying p ≤ (2^32− 1) * hLen / MFLen where hLen is 32 and MFlen is 128 * r.");const c=await a(e,r,1,128*f*s),u=new Uint32Array(c);for(let e=0;e<f;e++){const r=32*s,t=e*r,n=u.slice(t,t+r);i(n,o);for(let e=0;e<32*s;e++)u[t+e]=n[e]}return await a(e,u,1,t)},e.scryptBlockMix=n,e.scryptROMix=i,e}({}).scrypt;

var Worker, webcrypto, HASH, str=JSON.stringify;
if(WINDOW){ //browser
  Worker=WINDOW.Worker
  WINDOW.Buffer={
    alloc(n){  return new Uint8Array(n)  }
  }
  webcrypto=crypto
  HASH=browserHash
  AES_ENC=browser_AES_ENC
  AES_DEC=browser_AES_DEC
}
else{ //nodejs
  HASH =(buffer)=>crypto.createHash('sha256').update(buffer).digest('base64')
  Worker=require('node:worker_threads').Worker
  let crypto=require('node:crypto')
  webcrypto=crypto.webcrypto||crypto
}
const {floor,ceil,pow,round,log2,min:MIN,max:MAX}=Math
const range =(min,max)=> floor(random()*(max-min))+min
const random=_=> webcrypto.getRandomValues(new Uint32Array(1))[0] / pow(2,32)
const curve =(num,min,max)=> num<min? max-(min-num): min+((num-min)%(max-min))
function unique(n,record){
  let result=null
  do{  result=range(0,n)  } //choose new number
  while( record[result] ) //while number alredy chosen
  record[result]=true
  return result
}
function numbers(n,a1,a2,limit){
  let list=[], min=2, ceiling=floor(log2(a2-a1))
  do{
    list.length=0
    while(n>1){
      let power=MIN( ceiling, n.toString(2).length-1 )
      let divisor=pow( 2, range(1,power) )
      list.push( (n/=divisor,[divisor/-2+1,divisor/2]) )
    }
  }while(list.length>limit);
  return list
}
const makeTestCache={__proto__:null}
function makeTestErrors(tries,B,a1,a2){
  if(!makeTestCache[""+tries+'-'+B+'-'+a1+'-'+a2]){ //check for errors if these arguments haven't been tested in the process yet
    let r=RangeError, t=TypeError;
    if( [tries,B,a1,a2].some(arg=>typeof arg!=="number") ) throw new t("every argument must be a number");
    
    if(tries<4) throw new r("'tries' must be >= 4");
    if(B<1||B>65535) throw new r("Buffer length, 'B' must be >=1 and less than 65536");
    if(a1<0) throw new r("'a1' cannot be less than 0; no index in a buffer is negative");
    if(a2>256) throw new r("every index in a buffer goes up to 255, thus 'a2' must be <=256");
    if(a2-a1<4) throw new r("'a2' must be > 'a1' by a difference of at least 4");
    
    if(!Number.isSafeInteger(tries)) throw new r("count of 'tries' is an unsafe integer (too high)");
    if(tries!==2**log2(tries)) throw new r("'tries' must be (2 to the N) where N is a whole number >=2");
    makeTestCache[""+tries+'-'+B+'-'+a1+'-'+a2]=true
  }
}

function ushort(num){
  let rem=num%256;
  return ab2str([(num-rem)/256, rem])
}
function to_ushort(str){
  return (str_map[str[0]]*256) + str_map[str[1]];
}
function SERIAL(data,hash,chars,a1,a2){
  let str=ab_map[a1]+ab_map[a2-1]+ushort(chars.length);
  for(let i=0;i<chars.length;i++)
    str+=ushort(chars[i][0]) + ab_map[chars[i][1][0]] + ab_map[chars[i][1][1]];
  return str + hash + data;
}
function PARSE(string){
  let a1=str_map[string[0]], a2=str_map[string[1]]+1
  let length=to_ushort(string.substring(2,4)), chars=Array(length)
  for(let i=0;i<chars.length;i++){
    chars[i]=[
      to_ushort(string.substring(i*4+4,i*4+6)), //index
      [str_map[string[i*4+6]],  str_map[string[i*4+7]]] //[min,max]
    ];
  }
  let hash=string.substring(4*length+4,4*length+48), data=string.substr(4*length+48)
  return [str2ab(data),hash,chars,a1,a2];
}
function makeTest(tries=2**20, B=64, a1=0, a2=256){
  makeTestErrors(tries,B,a1,a2) //check for errors from arguments/parameters
  
  let variation=numbers(tries,a1,a2,B), C=variation.length, temp={}
  let buffer=Buffer.alloc(B), chars=Array(C), old=Array(C)
  for(let i=0;i<B;i++) buffer[i]=range(a1,a2);
  
  for(let i=0;i<C;i++){
    let [x1,x2]=variation[i], index=unique(B,temp)
    let change=range(x1,x2), num=change+buffer[index]
    let NEW=num<a1? a2-(a1-num): ((num-a1)%(a2-a1))+a1
    chars[i]=[  index,  [ curve(NEW+x1,a1,a2), curve(NEW+x2,a1,a2) ]  ];
    (old[i]=buffer[index], buffer[index]=NEW);
  }
  
  let data=ab2str(buffer)
  chars.forEach((a,i)=> buffer[a[0]]=old[i] )
  return [SERIAL(data,HASH(buffer),chars,a1,a2),ab2str(buffer)]
}
function takeTest(input){
  const [buffer,hash,chars,a1,a2]=PARSE(input);
  
  while(true){
    //applies +1 or edits buffer to the possible combination
    for(let c=chars.length-1;c>=0;c--){
      let [index,[min,max]]=chars[c]
      let base=chars[c].base||( chars[c].base=1+(max>min? max-min: (a2-min)+(max-a1)) )
      let MIN=min-a1, num=(buffer[index]+1)-a1, A2=a2-a1
      let addition=(( (num<MIN?num+MIN+(A2-MIN):num)-MIN )%base)+MIN
      buffer[index]=(addition%A2)+a1
      if(buffer[index]!==min) break;
    }
    //hashes the buffer and checks
    if(HASH(buffer)===hash) break;
  }
  
  return ab2str(buffer)
}

function takeTestBrowser(input){ //purely for testing
  const [buffer,hash,chars,a1,a2]=PARSE(input);
  
  while(true){
    //applies +1 or edits buffer to the possible combination
    for(let c=chars.length-1;c>=0;c--){
      let [index,[min,max]]=chars[c]
      let base=chars[c].base||( chars[c].base=1+(max>min? max-min: (a2-min)+(max-a1)) )
      let MIN=min-a1, num=(buffer[index]+1)-a1, A2=a2-a1
      let addition=(( (num<MIN?num+MIN+(A2-MIN):num)-MIN )%base)+MIN
      buffer[index]=(addition%A2)+a1
      if(buffer[index]!==min) break;
    }
    //hashes the buffer and checks
    if(browserHash(buffer)===hash) break;
  }
  
  return ab2str(buffer)
}

const mainFN=arguments.callee
async function takeTestAsync(input){
  let script=`(${mainFN.toString()})(true);\n`
  script+=WINDOW? ``: `(require("node:worker_threads")).parentPort.`
  script+=`postMessage(  ${!WINDOW?"module.exports.":""}takeTest(atob("${ btoa(input) }"))  )`
  return new Promise(function(result){
    if(WINDOW){
      let workerURL=URL.createObjectURL(
        new Blob([script],{type:'text/javascript'})
      )
      console.log()
      let worker=new Worker(workerURL)
      URL.revokeObjectURL(workerURL)
      worker.onmessage=function(output){
        worker.terminate()
        result(output.data)
      }
    }
    else{
      let worker=new Worker(script,{eval:true})
      worker.on('message',function(output){
        worker.terminate()
        result(output)
      })
    }
  })
}


if(!WINDOW) module.exports={makeTest, takeTest, takeTestBrowser, takeTestAsync};
else (WINDOW.makeTest=makeTest, WINDOW.takeTest=takeTest, WINDOW.takeTestAsync=takeTestAsync);
})()
