import React  from 'react'
import { Route, Router, Switch } from 'react-router-dom'
import { Grid, Segment } from 'semantic-ui-react'

import EditTodo from './components/EditTodo'
import { NotFound } from './components/NotFound'
import Todos from './components/Todos'
import { useAuth0 } from '@auth0/auth0-react'
import Callback from './components/Callback'
import NavBar from "./components/NavBar";
import LogIn from './components/LogIn'
import { History } from 'history'

const App = ({ history }: { history: History<unknown> }) => {
  const { isLoading, isAuthenticated,getAccessTokenSilently } = useAuth0();

  if(isLoading){
    return <Callback />
  }

  return (
    <div>
      <Segment style={{ padding: '8em 0em' }} vertical>
        <Grid container stackable verticalAlign='middle'>
          <Grid.Row>
            <Grid.Column width={16}>
              <Router history={history}>
                <NavBar />
                {isAuthenticated ?  <Switch>
                  <Route
                    path='/'
                    exact
                    render={props => {
                      return <Todos getToken={getAccessTokenSilently} {...props} />
                    }}
                  />

                  <Route
                    path='/todos/:todoId/edit'
                    exact
                    render={props => {
                      return <EditTodo getToken={getAccessTokenSilently} {...props} />
                    }}
                  />

                  <Route component={NotFound} />
                </Switch> : <LogIn />}
              </Router>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  );
}

export default App;

