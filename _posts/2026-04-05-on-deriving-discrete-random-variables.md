---
title: "On deriving discrete random variables (hear me out)"
excerpt: "On another note, factorials do get weird when it comes to nCr and differentiability."
date: 2026-04-05T03:07:41-04:00
categories:
  - The Workshop
tags:
  - Mathematics
---

It all started with the following IB practice problem:
![Screenshot of an IB math AA problem from 2006, in French](/assets/images/ibmathproblem.png)

What I want to bring your focus to is the last one, (d): *Find the number of yellow tapes that we're most likely to end up with.*

To solve this, our instructor made use of brute force, where she just tried $P(X=1)$ to $P(X=3)$, and noticed that $P(X=2)$ was a maxima. But isn't there a better way to do this? using the derivative, such as $\frac{d(f(x))}{dx} = 0$ if and only if f(x) is a local extremum (max or min). That's what this article will be dedicated to, and excuse the bad math, I'm not use to posting it online. Nor am I sure that it's correct.

So a few days after that class, the following idea came to mind: If we define the combinatorial function $\binom{n}{r}$ using the following definitions of $n!$ and $\Gamma(m)$ to extend the factorial's domain to include reals, doesn't it become continuous and therefore differentiable?

$$\binom{n}{r} = \frac{n!}{r!(n-r)!} = \frac{\Gamma(n+1)}{\Gamma(r+1)\Gamma(n-r+1)}$$

$= \frac{(n+1)\Gamma(n)}{(r+1)\Gamma(r)(n-r+1)\Gamma(n-r)} = \frac{n+1}{(r+1)(n-r+1)}\frac{\Gamma(n)}{\Gamma(r)\Gamma(n-r)} = \frac{n+1}{nr - r^2 \cancel{+ r} + n \cancel{- r} + 1}\frac{\Gamma(n)}{\Gamma(r)\Gamma(n-r)} = \frac{n+1}{nr - r^2 + n + 1}\frac{\Gamma(n)}{\Gamma(r)\Gamma(n-r)}$

$$n! = \Gamma(n+1)$$

$$\Gamma(m) = \int_0^\infty t^{m-1} e^{-t}\,dt\text{, } \forall m \in \mathbb{C}$$

Warning: I don't know much about the properties of the Gamma function aside that it can act as a factorial but with real numbers (and complex ones too! would make for an interesting analysis)

I know about the gamma function because of Veritasium, of course. But let's dive deeper now.

After further (chatgpt) research, the following definition holds:

$$\frac{\Gamma(n)}{\Gamma(r)\Gamma(n-r)} = \frac{1}{n-r}\binom{n-1}{r-1}$$

because

$$\binom{n}{r} = \frac{\Gamma(n+1)}{\Gamma(r+1)\Gamma(n-r+1)} = \frac{(n-r)\Gamma(n+1)}{\Gamma(r+1)\Gamma(n-r)}$$

$$\iff \frac{1}{n-r}\binom{n}{r} = \frac{\Gamma(n+1)}{\Gamma(r+1)\Gamma(n-r)} = \frac{(n+1)\Gamma(n)}{(r+1)\Gamma(r)\Gamma(n-r)}$$

$$\iff \frac{1}{n-r}\binom{n-1}{r-1} = \frac{(n)\Gamma(n-1)}{(r)\Gamma(r-1)\Gamma(n-r)} = \frac{\Gamma(n)}{\Gamma(r)\Gamma(n-r)}$$

thanks to $\Gamma$'s property $\Gamma(x+1)=x\Gamma(x)$. There's also something called the beta function, which, apparently, for $\forall a,c \in \mathbb{C}$, converging if $\text{Re}(a) > 0 \wedge \text{Re}(b) > 0$, is defined as

$$B(a, c) = \frac{\Gamma(a)\Gamma(c)}{\Gamma(c-a)}$$

$$\iff B(r, n-r) = \frac{\Gamma(r)\Gamma(n-r)}{\Gamma(n)}$$

