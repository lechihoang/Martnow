import { useEffect, useState } from 'react';

function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        // Gọi API lấy profile, cookie sẽ tự gửi kèm
        fetch('http://localhost:3001/auth/profile', {
          method: 'POST',
          credentials: 'include',
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
  }, []);

  return user;
}

export default useUser;
