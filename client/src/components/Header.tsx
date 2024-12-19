import React, { Fragment, type MouseEventHandler, useState } from 'react'
import { useModalStore } from 'store/useModalStore'
import { useAuth } from 'contexts/AuthContext'
import OnlineIndicator from 'components/OnlineIndicator'
import { AppBar, IconButton, Avatar, Popover, List, ListSubheader, ListItemButton } from '@mui/material'
import { Link } from 'react-router-dom'

interface Props { }

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
      <div className='flex justify-between items-center w-full px-4 py-4'>
        <div className="flex items-center gap-4 pl-8">
          <img
            src="https://via.placeholder.com/40" // Thay bằng logo của bạn
            alt="Company Logo"
            className="w-10 h-10"
          />
          <span className='text-teal-600 text-xl font-bold'>MediAI</span>
        </div>
        <div className='flex gap-10'>
          <Link to="/" className="font-semibold hover:text-teal-600">Home</Link>
          <Link to="/about" className="font-semibold hover:text-teal-600">About Us</Link>
          <Link to="/contact" className="font-semibold hover:text-teal-600">Contact Us</Link>
        </div>
        <div>
          <input
            type="text"
            placeholder="Find Trial"
            className="border rounded px-3 py-1"
          />
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
