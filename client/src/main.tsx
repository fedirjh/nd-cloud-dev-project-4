import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import * as serviceWorker from './serviceWorker'
import 'semantic-ui-css/semantic.min.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { authConfig } from './config'
import App from './App'
import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

const onRedirectCallback = (appState: any) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider

const providerConfig = {
  domain: authConfig.domain,
  clientId: authConfig.clientId,
  audience: authConfig.audience,
  redirectUri: window.location.origin,
  onRedirectCallback,
};
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Auth0Provider {...providerConfig}>
    <App history={history} />
  </Auth0Provider>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
