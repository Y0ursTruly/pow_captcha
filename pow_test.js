const {makeTest,takeTest}=require('./pow.js')

function timeTaken(user_function,times_testing){
  //the purpose is simple, testing the speed of a function
  let start=performance.now()
  for(let i=0;i<times_testing;i++){user_function()}
  return performance.now()-start
}

var isAllTrue=true
console.log('test 1:',timeTaken(()=>{
  let [quiz,answer]=makeTest(16**5*2,1024,10,128)
  let result=takeTest(quiz)
  let isTrue=result===answer
  isAllTrue=isAllTrue&&isTrue
},1))
console.log('test 2:',timeTaken(()=>{
  let [quiz,answer]=makeTest(16**4,500,50,256)
  let result=takeTest(quiz)
  let isTrue=result===answer
  isAllTrue=isAllTrue&&isTrue
},12))
console.log('success:',isAllTrue)