const {makeTest,takeTest,takeTestBrowser}=require('./pow.js')
let red='\x1b[1m\x1b[31m', reset='\x1b[0m'

function timeTaken(user_function,times_testing){
  //the purpose is simple, testing the speed of a function
  let start=performance.now()
  for(let i=0;i<times_testing;i++) user_function();
  return performance.now()-start
}

var isAllTrue=true;
(()=>{
  console.log('test 1(one large):')
  let [Lquiz,Lanswer]=makeTest(16**5*2,1024,10,128)
  console.log(timeTaken(()=>{
    let result=takeTest(Lquiz)
    let isTrue=result===Lanswer
    isAllTrue=isAllTrue&&isTrue
  },1))

  console.log('\ntest 2(twelve small):')
  console.log(timeTaken(()=>{
    let [quiz,answer]=makeTest(16**4,500,50,256)
    let result=takeTest(quiz)
    let isTrue=result===answer
    isAllTrue=isAllTrue&&isTrue
  },12))

  console.log(`\ntest 3 ${red}SLOW${reset} (one large with browser hash):`)
  console.log(timeTaken(()=>{
    let result=takeTestBrowser(Lquiz)
    let isTrue=result===Lanswer
    isAllTrue=isAllTrue&&isTrue
  },1))

  console.log('success:',isAllTrue)
})()