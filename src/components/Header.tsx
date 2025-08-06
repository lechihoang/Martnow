
"use client";
import React from 'react'
import Logo from './Logo'
import HeaderMenu from './HeaderMenu'
import Container from './Container'
import SignIn from './SignIn'
import SignUp from './SignUp'
import UserMenu from './UserMenu'

import useUser from '@/hooks/useUser';


const Header = () => {
  const { user, loading } = useUser();
  
  return (
    <header className="sticky top-0 z-50 py-5 bg-white/70 backdrop-blur-md">
      <Container className="flex items-center justify-between text-lightColor">
        <Logo />
        <HeaderMenu />
        <div className="flex items-center">
          {loading ? (
            <div className="px-4 py-2 text-sm">Loading...</div>
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <SignUp />
              <span className="mx-3 w-px h-6 bg-gray-600" />
              <SignIn />
            </>
          )}
        </div>
      </Container>
    </header>
  );
}

export default Header
