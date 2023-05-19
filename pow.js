(function(){
const WINDOW=typeof window!=="undefined"
let ab_map=[], str_map={__proto__:null} //arrayBuffer_map[number]=letter, string_map[letter]=number
for(let i=0;i<256;i++){
  ab_map[i]=String.fromCharCode(i);
  str_map[ab_map[i]]=i;
}
let browserHash=(function() { //adapted from https://github.com/dchest/fast-sha256-js/blob/master/sha256.js
  // SHA-256 constants
  var K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
      0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
      0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
      0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
      0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
      0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
      0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
      0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
      0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
      0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
      0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
      0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  function hashBlocks(w, v, p, pos, len) {
      var a, b, c, d, e, f, g, h, u, i, j, t1, t2;
      while (len >= 64) {
          a = v[0];
          b = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f = v[5];
          g = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
              j = pos + i * 4;
              w[i] = (((p[j] & 0xff) << 24) | ((p[j + 1] & 0xff) << 16) |
                  ((p[j + 2] & 0xff) << 8) | (p[j + 3] & 0xff));
          }
          for (i = 16; i < 64; i++) {
              u = w[i - 2];
              t1 = (u >>> 17 | u << (32 - 17)) ^ (u >>> 19 | u << (32 - 19)) ^ (u >>> 10);
              u = w[i - 15];
              t2 = (u >>> 7 | u << (32 - 7)) ^ (u >>> 18 | u << (32 - 18)) ^ (u >>> 3);
              w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
              t1 = (((((e >>> 6 | e << (32 - 6)) ^ (e >>> 11 | e << (32 - 11)) ^
                  (e >>> 25 | e << (32 - 25))) + ((e & f) ^ (~e & g))) | 0) +
                  ((h + ((K[i] + w[i]) | 0)) | 0)) | 0;
              t2 = (((a >>> 2 | a << (32 - 2)) ^ (a >>> 13 | a << (32 - 13)) ^
                  (a >>> 22 | a << (32 - 22))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
              h = g;
              g = f;
              f = e;
              e = (d + t1) | 0;
              d = c;
              c = b;
              b = a;
              a = (t1 + t2) | 0;
          }
          v[0] += a;
          v[1] += b;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f;
          v[6] += g;
          v[7] += h;
          pos += 64;
          len -= 64;
      }
      return pos;
  }
  // Hash implements SHA256 hash algorithm.
  const OUT=new Uint8Array(32)
  var Hash = /** @class */ (function () {
      function Hash() {
          this.digestLength = 32;
          this.blockSize = 64;
          // Note: Int32Array is used instead of Uint32Array for performance reasons.
          this.state = new Int32Array(8); // hash state
          this.temp = new Int32Array(64); // temporary state
          this.buffer = new Uint8Array(128); // buffer for data to hash
          this.bufferLength = 0; // number of bytes in buffer
          this.bytesHashed = 0; // number of total bytes hashed
          this.clean();
      }
      // Cleans internal buffers and re-initializes hash state.
      Hash.prototype.clean = function () {var i;
          for (i=0;i<this.buffer.length;i++) this.buffer[i]=0;
          for (i=0;i<this.temp.length;i++) this.temp[i]=0;
          
          this.state[0] = 0x6a09e667;
          this.state[1] = 0xbb67ae85;
          this.state[2] = 0x3c6ef372;
          this.state[3] = 0xa54ff53a;
          this.state[4] = 0x510e527f;
          this.state[5] = 0x9b05688c;
          this.state[6] = 0x1f83d9ab;
          this.state[7] = 0x5be0cd19;
          this.bufferLength = 0;
          this.bytesHashed = 0;
      };
      
      // Updates hash state with the given data.
      Hash.prototype.update = function (data) {
          let dataLength=data.length, dataPos=0;
          this.bytesHashed += dataLength;
          if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                  this.buffer[this.bufferLength++] = data[dataPos++];
                  dataLength--;
              }
              if (this.bufferLength === 64) {
                  hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                  this.bufferLength = 0;
              }
          }
          if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
          }
          while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
          }
      };
      // Finalizes hash state and puts hash into out.
      //
      // If hash was already finalized, puts the same value.
      Hash.prototype.finish = function () {var i;
          var bytesHashed = this.bytesHashed;
          var left = this.bufferLength;
          var bitLenHi = (bytesHashed / 0x20000000) | 0;
          var bitLenLo = bytesHashed << 3;
          var padLength = (bytesHashed % 64 < 56) ? 64 : 128;
          this.buffer[left] = 0x80;
          for (i = left + 1; i < padLength - 8; i++) {
              this.buffer[i] = 0;
          }
          this.buffer[padLength - 8] = (bitLenHi >>> 24) & 0xff;
          this.buffer[padLength - 7] = (bitLenHi >>> 16) & 0xff;
          this.buffer[padLength - 6] = (bitLenHi >>> 8) & 0xff;
          this.buffer[padLength - 5] = (bitLenHi >>> 0) & 0xff;
          this.buffer[padLength - 4] = (bitLenLo >>> 24) & 0xff;
          this.buffer[padLength - 3] = (bitLenLo >>> 16) & 0xff;
          this.buffer[padLength - 2] = (bitLenLo >>> 8) & 0xff;
          this.buffer[padLength - 1] = (bitLenLo >>> 0) & 0xff;
          hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
          
          for (i = 0; i < 8; i++) {
              OUT[i * 4 + 0] = (this.state[i] >>> 24) & 0xff;
              OUT[i * 4 + 1] = (this.state[i] >>> 16) & 0xff;
              OUT[i * 4 + 2] = (this.state[i] >>> 8) & 0xff;
              OUT[i * 4 + 3] = (this.state[i] >>> 0) & 0xff;
          }
      };
      return Hash;
  }());
  // Returns SHA256 hash of data.
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
  const instance=new Hash()
  return function hash(buffer) {
      instance.update(buffer)
      instance.finish()
      instance.clean()
      return btoa(ab2str(OUT.buffer));
  }
})();

