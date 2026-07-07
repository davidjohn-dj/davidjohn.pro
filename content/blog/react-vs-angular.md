A React vs. Angular comparison is still a popular topic in 2020. React and AngularJS are both advanced, widely adopted JavaScript (JS) technologies that we use to create interactive single-page applications (SPAs). The number of JS tools for fast single-page application development is constantly growing, making the choice of which technology to rely on more challenging for us as web developers.

![](/images/blog/content/angularjs-vs-reactjs-javascript.jpg)

Both React and AngularJS are currently used by many business, news, and travel companies in the USA, the UK, Canada, France, Germany, Australia, and other countries. AngularJS has been included in virtually every list of top 10 JavaScript frameworks since its release in 2009. This Model–View–Controller framework has become extremely popular among web developers.

React is even more widely used by JavaScript programmers, although it’s actually a library, not a framework: the React library only has a View, but lacks Model and Controller components. So how did React became so popular? And how can we reasonably compare a framework (AngularJS) with a library (React)?

First, take a look at the React vs. Angular comparison in the table below.

![](/images/blog/content/React-vs.-Angular_-An-In-depth-Comparison-in-2020.png)

This is only an short overview of the difference between React and AngularJS. We'll discuss AngularJS and React in greater detail in the following sections.

## React vs. Angular Comparison

The main differences between AngularJS (the framework) and React (the library) are in the following aspects: componentization, data binding, performance, dependency resolution, directives, and templating. Let’s look at each of these aspects separately.

### Componentization

**AngularJS**

AngularJS has a very complex and fixed structure because it's based on the three layers — Model, View, and Controller — typical of single-page applications. An object $scope in AngularJS is responsible for the Model part, which is initialized by the Controller and then transformed into HTML to create the View for the user. AngularJS provides many standard services, factories, controllers, directives, and other components that will take some time for a JavaScript developer to master initially.

With AngularJS we break the application code into several files. For example, when we create a reusable component with our own directive, controller, and template, we must describe each chunk of code in a separate file. Once we describe our directive, we then add a link to our template in the directive to couple these parts. AngularJS directives represent the template logic for your application. The template is HTML extended with AngularJS directives, generally written as tags or attributes. We also add controllers to provide our models with necessary $scope or context. Controllers are written in separate files as well. When we modularize our application in such a way, we can reuse our template or component in a different part of the website.

**React**

Facebook, the creator of React, chose an architecture different from that of AngularJS and similar MVC frameworks. In short, there is no “correct" structure for applications built with React.

React is a large JavaScript library that helps us update the View for the user. But React still doesn't let us create applications on its own. The library lacks the model and controller layers. To fill in the gap, Facebook introduced Flux, which has numerous variants nowadays, to control the application workflow.

React provides a very simple and efficient way to build component trees. It boasts a functional programming style where component definitions are declarative. Composing your app from React components is like composing a JavaScript program from functions. Just look at the example below, taken from GitHub:
    
    
    var TodoApp = React.createClass({
      getInitialState: function () {
        return {
          nowShowing: app.ALL_TODOS,
          editing: null,
          newTodo: ''
        };
      },
      handleChange: function (event) {
        this.setState({
          newTodo: event.target.value
        });
      }
    });
    // other code is omitted for brevity

Code written in React is logically structured and readable thanks to the availability of components. The React library doesn’t demand that you write code in a certain way. They suggest that you use JSX (a special XML-like syntax) to create classes and templates, but it’s also possible to write plain JavaScript and HTML. This helps JavaScript developers adapt to React applications more easily, as there is no unusual syntax to learn.

React offers a freedom that AngularJS doesn’t. But this freedom comes at the cost of additional time spent designing the structure of an application. Before we start a new project, we have to think about what instruments we are going to use. When you have to pick a tool from among 100 options to resolve a single task, this choice becomes cumbersome.

### React vs. Angular Data Binding

**AngularJS**

AngularJS connects Document Object Model (DOM) values to Model data through the Controller using two-way data binding. In short, if the user interacts with an <input> field and provides a new value to the app, then not only the View is updated, but the Model as well. Two-way data binding is beneficial for AngularJS as it helps us write less boilerplate code to create interactions between components (the View and the Model) in our application. We don't have to invent a method to track changes in the app and change our JavaScript code accordingly.

