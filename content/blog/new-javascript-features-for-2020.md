Is this another overly hyped article about JavaScript. Perhaps!!! Maybe after reading this you will share my enthusiasm 😁. In 2020 JavaScript will be getting some exciting new features. Most of these features are already in the final stage of proposal and scheduled to release in 2020.

Some of these features are already available in the latest version of Chrome and Firefox browsers. So you can start playing with them in your browser right away. If not you can also head over to [https://codesandbox.io](https://codesandbox.io/) which is an online ide that allows you to write code in your browser.

If you would like to see all the proposals for new JavaScript features you can find them in the following github link.  
⚡️ <https://github.com/tc39/proposals>

Excited!!!, let’s dive in.

## Object.fromEntries()

First on our list is a Object method. It is very common in javascript to convert objects to array and vice versa. Especially when you are working with database like firebase or some other no-sql service we are often required to do these type of transformation. In es2017 Object.entries() was introduced which returns an array from an Object with its own key property.

Let’s take a look at an example.

Sample Code
    
    
    const object1 = {
      foo: "somestring",
      bar: 100
    };
    
    for (let [key, value] of Object.entries(object1)) {
      console.log(`${key}: ${value}`);
    }
    
    // Outputs-->
    // foo: somestring 
    // bar: 100 

`Object.fromEntries` does the opposite of `Object.entries`. Given an array it will output an object. Here’s an example
    
    
    const entries = new Map([
     ['foo', 'bar'],
     ['baz', 42]
    ]);
    
    const obj = Object.fromEntries(entries);
    
    console.log(obj);
    // expected output: Object { foo: "bar", baz: 42 }

## Dynamic import

This new feature will allow JavaScript to dynamically load modules as needed. Currently when we import modules in JavaScript they are loaded pre-runtime. This is why we keep them at the top of our files. This works for most cases. However, to increase performance, what if we could dynamically load some of our modules at runtime. This new feature will allow that. Below is an example of dynamic module import.
    
    
    const main = document.querySelector("main");
      for (const link of document.querySelectorAll("nav > a")) {
        link.addEventListener("click", e => {
          e.preventDefault();
    
          import(`./section-modules/${link.dataset.entryModule}.js`)
            .then(module => {
              module.loadPageInto(main);
            })
            .catch(err => {
              main.textContent = err.message;
            });
        });
      }

Dynamic imports will allow developers to have greater control in how modules get loaded in application.

  * It gives us the power to boost performance by not loading code until it is likely to be used
  * It allows to catch error scenarios when application fails to load a non-critical module
  * It can ensure modules that are dependent on each other don’t get caught into a race condition



You can read about dynamic imports more in the following GitHub link  
⚡️ <https://github.com/tc39/proposal-dynamic-import>

## String.prototype.matchAll()

This method returns an iterator object for all matches in a string. Let’s jump right into an example
    
    
    const re = /(Dr\. )\w+/g;
    const str = 'Dr. Smith and Dr. Anderson';
    const matches = str.matchAll(re);
    
    for (const match of matches) {
      console.log(match);
    }
    
    // outputs:
    // => ["Dr. Smith", "Dr. ", index: 0, input: "Dr. Smith and Dr. Anderson", groups: undefined]
    // => ["Dr. Anderson", "Dr. ", index: 14, input: "Dr. Smith and Dr. Anderson", groups: undefined]

This method makes it really easy to work with strings, sub-strings and pattern matching with regex.

## Promise.allSettled

This one is probably my favourite so far. It does exactly as the name suggests. It keeps track of settle promises. Let’s elaborate this through an example.  
Let’s say we have an array of promises. We can execute them with Promise.all. However, to know their status (which ones resolved and which ones failed) we need to iterate them all and return new value with the status.
    
    
    function reflect(promise) {
      return promise.then(
        (v) => {
          return { status: 'fulfilled', value: v };
        },
        (error) => {
          return { status: 'rejected', reason: error };
        }
      );
    }
    
    const promises = [ fetch('index.html'), fetch('https://does-not-exist/') ];
    const results = await Promise.all(promises.map(reflect));
    const successfulPromises = results.filter(p => p.status === 'fulfilled');

As you can see we are passing in a function called `reflect` to return the status. The new proposed api will not require this `reflect` function. We will be able to do the following
    
    
    const promises = [ fetch('index.html'), fetch('https://does-not-exist/') ];
    const results = await Promise.allSettled(promises);
    const successfulPromises = results.filter(p => p.status === 'fulfilled');

## Optional Chaining for JavaScript

If you have used Angular or Typescript chances are you are familiar with this feature. We often have to check whether an intermediate node exists in a tree like deep object.
    
    
    var street = user.address && user.address.street;

> The Optional Chaining Operator allows a developer to handle many of those cases without repeating themselves and/or assigning intermediate results in temporary variables:
    
    
    var street = user.address?.street
    var fooValue = myForm.querySelector('input[name=foo]')?.value

Example taken from offcial github proposal page.

Optional chaining can be used in three positions
    
    
    obj?.prop       // optional static property access
    obj?.[expr]     // optional dynamic property access
    func?.(...args) // optional function or method call

Indeed an exciting time for JavaScript. There are a couple of other features that are also up for release in 2020. BigInt and globalThis are notable.
