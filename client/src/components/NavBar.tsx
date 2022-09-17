import React  from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  const {
    isAuthenticated,
    loginWithRedirect,
    logout
  } = useAuth0()

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin
    })

  return (
    <Menu>
      <Menu.Item name='home'>
        <Link to='/'>Home</Link>
      </Menu.Item>

      <Menu.Menu position='right'>
        {isAuthenticated ?
          (<Menu.Item name='logout' onClick={() => logoutWithRedirect()}>
              Log Out
          </Menu.Item>) :
          (<Menu.Item name='login' onClick={() => loginWithRedirect()}>
            Log In
          </Menu.Item>)
        }
      </Menu.Menu>
    </Menu>)
}

export default NavBar