The drawback of Angular's two-way data binding approach is its negative impact on performance. AngularJS automatically creates a watcher for each binding. During development, we may come to a point when an app is packed with too many watchers for bound elements.

**React**

But what are the advantages of React over AngularJS with regards to data binding? React uses  _one-way_ data binding, meaning we are able to direct the flow of data only in one direction. Because of this, it’s always clear where the data was changed. It’s worth noting that two-way data binding was available in React before v15 thanks to ReactLink.

![](/images/blog/content/reactjs-vs-angularjs-data-flow.jpg)

In order to implement a unidirectional data flow in React, Facebook created its own application architecture called Flux. Flux controls the flow of data to React components through one control point – the dispatcher. Flux's dispatcher receives an object (they call it an action) and transfers it to an appropriate store, which then updates itself. Once the update is finished, the View changes accordingly and sends a new action to the dispatcher. It's only possible to transfer an action to the store when it’s fully updated. With this concept, Flux improves the effectiveness of the code base. Based on our own experience we can say that Flux is great when you work with dynamically updated data.

The one-way data flow in React keeps complexity under control. It's much easier to debug self-contained components of large React applications than it is with similarly large AngularJS applications.

### React vs. Angular Performance

**AngularJS**

There are two things to take into consideration when we talk about Angular's performance. As we mentioned previously, Angular 1.x and higher relies on two-way data binding. This concept is based on “dirty checking," a mechanism that can make our AngularJS application laggy.

When we bind values in HTML with our model, AngularJS creates a watcher for each binding to track changes in the DOM. Once the View updates (becomes “dirty"), AngularJS compares the new value with the initial (bound) value and runs the $digest loop. The $digest loop then checks not only values that have actually changed, but also all others values that are tracked through watchers. This is why performance will decrease a lot if your application has too many watchers.

This drawback is even more painful when several values (Views) are dependent on each other. Once AngularJS sees that the change of a value was triggered by another change of a different value, then it stops the current $digest cycle and runs it all over again.

The loop doesn't stop working until it checks all watchers and applies all necessary changes to both the View and the Model. In practice, we can bind an <input> field to different Views and Models. When the user enters new data into the field, the change may not be immediately visible. It’s better to avoid that.

Another shortcoming of the AngularJS framework is the way it works with the DOM. Unlike React, AngularJS applies changes in the real DOM in the browser. When the real DOM gets updated, the browser has to change many internal values to represent a new DOM. This also has a negative impact on application performance.

Poor performance is the main reason why Angular 2 supporters re-worked how Angular changes the program state. [Angular 2](https://rubygarage.org/blog/the-angular-2-vs-react-contest-only-livens-up) and the latest Angular 4 framework versions also feature server-side rendering and one-way data binding similarly to React. Still, Angular 2 and 4 offer two-way data binding as an option.

**React**

The creators of React introduced the concept of the virtual Document Object Model, which is regarded as one of the greatest advantages of React in comparison with mature frameworks, including AngularJS. How does the virtual DOM work? When our HTML document is loaded, React creates a lightweight DOM tree from JavaScript objects and saves it on the server. When the user, for instance, enters new data in the <input> field in the browser, React creates a new virtual DOM and then compares it with the previously saved DOM. The library finds dissimilarities between two object models in such a way and rebuilds the virtual DOM once again, but with new changed HTML. All this work is done on the server, which reduces load on the browser.

Now, instead of sending completely new HTML to the browser, React sends the HTML only for the changed element. This approach is much more efficient than what AngularJS offers.

As for one-way data binding, React doesn't use watchers to track changes in the real DOM. Overall, React makes it simpler to control application performance. But this doesn't mean we cannot create a fast application in AngularJS.

### React vs. Angular Resolving Dependencies

**AngularJS**

AngularJS uses a basic Object Oriented Programming (OOP) pattern called dependency injection, meaning we write dependencies in a separate file. It’s inconvenient to create a dependency directly in an object. In AngularJS, dependency injection is inherent to any standard functions that we declare for an AngularJS factory or service. We only pass dependencies as parameters in any order in our functions. This is where vanilla JavaScript is different from AngularJS, as the order of arguments in standard JS is strict.
    
    
    angular.module('todomvc')
    // Angular injects four dependencies in the TodoCtrl function – $scope, $routeParams, $filter, and store;
    .controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, store) {
      'use strict';
      var todos = $scope.todos = store.todos;
      $scope.newTodo = '';
      $scope.editedTodo = null;
      // missing function code is omitted for brevity
    });

