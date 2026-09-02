import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Provide a fake authenticated user so the app renders the shell.
jest.mock('./hooks/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

test('renders main navigation', () => {
  render(<App />);
  expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
});
