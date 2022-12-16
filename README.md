# pow_captcha (proof of concept right now)

I have a hash of a string x(string should be large)<br>
I have another string y, which is string x edited in p unique locations(p<=x)<br>
in each p index the character's integer form is changed in a range n<br>
_range n is logically defined as 1+x2-x1 where x1 is negative("under the current char) and x2 is positive("above" the current char)_

Everything besides string x is sent to a user and their job(the work) is to return string x<br>
Therefore the work needed would always be at max n^p-1 (most times obviously less)<br>
_(n^p)-1 and not n^p because the string y is intentionally never equal to string x_

The majority of the work making this was computing the range in a circular way from the range of characters in the first place<br>
For instance if range of characters is 3-9 and the editing range n, is 4 _x1(-1) to x2(+2)_, the original character x[some_p_index] is 8, comprehending the wrap around of that range was the challenge<br>
In this example, the range would be `7,8,3,4`

For the description above, here is where they exist in the `makeTest` function
- The original string x, is `buffer`
- The amount of indexes edited p, is `B`
- The range of characters c, `a1` <= c < `a2`
- The editable range n, ~well `x1` and `x2` are the variable names~

_I am testing ok, so I'm still working out how to make it as a packagethe code just runs a test with (16^6)-1 possible answers right now nothing else_