AngularJS automatically finds appropriate objects that are injected as the $routeParams, $filter, store, and $scope parameters. There are two functions that make dependency injection possible in the AngularJS framework: $inject and $provide.

We should also mention an issue with dependency injection in AngularJS; a small nuisance you may encounter when you run code minification.

A code minification program reduces dependency names to something like $b and $y for concision. But when executing the code, AngularJS will look for dependencies by their actual names, which are $scope, $filter, and store in the example above! This is when our program silently crashes. On the bright side, it's very easy to resolve this issue.

As you can see in the example below, we have declared the function TodoCtrl and passed only short names of arguments. Further below, we specifically show what to inject in our function in the necessary order. Therefore, the “s" argument stands for “$scope"; the “r" argument stands for “$routeParams", etc. AngularJS will find dependencies automatically. This time, pay attention to the order of the arguments.
    
    
    // an example from GitHub
    angular.module('todomvc')
      .controller('TodoCtrl', TodoCtrl);
    
    function TodoCtrl(s, r, f, a) {
      'use strict';
      var todos = s.todos = a.todos;
      s.newTodo = '';
      s.editedTodo = null;
      // missing function code is omitted for brevity
    };
    //inject dependencies using a special function
    TodoCtrl[“inject”] = [“$scope”, “$routeParams”, “$filter”, “store”];

There is also another way to pass a function and its dependencies – by using an array. The first array elements would be your dependencies followed by the function with short parameters.

Another example of how to inject dependencies into AngularJS module:
    
    
    [“$scope”, “$routeParams”, “$filter”, “store”, function TodoCtrl(s, r, f, a) { //your code goes here }];

**React**

The difference between React and AngularJS with regards to dependency injection is that React doesn’t offer any concept of a built-in container for dependency injection. But this doesn't mean we have to think of a method to inject dependencies in our React project. You can use several instruments to inject dependencies automatically in a React application. Such instruments include Browserify, RequireJS, EcmaScript 6 modules which we can use via Babel, ReactJS-di, and so on. The only challenge is to pick a tool to use.

### Directives and Templates

**AngularJS**

Directives in AngularJS are a way to organize our work/code around the DOM. If working with AngularJS, we access the DOM only through directives. For example, AngularJS has many standard directives, such as ng-bind or ng-app, but we can create own directives as well. And we should. This is a powerful way to work with the DOM. On the other hand, the syntax for making private AngularJS directives is rather difficult to understand.

We make our own directives in AngularJS to insert data into templates. The template must have an element with our directive written as an attribute. It's as simple as that. But AngularJS directives, if defined fully, are sophisticated. The object with settings, which we return in the directive, contains around ten properties. Such properties as templateUrl or template are easy to understand. But it’s not so clear how (and why) to define priority, terminal, scope, and other properties. Mastering the syntax of AngularJS directives may be a real challenge.

In summary, in order to bind DOM elements with AngularJS applications, we use directives, both standard and specific.

**React**

React doesn’t offer division into templates and directives or template logic. The template logic should be written in the template itself. To see what this looks like, open an [example from GitHub](https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/todoItem.jsx). You will notice that React's component app.TodoItem is created with a standard React.createClass() method. We pass an object with properties to this function. Such properties as componentDidUpdate, shouldComponentUpdate, handleKeyDown, or handleSubmit represent the logic – what will happen with our template. In the end of the component, we usually define the render property, which is a template to be rendered in the browser. Everything is located in one place, and the JSX syntax in the template is easy to understand even if you don’t know how to write in JSX. It's clear what is going to happen with our template, how it should be rendered and what information will be presented for it by properties.

Such an approach of defining template and logic in one place is better as we spend less time initially on understanding what is happening.

## React vs. Angular Summing Up

Both AngularJS and React are great for writing single-page applications. But they are completely different instruments. Some programmers may say that React is better than AngularJS or vice versa. What’s really best for a given project, however, depends on how you use these instruments.

Working with React may seem a bit easier starting out, because you write old-school JavaScript and build your HTML around it. But there are many additional tools you'll have to grasp, such as Flux. In turn, AngularJS implements a different approach organized around HTML. That's why we may see unusual syntax and solutions that seem questionable at first sight. But once you get used to AngularJS, you will certainly benefit from its features.
