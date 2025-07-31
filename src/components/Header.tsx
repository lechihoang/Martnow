
"use client";
import React, { useEffect, useState } from 'react'
import Logo from './Logo'
import HeaderMenu from './HeaderMenu'
import Container from './Container'
import SignIn from './SignIn'
import SignUp from './SignUp'
import UserMenu from './UserMenu'

// Giả lập lấy user từ localStorage hoặc context (bạn thay bằng hook thực tế nếu có)

function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        // Nếu có accessToken mà chưa có user, gọi API lấy profile
        const token = localStorage.getItem('accessToken');
        if (token) {
          fetch('http://localhost:3001/auth/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          })
            .then(res => res.ok ? res.json() : null)
            .then(profile => {
              if (profile) {
                localStorage.setItem('user', JSON.stringify(profile));
                setUser(profile);
              }
            });
        }
      }
    }
  }, []);

  return user;
}


const Header = () => {
  const user = useUser();
  return (
    <header className="sticky top-0 z-50 py-5 bg-white/70 backdrop-blur-md">
      <Container className="flex items-center justify-between text-lightColor">
        <Logo />
        <HeaderMenu />
        <div className="flex items-center">
          {user ? (
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
