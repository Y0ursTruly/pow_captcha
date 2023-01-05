const {floor,ceil,pow,round}=Math, {webcrypto,createHash}=require('crypto')
const random=_=> webcrypto.getRandomValues(new Uint32Array(1))[0] / pow(2,32)
const range =(min,max)=> floor(random()*(max-min))+min, str=JSON.stringify
const curve =(num,min,max)=> num<min? max-(min-num): min+((num-min)%(max-min))
const HASH =(buffer)=>createHash('sha256').update(buffer).digest('base64')
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
  if(!makeTestCache[""+tries+B+a1+a2]){ //check for errors if these arguments haven't been tested in the process yet
    let r=RangeError //that's all I'm throwing ;-;
    if( [tries,B,a1,a2].some(arg=>typeof arg!=="number") ) throw new r("every argument must be a number");
    
    if(tries<4) throw new r("'tries' must be >= 4");
    if(B<1) throw new r("Buffer length, 'B' must be >=1");
    if(a1<0) throw new r("'a1' cannot be less than 0; no index in a buffer is negative");
    if(a2>256) throw new r("every index in a buffer goes up to 255, thus 'a2' must be <=256");
    if(a2-a1<4||(a2-a1)%2) throw new r("'a2' must be > 'a1' by an EVEN difference of at least 4");
    
    if(!Number.isSafeInteger(tries)) throw new r("count of 'tries' is an unsafe integer (too high)");
    if(tries.toString(2).includes('1',1)) throw new r("log2(tries) must be a whole number; eg 4,8,16,32...");
    makeTestCache[""+tries+B+a1+a2]=true
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
    chars[i]=[  index,  [ curve(NEW+x1,a1,a2), curve(NEW+x2,a1,a2) ]  ]
    old[i]=buffer[index]; buffer[index]=NEW
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



module.exports={makeTest,takeTest}