var webcrypto, HASH, str;
if(WINDOW){
  window.Buffer={
    from(arr){
      if(typeof arr!=="string") return Uint8Array.from(arr);
      let u=Buffer.alloc(arr.length)
      for(let i=0;i<arr.length;i++) u[i]=ab_map[i];
      return u
    },
    alloc(n){  return new Uint8Array(n)  }
  }
  str=function(thing){
    if(!(thing instanceof Uint8Array)) return JSON.stringify(thing);
    return JSON.stringify(  {type:"Buffer",data:Object.values(thing)}  )
  }
  webcrypto=crypto
  HASH=browserHash
}
else{
  HASH =(buffer)=>crypto.createHash('sha256').update(buffer).digest('base64')
  let crypto=require('node:crypto')
  webcrypto=crypto.webcrypto
  str=JSON.stringify
}
const {floor,ceil,pow,round}=Math
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
  let list=[], min=2, ceiling=(a2-a1).toString(2).length
  do{
    list.length=0
    while(n>1){
      let power=Math.min( ceiling, n.toString(2).length-1 )
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
    if(B<1) throw new r("Buffer length, 'B' must be >=1");
    if(a1<0) throw new r("'a1' cannot be less than 0; no index in a buffer is negative");
    if(a2>256) throw new r("every index in a buffer goes up to 255, thus 'a2' must be <=256");
    if(a2-a1<4||(a2-a1)%2) throw new r("'a2' must be > 'a1' by an EVEN difference of at least 4");
    
    if(!Number.isSafeInteger(tries)) throw new r("count of 'tries' is an unsafe integer (too high)");
    if(tries.toString(2).includes('1',1)) throw new r("'tries' must be (2 to the N) where N is a whole number >=2");
    //for the amount of tries, it means 1(only 0s trailing), or N=log2(tries) is a whole number
    makeTestCache[""+tries+'-'+B+'-'+a1+'-'+a2]=true
  }
}



function makeTest(tries, B=1024, a1=0, a2=256){
  makeTestErrors(tries,B,a1,a2) //check for errors from arguments/parameters
  
  let variation=numbers(tries,a1,a2,B), C=variation.length, temp={}, times=1
  let buffer=Buffer.alloc(B), chars=Array(C), old=Array(C)
  for(let i=0;i<B;i++) buffer[i]=range(a1,a2);
  
  for(let i=0;i<C;i++){
    let [x1,x2]=variation[i]; times*=1+x2-x1
    let index=unique(B,temp), change=range(x1,x2), num=change+buffer[index]
    let NEW=num<a1? a2-(a1-num): ((num-a1)%(a2-a1))+a1
    chars[i]=[  index,  [ curve(NEW+x1,a1,a2), curve(NEW+x2,a1,a2) ]  ];
    (old[i]=buffer[index], buffer[index]=NEW);
  }
  
  let array=Array.from(buffer)
  chars.forEach((a,i)=> buffer[a[0]]=old[i] )
  return [str({array,hash:HASH(buffer),chars,a1,a2,times}),str(buffer)]
}
function takeTest(input){
  const {array,hash,chars,a1,a2,times}=JSON.parse(input)
  let buffer=Buffer.from(array), i=0
  
  for(i=0;i<times;i++){
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
  
  return str(buffer)
}

function takeTestBrowser(input){ //purely for testing
  const {array,hash,chars,a1,a2,times}=JSON.parse(input)
  let buffer=Buffer.from(array), i=0
  
  for(i=0;i<times;i++){
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
  
  return str(buffer)
}


if(!WINDOW) module.exports={makeTest,takeTest,takeTestBrowser};
else (window.makeTest=makeTest, window.takeTest=takeTest);
})()