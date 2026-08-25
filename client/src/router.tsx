import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { default: ChatHome } = await import('./pages/ChatHome.js');
      return { Component: ChatHome };
    },
  },
  {
    path: '/login',
    lazy: async () => {
      const { default: Login } = await import('./pages/Login.js');
      return { Component: Login };
    },
  },
  {
    path: '/register',
    lazy: async () => {
      const { default: Register } = await import('./pages/Register.js');
      return { Component: Register };
    },
  },
]);
