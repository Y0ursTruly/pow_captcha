const {makeTest,takeTest,ready}=require('./pow.js')
let red='\x1b[1m\x1b[31m', reset='\x1b[0m'

function timeTaken(user_function,times_testing=1){
  //the purpose is simple, testing the speed of a function
  let start=performance.now()
  for(let i=0;i<times_testing;i++) user_function();
  return performance.now()-start
}

var isAllTrue=true;
(async()=>{
  await ready;
  console.log('test 1(one large):')
  let [Lquiz,Lanswer]=makeTest(16**5*2,1024,10,128)
  console.log(timeTaken(()=>{
    let result=takeTest(Lquiz)
    let isTrue=result.toString("binary")===Lanswer.toString("binary")
    isAllTrue=isAllTrue&&isTrue
  },1))

  console.log('\ntest 2(sixty four small):')
  console.log(timeTaken(()=>{
    let [quiz,answer]=makeTest(16**4,500,32,127)
    let result=takeTest(quiz)
    let isTrue=result.toString("binary")===answer.toString("binary")
    isAllTrue=isAllTrue&&isTrue
  },64))

  console.log(`\ntest 3(specified buffer test):`)
  console.log(timeTaken(()=>{
    let chosen_text='abcdefghijklmnopqrstuvwxyz'
    let [quiz,answer]=makeTest(16**5,chosen_text)
    let result=takeTest(quiz)
    isTrue=result===answer && result===chosen_text
    isAllTrue=isAllTrue&&isTrue
  },1))

  console.log('success:',isAllTrue)
})()