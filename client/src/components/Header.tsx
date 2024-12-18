import React, { Fragment, type MouseEventHandler, useState } from 'react'
import { useModalStore } from 'store/useModalStore'
import { useAuth } from 'contexts/AuthContext'
import OnlineIndicator from 'components/OnlineIndicator'
import { AppBar, IconButton, Avatar, Popover, List, ListSubheader, ListItemButton, Button } from '@mui/material'
import { Link } from 'react-router-dom'

interface Props {}

const Header: React.FC<Props> = () => {
  const { isLoggedIn, account, logout } = useAuth()
  const { setCurrentModal } = useModalStore()

  const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null)
  const [popover, setPopover] = useState(false)

  const openPopover: MouseEventHandler<HTMLButtonElement> = (e) => {
    setPopover(true)
    setAnchorEl(e.currentTarget)
  }

  const closePopover = () => {
    setPopover(false)
    setAnchorEl(null)
  }

  const clickLogin = () => {
    setCurrentModal('LOGIN')
    closePopover()
  }

  const clickRegister = () => {
    setCurrentModal('REGISTER')
    closePopover()
  }

  return (
    <AppBar className='header' position='static'>
      <div className='flex justify-between items-center w-full px-4'>
        <h1 className='text-lg font-bold'>Web App</h1>
        <div className='flex gap-4'>
          <Link to="/" className="text-white hover:text-gray-300">
            <Button>Home</Button>
          </Link>
          <Link to="/about" className="text-white hover:text-gray-300">
            <Button>About Us</Button>
          </Link>
        </div>
      </div>

      <IconButton onClick={openPopover}>
        <OnlineIndicator online={isLoggedIn}>
          <Avatar src={account?.username || ''} alt={account?.username || 'Guest'} />
        </OnlineIndicator>
      </IconButton>

      <Popover
        anchorEl={anchorEl}
        open={popover}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List style={{ minWidth: '100px' }}>
          <ListSubheader style={{ textAlign: 'center' }}>Hello, {account?.username || 'Guest'}</ListSubheader>

          {isLoggedIn ? (
            <ListItemButton onClick={logout}>Logout</ListItemButton>
          ) : (
            <Fragment>
              <ListItemButton onClick={clickLogin}>Login</ListItemButton>
              <ListItemButton onClick={clickRegister}>Register</ListItemButton>
            </Fragment>
          )}
        </List>
      </Popover>
    </AppBar>
  )
}

export default Header
