import React from 'react'
// import { useAuth } from 'contexts/AuthContext'
import AuthModal from 'components/AuthModal'
import Header from 'components/Header'
import Footer from 'components/Footer'
// import logo from 'assets/react.svg'
import 'styles/ReactWelcome.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from 'pages/home/HomePage'
import AboutUs from 'pages/home/AboutUs'
import PrivacyPolicy from 'pages/home/PrivacyPolicy'
import CookiePolicy from 'pages/home/CookiePolicy'

const App = () => {
  return (

    // <div className='App'>
    <div className='flex flex-col min-h-screen'>
      <Header />
      {/* <ReactWelcome /> */}
      {/* <LoggedInStatus /> */}
      <AuthModal />
      <div className='flex-grow'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/cookie' element={<CookiePolicy />} />
        </Routes>
      </div>
      <Footer />
    </div>
    // </div>
  )
}

// const ReactWelcome = () => {
//   return (
//     <Fragment>
//       <img src={logo} className='ReactWelcome-logo' alt='logo' />
//       <p>
//         Edit <code>src/App.tsx</code> and save to reload.
//       </p>
//       <a className='ReactWelcome-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
//         Learn React
//       </a>
//     </Fragment>
//   )
// }

// const LoggedInStatus = () => {
//   const { isLoggedIn, account } = useAuth()

//   if (isLoggedIn && !!account) {
//     return <p>Hey, {account.username}! I'm happy to let you know: you are authenticated!</p>
//   }

//   return <p>Don't forget to start your backend server, and then authenticate yourself.</p>
// }

export default App
