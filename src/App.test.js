import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders informational card with room rates', () => {
  render(<App />);
  expect(screen.getByText(/Room Rates/i)).toBeInTheDocument();
  expect(screen.getByText(/Single Room: \$75\/night/i)).toBeInTheDocument();
  expect(screen.getByText(/Double Room: \$100\/night/i)).toBeInTheDocument();
  expect(screen.getByText(/Suite: \$150\/night/i)).toBeInTheDocument();
});

test('renders booking form', () => {
  render(<App />);
  expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Check-in Date/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Check-out Date/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Room Type/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Number of Guests/i)).toBeInTheDocument();
});

test('can navigate to admin panel login', () => {
  render(<App />);
  const adminButton = screen.getByText(/Admin Panel/i);
  fireEvent.click(adminButton);
  expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
});
