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

function timeTaken(user_function,times_testing){
  //the purpose is simple, testing the speed of a function
  let start=performance.now()
  for(let i=0;i<times_testing;i++){user_function()}
  return performance.now()-start
}

function makeTest(){
  const x1=-7, x2=8, a1=10, a2=128, B=40, C=6, temp={}
  let buffer=Buffer.alloc(B), chars=Array(C), old=Array(C), times=1, c=0
  for(let i=0;i<B;i++) buffer[i]=range(a1,a2);
  
  for(let i=0;i<C;i++){
    let index=unique(B,temp), change=range(x1,x2), num=change+buffer[index]
    let NEW=num<a1? a2-(a1-num): ((num-a1)%(a2-a1))+a1
    chars[i]=[index,[curve(NEW+x1,a1,a2),curve(NEW+x2,a1,a2)]]
    if(change===0) c++; old[i]=buffer[index]
    times*=1+x2-x1; buffer[index]=NEW
  }
  if(c===C) return makeTest();
  
  let array=Array.from(buffer)
  chars.forEach((a,i)=> buffer[a[0]]=old[i] )
  return [str({array,hash:HASH(buffer),chars,a1,a2,times}),str(buffer)]
}
function takeTest(input){
  const {array,hash,chars,a1,a2,times}=JSON.parse(input)
  let buffer=Buffer.from(array)
  for(let i=0;i<times;i++){
    //applies +1 or edits buffer to the possible combination
    for(let c=chars.length-1;c>=0;c--){
      let [index,[min,max]]=chars[c]
      let base=chars.base||( chars.base=1+(max>min? max-min: (a2-min)+(max-a1)) )
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

var isAllTrue=true
console.log(timeTaken(()=>{
  let [quiz,answer]=makeTest()
  let isTrue=takeTest(quiz)===answer
  isAllTrue=isAllTrue&&isTrue
},1))
console.log(isAllTrue)
