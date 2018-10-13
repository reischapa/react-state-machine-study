# react-state-machine-study

### A study on the feasibility of using a state-machine model to manage the displayed layout of a react app.

#### How to run

Clone the repo, then issue `cd react-state-machine-study && npm i && npm run start`, and go to `localhost:3000` (this app is based on [create-react-app](https://github.com/facebook/create-react-app)).

### Motivation

Initially, I wanted to create an application that allowed me to have to remember a randomly generated string after being exposed to a stimulus (a random gif), in order to see if it was possible to improve my [working memory](https://en.wikipedia.org/wiki/Working_memory).

While designing this app, I realized that I had essentially 4 different screens:
 - A presentation of the string to be remembered (PROMPT state)
 - A presentation of the distraction (GIF state)
 - A form to input my response (RESPONSE state)
 - A presentation of whether that response was right or wrong (FEEDBACK state)
 
I also knew exactly what needed to happen when there was a transition from one screen to the other. Since one is not able to directly change the layout of the page on an event (or, at least, its not good practice to do so) (a click, for instance), one must use `setState` to set some sort of flag in the component's state, and then conditionally render parts of a page based on the value of whatever flags are used.

What this implies in this case is at least 4 flags, one for each state. And this is assuming that there are no other processes that happen on a state transition, such as, for example, awaiting the conclusion of a request to an API.

Of course we can use a string to represent each page, but we still have the problem of having to manually perform all of the actions associated with each state transition, whenever we perform one.

So, instead, I chose to have a state transition store present in the component's state, on which the flags can be set whenever an state transition is desired, and which can then be queried in order to perform actions before the component is rendered. This logic can be seen in `App.js`, in which a call to `updateStateFromAppStateTransitions` is done in each render, which checks whether a transition is pending, and updates the current `appState` with the appropriate state name, with liberty to queue further state transitions.

Using this methodology, it is possible to use only the state names to control which components are rendered, resulting in a much cleaner `render` method.

If we had a case in which we had to wait for something to load or complete, we could just add another state (something like `GIF_LOADING`), and add the necessary logic to `updateStateFromAppStateTransitions`.

I did not advance any further and attempt to create a framework mostly because this started to look a lot like [redux](https://github.com/reduxjs/redux), and I did not want to end up [reinventing the wheel](https://xkcd.com/927/).

PS: This was my first time somewhat seriously implementing a sort of curried idiom (stuff like `this.hasQueuedStateChange(oldState)(kleeneStateName)(appStates.PROMPT)`, and I have to say, I really enjoyed it a lot. I'll be sure to use it more in the future.