(parenthesis: not to be confused with the binomial distribution, this one's formal definition is $$B(z_{1}, z_{2}) = \int _{0}^{1} t^{z_{1}-1} (1-t)^{z_{2}-1} \, dt$$)[^1]

which, combined with the above expression, makes for

$$\frac{1}{n-r}\binom{n-1}{r-1} = \frac{\Gamma(n)}{\Gamma(r)\Gamma(n-r)} = \frac{1}{B(r, n-r)}$$

from which we can get

$$\binom{n}{r} = \frac{n+1}{nr - r^2 + n + 1}\frac{\Gamma(n)}{\Gamma(r)\Gamma(n-r)} = \frac{n+1}{nr - r^2 + n + 1}\frac{1}{B(r, n-r)}$$

or

$$\binom{n-1}{r-1} = \frac{(n-r)\Gamma(n)}{\Gamma(r)\Gamma(n-r)} = \frac{n-r}{B(r, n-r)}$$

from which we can get

$$\binom{n}{r} = \frac{(n-r)\Gamma(n+1)}{\Gamma(r+1)\Gamma(n-r)} = \frac{(n-r)n\Gamma(n)}{r\Gamma(r)\Gamma(n-r)} = \frac{n}{r}\frac{(n-r)\Gamma(n)}{\Gamma(r)\Gamma(n-r)} = \frac{n}{r}\frac{n-r}{B(r, n-r)} = \frac{n(n-r)}{rB(r, n-r)}$$

*$\Gamma$ has the cool property $\Gamma(x+1)=x\Gamma(x)$ (similar to factorials' $n! = n(n-1)!$), but $B$ has no such property, which makes the following move illegal: $\binom{n}{r} = \frac{n \cancel{+ 1} - r \cancel{- 1}}{B(r+1, n \cancel{+ 1} - r \cancel{-1})} = \frac{n-r}{B(r+1,n-r)}$*

therefore, we can state that

$$\binom{n}{r} = \frac{n(n-r)}{rB(r, n-r)}=\frac{n+1}{(nr - r^2 + n + 1)B(r, n-r)}$$

now, how we actually derive either of these, before setting them to zero, is another mystery.. hahahaha.

Edit (april 13th, 2026): I've tried integrating the beta function as it seems getting rid of the integral would probably help in terms of deriving the whole thing, but after two integrations by parts, it doesn't work unless I know $r$ and $n$. However, by waving the white flag and accepting an estimation, using the 3 first terms of the MacLauren series, using the definition stated above, we get the following solution:

$$B(z_{1}, z_{2}) = \int _{0}^{1} t^{z_{1}-1} (1-t)^{z_{2}-1} \, dt$$

$$\approx \left[\frac{t^{z_1}}{z_1} + \frac{(z_2-1)t^{z_1+1}}{z_1+1} + \frac{(z_2-1)(z_2-2)t^{(z_1-1)^2-1}}{(z_1-1)^2-1}+\text{C}\right]_0^1$$

$$\approx \frac{1^{z_1}}{z_1} + \frac{(z_2-1)1^{z_1+1}}{z_1+1} + \frac{(z_2-1)(z_2-2)1^{(z_1-1)^2-1}}{(z_1-1)^2-1}$$

Since I don't plan on using complex numbers, by arbitrarily limiting the domain of $z_1$ and $z_2$ to the integers $\mathbb{R}$, we can simplify it to:

$$B(z_{1}, z_{2}) \approx \frac{1}{z_1} + \frac{z_2-1}{z_1+1} + \frac{(z_2-1)(z_2-2)}{(z_1-1)^2-1}$$

Substituting $r=z_1$ and $n-r=z_2$, we get

$$B(r, n-r) \approx \frac{1}{r} + \frac{n-r-1}{r+1} + \frac{(n-r-1)(n-r-2)}{(r-1)^2-1}$$

Therefore

$$\binom{n}{r} \approx \frac{n(n-r)}{r\left(\frac{1}{r} + \frac{n-r-1}{r+1} + \frac{(n-r-1)(n-r-2)}{(r-1)^2-1}\right)}$$

$$\binom{n}{r} \approx \frac{n(n-r)}{1 + \frac{r(n-r-1)}{r+1} + \frac{r(n-r-1)(n-r-2)}{((r-1)-1)((r-1)+1)}}$$

$$\binom{n}{r} \approx \frac{n(n-r)}{1 + \frac{r(n-r-1)}{r+1} + \frac{\cancel{r}(n-r-1)(n-r-2)}{\cancel{r}(r-2)}}$$

$$\binom{n}{r} \approx \frac{n(n-r)}{1 + \frac{r(n-r-1)}{r+1} + \frac{(n-r-1)(n-r-2)}{r-2}}$$

Yay! Now to isolate $r$ in $\frac{d\binom{n}{r}}{dr}=0$...

$$\frac{d\binom{n}{r}}{dr} \approx \frac{d}{dr}\left(\frac{n(n-r)}{1 + \frac{r(n-r-1)}{r+1} + \frac{(n-r-1)(n-r-2)}{r-2}}\right)$$

$$\approx \frac{d}{dr}\left(\frac{n^2-nr}{1 + \frac{nr-r^2-r}{r+1} + \frac{r^2+(3-2n)r+n^2-3n+2}{r-2}}\right)$$

et cetera... Wow this is feeling like a very *very* _very_ long expression. To be continued.


[^1]: Anyone notice how this looks really similar to the binomial distribution's probability mass function $P(X=r)=\binom {n}{r}p^{r}(1-p)^{n-r}$ with n being the amount of retractions done? In fact, $B(n+1, n-r+1)$ brings us even closer...
