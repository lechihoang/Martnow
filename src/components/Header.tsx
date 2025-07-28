import React from 'react'
import Logo from './Logo'
import HeaderMenu from './HeaderMenu'
import Container from './Container'
import SignIn from './SignIn'

const Header = () => {
  return (
    <Container className="flex items-center justify-between text-lightColor">
      <Logo />
      <HeaderMenu />
      <SignIn />
    </Container>
  )
}

export default Header