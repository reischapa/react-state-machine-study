import React, { Component } from 'react';

const appStates = {
  INITIAL: 'INITIAL',
  PROMPT: 'PROMPT',
  GIF: 'GIF',
  RESPONSE: 'RESPONSE',
  FEEDBACK: 'FEEDBACK'
};

const kleeneStateName = 'ANY';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: appStates.PROMPT,
      objectiveString: '',
      responseString: '',
      stateTransitions: Object.keys(appStates).reduce((acc, val) => {
        acc[appStates[val]] = Object.keys(appStates).filter(iKey => iKey !== val).reduce((iAcc, iVal) => {
          iAcc[appStates[iVal]] = false; 
          return iAcc;
        }, {});
        return acc;
      }, {})
    };

    this.state.stateTransitions[appStates.INITIAL][appStates.PROMPT] = true;
  }

  hasQueuedStateChange(state = this.state) {
    const {stateTransitions} = state;
    return (fromAppState) => { 
      return (toAppState) => {
        if (fromAppState === kleeneStateName) {
          if (toAppState === kleeneStateName) {
            const acc = [];

            Object.keys(stateTransitions).forEach(fromKey => {
              Object.keys(stateTransitions[fromKey]).forEach(toKey => {
                if (stateTransitions[fromKey][toKey]) {
                  acc.push(stateTransitions[fromKey][toKey]);
                }
              });
            });

            return acc.length > 0;
          }

          const acc = [];

          Object.keys(stateTransitions).map(fromKey => {
              if (stateTransitions[fromKey][toAppState]) {
                acc.push(stateTransitions[fromKey][toAppState]);
              }
          });

          return acc.length > 0;

        } else if (toAppState === kleeneStateName) {
          return Object.keys(stateTransitions[fromAppState]).filter(k => {
            return stateTransitions[fromAppState][k];
          }).length > 0;
        }

        return this.state.stateTransitions[fromAppState][toAppState];
      }
    }
  }

  updateStateFromAppStateTransitions() {
    this.setState(oldState => {
      let state = Object.assign({}, oldState);
      let updatedState = false;

      if (this.hasQueuedStateChange(oldState)(kleeneStateName)(appStates.PROMPT)){
        state.objectiveString = this.generateRandomString();
        state.responseString = '';
        updatedState = true;
      }

      if (this.hasQueuedStateChange(oldState)(appStates.INITIAL)(appStates.PROMPT)) {
        state.stateTransitions[appStates.INITIAL][appStates.PROMPT] = false;
        state.appState = appStates.PROMPT;
        updatedState = true;
      }

      if (this.hasQueuedStateChange(oldState)(appStates.PROMPT)(appStates.GIF)) {
        setTimeout(() => {
          this.setState(_state => {
            _state.stateTransitions[appStates.GIF][appStates.RESPONSE] = true;
            return _state;
          });
        }, 2000);

        state.stateTransitions[appStates.PROMPT][appStates.GIF] = false;
        state.appState = appStates.GIF;
        updatedState = true;
      }

      if (this.hasQueuedStateChange(oldState)(appStates.GIF)(appStates.RESPONSE)) {
        state.appState = appStates.RESPONSE;
        state.stateTransitions[appStates.GIF][appStates.RESPONSE] = false;
        updatedState = true;
      }

      if (this.hasQueuedStateChange(oldState)(appStates.RESPONSE)(appStates.FEEDBACK)) {
        setTimeout(() => {
          this.setState(_state => {
            _state.stateTransitions[appStates.FEEDBACK][appStates.PROMPT] = true;
            return _state;
          })
        }
        , 3000);

        state.stateTransitions[appStates.RESPONSE][appStates.FEEDBACK] = false;
        state.appState = appStates.FEEDBACK;
        updatedState = true;
      }

      if (this.hasQueuedStateChange(oldState)(appStates.FEEDBACK)(appStates.PROMPT)) {
        state.stateTransitions[appStates.FEEDBACK][appStates.PROMPT] = false;
        state.appState = appStates.PROMPT;
        updatedState = true;
      }

      return updatedState ? state : null;
    });
  }

  generateRandomString(len = 5) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  render() {
    this.updateStateFromAppStateTransitions();
    /*
    const gifComponent = (
      <video 
        id="gif" 
        src={this.state.gifUrl} 
        muted={false} 
        autoPlay={true} 
        loop={true}
        >
      </video>
    );
    */

    return (
      <div>
        {this.state.appState === appStates.PROMPT &&
          (<div>
            <div>
              <span>Here you get the string to remember...</span>
            </div>
            <div>
              <span style={{fontWeight: 'bold'}}>{this.state.objectiveString}</span>
              <button onClick={() => this.setState(state => {
                state.stateTransitions[appStates.PROMPT][appStates.GIF] = true;
                return state;
              })}>
                Go 
              </button>
            </div>
          </div>)
        }
        {this.state.appState === appStates.GIF &&
          (<div>
            <span>A gif would appear here...</span>
          </div>)
        }
        {this.state.appState === appStates.RESPONSE &&
          (<div>
            <div>
              <span>Here you would input your recollection of the string...</span>
            </div>
            <input type="text" onChange={(e) => {this.setState({responseString: e.target.value});}}/>
            <button type="button" onClick={() => {this.setState(state => {
              state.stateTransitions[appStates.RESPONSE][appStates.FEEDBACK] = true;
              return state;
            })}}>
              Submit
            </button>
          </div>)
        }
        {this.state.appState === appStates.FEEDBACK &&
          <div>
            <div>
              <span>And here you would get your feedback:</span>
            </div>
            <div>
              <span 
                style={{
                  color: String(this.state.responseString) === this.state.objectiveString ? 'green' : 'red'
                }}
              >
              {String(this.state.responseString) === this.state.objectiveString 
                ? 'Correct' 
                : 'Incorrect' 
              }
              </span>
            </div>
          </div>
        }
      </div>
    );
  }
}


