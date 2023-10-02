# pow_captcha (proof of work captcha)

# Usage
### Installation
```
git clone https://github.com/Y0ursTruly/pow_captcha.git
```
### Importing
```
const {makeTest, takeTest, takeTestAsync} = require('path/to/pow_captcha');
```

## Concept (what is this)
Usually, when one thinks of a "CAPTCHA", weird looking images with instructions about which one(s) to select to prove you're human. These ensure only human traffic to certain operations on a website.<br>
_However_, they do not stop spam to a server that much. The only way the server can verify a token is to use its resources to send a request the CAPTCHA service API (for at least reCAPTCHA and hCAPTCHA). On top of that, if the attacker spams enough, you would have sent enough requests to the respective API to disable your API credentials for a period of time, leading to denial of services to valid requests.<br>
Now, this proof of work captcha utilises cryptography in a way that a cryptographic "puzzle" can be created that takes a **physical amount of processor time** to complete, adding a logical delay to the spamming capabilities of an attacker.
- The puzzle is the hash of a correct buffer, an incorrect buffer being given and the definitions of various ranges where the computer can edit the buffer.
- The idea here is that a computer has to edit the incorrect buffer using the ranges, then to only stop when its hash is equal to the hash of the correct buffer.
- Buffer length has its part to play to be large enough that an attacker cannot pre hash every single possibility. An attacker needs to hash `(a2-a1)^B` *B* lengthed buffers to do this.
- For instance the default values have `a1` at 0, `a2` at 256 and `B` at 1024 if you check the argument descriptions below in the `makeTest` function. This means that an attacker would have to prehash 256^1024 sets of 1024 lengthed buffers (this is a ridiculous amount, check it out yourself) and therefore, one needs to take the **processor time** to complete this puzzle :D

## Exports
There are 3 functions that are exported for use
<ul>
  <li>
    <details>
      <summary><code>makeTest([tries[,B[,a1[,a2]]]])</code></summary>
      <ul>
        <li><b>Description: </b>This function generates a cryptographic quiz based on the arguments given. Arguments in this function have <a href="https://github.com/Y0ursTruly/pow_captcha/blob/master/pow.js#L221">these constraints</a></li>
        <li><b>Returns: </b>
<pre>string that looks like garbage but is the cryptographic quiz(hash of correct buffer, incorrect buffer, ranges of where to modify when guessing)</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>tries </b><code>number (default is 16^4)</code> The maximum amount of combinations(of the buffer) that might get guessed before arriving at the solution. In the cryptographic quiz, this is expressed in one or more ranges that multiply up to this number</li>
            <li><b>B </b><code>number (default is 1024)</code> The length of the buffer. This will not affect tries because specific ranges across the buffer are chosen, but it prevents an attacker from prehashing all combinations of the buffer</li>
            <li><b>a1 </b><code>number (default is 0)</code> The lowest value a byte can be. For example if a1 is 65, there will be no byte less than 'A' in the buffer</li>
            <li><b>a2 </b><code>number (default is 256)</code> The highest value a byte can be plus one. For example if a2 is 91, there will be no byte greater than 'Z' in the buffer</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <li>
    <details>
      <summary><code>takeTest(input)</code></summary>
      <ul>
        <li><b>Description: </b>This function solves a cryptographic quiz based on the string input given</li>
        <li><b>Returns: </b>
<pre>string that looks like garbage but is the solution of the given cryptographic quiz(the correct buffer)</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>input </b><code>string</code> A string which is a cryptographic quiz</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
  <li>
    <details>
      <summary><code>takeTestAsync(input)</code></summary>
      <ul>
        <li><b>Description: </b>To avoid hanging the process that called it, this runs the takeTest function in a worker thread</li>
        <li><b>Returns: </b>
<pre>string that looks like garbage but is the solution of the given cryptographic quiz(the correct buffer)</pre>
        </li>
        <li><b>Arguments: </b>
          <ul>
            <li><b>input </b><code>string</code> A string which is a cryptographic quiz</li>
          </ul>
        </li>
      </ul>
    </details>
  </li>
</ul>
