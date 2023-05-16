(function(){
const WINDOW=typeof window!=="undefined"
let ab_map=[], str_map={__proto__:null} //arrayBuffer_map[number]=letter, string_map[letter]=number
for(let i=0;i<256;i++){
  ab_map[i]=String.fromCharCode(i);
  str_map[ab_map[i]]=i;
}
let browserHash=(function() { //adapted from https://gist.github.com/bryanchow/1649353
  /*
   * Main sha256 function, with its support functions
   */
  function sha256_S (X, n) {return ( X >>> n ) | (X << (32 - n));}
  function sha256_R (X, n) {return ( X >>> n );}
  function sha256_Ch(x, y, z) {return ((x & y) ^ ((~x) & z));}
  function sha256_Maj(x, y, z) {return ((x & y) ^ (x & z) ^ (y & z));}
  function sha256_Sigma0256(x) {return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));}
  function sha256_Sigma1256(x) {return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));}
  function sha256_Gamma0256(x) {return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));}
  function sha256_Gamma1256(x) {return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));}
  function sha256_Sigma0512(x) {return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39));}
  function sha256_Sigma1512(x) {return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41));}
  function sha256_Gamma0512(x) {return (sha256_S(x, 1)  ^ sha256_S(x, 8) ^ sha256_R(x, 7));}
  function sha256_Gamma1512(x) {return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6));}
  
  var sha256_K = new Array
  (
    1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
    -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
    1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
    264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
    113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
    1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
    -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
    430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
    1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
    -1866530822, -1538233109, -1090935817, -965641998
  );
  
  function binb_sha256(m, l)
  {
    var HASH = new Array(1779033703, -1150833019, 1013904242, -1521486534,
                         1359893119, -1694144372, 528734635, 1541459225);
    var W = new Array(64);
    var a, b, c, d, e, f, g, h;
    var i, j, T1, T2;
  
    /* append padding */
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;
  
    for(i = 0; i < m.length; i += 16)
    {
      a = HASH[0];
      b = HASH[1];
      c = HASH[2];
      d = HASH[3];
      e = HASH[4];
      f = HASH[5];
      g = HASH[6];
      h = HASH[7];
  
      for(j = 0; j < 64; j++)
      {
        if (j < 16) W[j] = m[j + i];
        else W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                                              sha256_Gamma0256(W[j - 15])), W[j - 16]);
  
        T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
                                                            sha256_K[j]), W[j]);
        T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
        h = g;
        g = f;
        f = e;
        e = safe_add(d, T1);
        d = c;
        c = b;
        b = a;
        a = safe_add(T1, T2);
      }
  
      HASH[0] = safe_add(a, HASH[0]);
      HASH[1] = safe_add(b, HASH[1]);
      HASH[2] = safe_add(c, HASH[2]);
      HASH[3] = safe_add(d, HASH[3]);
      HASH[4] = safe_add(e, HASH[4]);
      HASH[5] = safe_add(f, HASH[5]);
      HASH[6] = safe_add(g, HASH[6]);
      HASH[7] = safe_add(h, HASH[7]);
    }
    return HASH;
  }
  
  function safe_add (x, y)
  {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }
  function binb2rstr(input) //Convert an array of big-endian words to a string
  {
    var output = "";
    for(var i = 0; i < input.length * 32; i += 8)
      output += ab_map[(input[i>>5] >>> (24 - i % 32)) & 0xFF]; //String.fromCharCode
    return output;
  }
  
  /* my code below
   * Convert a buffer/Uint8Array to an array of big-endian words
   * Characters >255 have their high-byte silently ignored.
   */
  function buf2binb(input)
  {
    var output = Array(input.length >> 2), i;
    for(i=0;i<output.length;i++) output[i]=0;
    for(i=0;i<input.length*8;i+=8)
      output[i>>5] |= (input[i / 8] & 0xFF) << (24 - i % 32);
    return output;
  }
  return function(buffer){ //I only want b64 of a sha256(buffer)
    return btoa(  binb2rstr( binb_sha256(buf2binb(buffer),buffer.length*8) )  )
  }
  
}());

var webcrypto, HASH
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
  webcrypto=crypto
  HASH=browserHash
}
else{
  HASH =(buffer)=>crypto.createHash('sha256').update(buffer).digest('base64')
  let crypto=require('node:crypto')
  webcrypto=crypto.webcrypto
}
const {floor,ceil,pow,round}=Math
const random=_=> webcrypto.getRandomValues(new Uint32Array(1))[0] / pow(2,32)
const range =(min,max)=> floor(random()*(max-min))+min, str=JSON.stringify
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