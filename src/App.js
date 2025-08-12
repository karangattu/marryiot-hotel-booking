import React, { useState, useEffect } from 'react';
import './App.css';


const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const getRoomRate = (roomType) => {
  switch (roomType) {
    case 'suite':
      return 150;
    case 'double':
      return 100;
    case 'single':
      return 75;
    default:
      return 0;
  }
};

const isWeekend = (date) => {
    const day = new Date(date).getDay();
  return day === 5 || day === 6;
};

const calculateTotalCost = (bookingDetails) => {
  const { checkIn, checkOut, roomType, specialRequests } = bookingDetails;
  const nights = calculateNights(checkIn, checkOut);
  if (nights <= 0) return 0;

  let totalCost = 0;
  const baseRate = getRoomRate(roomType);

  let weekendSurcharge = 0;
  const currentDate = new Date(checkIn);
  for (let i = 0; i < nights; i++) {
    if (isWeekend(currentDate)) {
        weekendSurcharge += 25;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  let subTotal = nights * baseRate;
  if (nights > 7) {
    const discount = subTotal * 0.10; // Should be 0.15
    subTotal -= discount;
  }

  totalCost = subTotal + weekendSurcharge;

  if (specialRequests.toLowerCase().includes('view')) {
    totalCost += 50;
  }

  return parseFloat(totalCost.toFixed(2));
};


// --- Components ---

function BookingForm({ setBookingDetails, setView }) {
  const [details, setDetails] = useState({
    name: '', email: '', checkIn: '', checkOut: '', roomType: 'single', guests: 1, specialRequests: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newDetails = { ...details, [name]: value };
    setDetails(newDetails);
  setBookingDetails(newDetails);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!details.name) newErrors.name = 'Name is required.';
    if (/\d/.test(details.name)) newErrors.name = 'Name cannot contain numbers.';
    if (!/^\S+@\S+$/.test(details.email)) newErrors.email = 'A valid email is required.';
    if (!details.checkIn || !details.checkOut) {
      newErrors.dates = 'Check-in and check-out dates are required.';
    } else if (new Date(details.checkOut) < new Date(details.checkIn)) {
      newErrors.dates = 'Check-out date cannot be before check-in date.';
    }
    if (details.guests < 1) newErrors.guests = 'At least one guest is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const totalCost = calculateTotalCost(details);
      const finalBooking = { ...details, totalCost, id: Date.now() };

      localStorage.setItem('currentBooking', JSON.stringify(finalBooking));

      const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
      allBookings.push(finalBooking);
      localStorage.setItem('allBookings', JSON.stringify(allBookings));

      setView('confirmation');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-8 rounded-xl shadow-card w-full hover-card fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><i className="fas fa-concierge-bell text-primary-600 mr-3"></i>Book Your Stay</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-user mr-2 text-primary-500"></i>Full Name</label>
            <input type="text" id="name" name="name" value={details.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"/>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-envelope mr-2 text-primary-500"></i>Email Address</label>
            <input type="email" id="email" name="email" value={details.email} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"/>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-calendar-plus mr-2 text-primary-500"></i>Check-in Date</label>
            <input type="date" id="checkIn" name="checkIn" min={today} value={details.checkIn} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"/>
          </div>
          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-calendar-minus mr-2 text-primary-500"></i>Check-out Date</label>
            <input type="date" id="checkOut" name="checkOut" min={details.checkIn || today} value={details.checkOut} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"/>
          </div>
          {errors.dates && <p className="text-red-500 text-xs md:col-span-2">{errors.dates}</p>}
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-bed mr-2 text-primary-500"></i>Room Type</label>
            <select id="roomType" name="roomType" value={details.roomType} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
            </select>
          </div>
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-users mr-2 text-primary-500"></i>Number of Guests</label>
            <input type="number" id="guests" name="guests" min="1" max="6" value={details.guests} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"/>
            {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests}</p>}
          </div>
          <div className="md:col-span-2">
             <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-concierge-bell mr-2 text-primary-500"></i>Special Requests</label>
             <textarea id="specialRequests" name="specialRequests" rows="3" value={details.specialRequests} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" placeholder="e.g., a room with a view, extra pillows"></textarea>
          </div>
        </div>
        <div className="mt-8">
          <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center">
            <i className="fas fa-check-circle mr-2"></i> Book Now
          </button>
        </div>
      </form>
    </div>
  );
}

function ReservationSummary({ bookingDetails }) {
  const nights = calculateNights(bookingDetails.checkIn, bookingDetails.checkOut);
  const totalCost = calculateTotalCost(bookingDetails);
  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-card w-full mt-8 lg:mt-0 hover-card fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><i className="fas fa-clipboard-list text-primary-600 mr-3"></i>Booking Summary</h2>
      {nights > 0 ? (
        <div className="space-y-4">
          <div><h3 className="font-medium text-gray-700 flex items-center"><i className="far fa-calendar-alt mr-2 text-primary-500"></i>Dates</h3><p className="text-gray-600 ml-6">{bookingDetails.checkIn} to {bookingDetails.checkOut} ({nights} {nights === 1 ? 'night' : 'nights'})</p></div>
          <div><h3 className="font-medium text-gray-700 flex items-center"><i className="fas fa-door-open mr-2 text-primary-500"></i>Room</h3><p className="text-gray-600 capitalize ml-6">{bookingDetails.roomType} ({bookingDetails.guests} {bookingDetails.guests === 1 ? 'guest' : 'guests'})</p></div>
          <div className="border-t border-gray-200 pt-4 mt-4"><div className="flex justify-between items-center"><p className="text-lg font-medium text-gray-800 flex items-center"><i className="fas fa-receipt mr-2 text-primary-500"></i>Estimated Total</p><p className="text-2xl font-bold text-primary-600">${totalCost}</p></div><p className="text-xs text-gray-500 mt-1 ml-6">Includes taxes and fees.</p></div>
        </div>
      ) : (
        <div className="text-center py-8"><p className="text-gray-500">Your summary will appear here.</p></div>
      )}
    </div>
  );
}

function ConfirmationScreen({ setView }) {
    const [booking, setBooking] = useState(null);
    useEffect(() => {
  const savedBooking = localStorage.getItem('currentBooking');
  if (savedBooking) setBooking(JSON.parse(savedBooking));
    }, []);

    const handleNewBooking = () => {
        localStorage.removeItem('currentBooking');
        setView('booking');
    };

    if (!booking) return <div className="text-center p-8"><div className="bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4"><i className="fas fa-exclamation-circle text-red-500 text-4xl"></i></div><h2 className="text-2xl font-bold text-red-500">No Booking Found!</h2><button onClick={handleNewBooking} className="mt-4 bg-primary-600 text-white font-bold py-2 px-4 rounded-md hover:bg-primary-700 flex items-center mx-auto"><i className="fas fa-plus-circle mr-2"></i>Start a New Booking</button></div>;

    return (
        <div className="bg-white p-8 rounded-xl shadow-card max-w-2xl mx-auto hover-card fade-in">
            <div className="text-center"><div className="bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto"><i className="fas fa-check-circle text-green-500 text-4xl"></i></div><h2 className="mt-4 text-2xl font-bold text-gray-800">Booking Confirmed!</h2><p className="mt-2 text-gray-600">Thank you, {booking.name}. Your reservation is complete.</p></div>
            <div className="mt-8 border-t border-gray-200 pt-6"><h3 className="text-lg font-medium text-gray-800 mb-4">Reservation Details</h3><div className="space-y-3"><p><strong className="font-medium flex items-center"><i className="fas fa-envelope mr-2 text-primary-500"></i>Confirmation for:</strong> <span className="ml-1">{booking.email}</span></p><p><strong className="font-medium flex items-center"><i className="fas fa-calendar-alt mr-2 text-primary-500"></i>Dates:</strong> <span className="ml-1">{booking.checkIn} to {booking.checkOut}</span></p><p><strong className="font-medium flex items-center"><i className="fas fa-bed mr-2 text-primary-500"></i>Room:</strong> <span className="capitalize ml-1">{booking.roomType}</span> for {booking.guests} guests</p><p><strong className="font-medium flex items-center"><i className="fas fa-credit-card mr-2 text-primary-500"></i>Total Billed:</strong> <span className="font-bold text-primary-600 ml-1">${booking.totalCost}</span></p></div></div>
            <div className="mt-8 text-center"><button onClick={handleNewBooking} className="bg-primary-600 text-white font-bold py-3 px-6 rounded-md hover:bg-primary-700 flex items-center mx-auto"><i className="fas fa-plus-circle mr-2"></i> Make Another Reservation</button></div>
        </div>
    );
}

function LoginScreen({ setView, setIsAdmin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'password123') {
            setIsAdmin(true);
            setView('admin');
            setError('');
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-card max-w-md mx-auto hover-card fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center"><i className="fas fa-lock text-primary-600 mr-3"></i>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-user mr-2 text-primary-500"></i>Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 flex items-center"><i className="fas fa-key mr-2 text-primary-500"></i>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
                </div>
                {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}
                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 flex items-center justify-center"><i className="fas fa-sign-in-alt mr-2"></i>Login</button>
            </form>
        </div>
    );
}

function AdminPanel() {
    const [bookings, setBookings] = useState([]);
    useEffect(() => {
        const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
        setBookings(allBookings);
    }, []);

    return (
        <div className="bg-white p-8 rounded-xl shadow-card w-full hover-card fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><i className="fas fa-list-alt text-primary-600 mr-3"></i>All Reservations</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{b.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{b.checkIn} to {b.checkOut}</td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">{b.roomType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{b.guests}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${b.totalCost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {bookings.length === 0 && <div className="text-center py-8"><div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4"><i className="fas fa-calendar-xmark text-gray-400 text-2xl"></i></div><p className="text-gray-500">No reservations found.</p></div>}
            </div>
        </div>
    );
}


// --- Main App Component ---

export default function App() {
  const [bookingDetails, setBookingDetails] = useState({});
  const [view, setView] = useState('booking');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedBooking = localStorage.getItem('currentBooking');
  if (savedBooking && view !== 'confirmation') {
    setView('confirmation');
  }
  }, [view]);

  const renderView = () => {
    switch(view) {
        case 'confirmation':
            return <ConfirmationScreen setView={setView} />;
        case 'login':
            return <LoginScreen setView={setView} setIsAdmin={setIsAdmin} />;
        case 'admin':
            return isAdmin ? <AdminPanel /> : <LoginScreen setView={setView} setIsAdmin={setIsAdmin} />;
  case 'booking':
  default:
            return (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <BookingForm setBookingDetails={setBookingDetails} setView={setView} />
                    </div>
                    <div className="lg:col-span-1">
                        <ReservationSummary bookingDetails={bookingDetails} />
                    </div>
                </div>
            );
    }
  };

  const handleLogout = () => {
      setIsAdmin(false);
      setView('booking');
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased">
      <header className="bg-white shadow-elegant sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <i className="fas fa-hotel text-primary-600 mr-2 text-3xl"></i>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Marryiot Hotel & Suites</h1>
          </div>
          <nav>
            <button onClick={() => setView('booking')} className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${view === 'booking' ? 'text-primary-700 bg-primary-100' : 'text-gray-600 hover:bg-gray-100'}`}>
              <i className="fas fa-calendar-check mr-2"></i> Book a Room
            </button>
            {isAdmin ? (
                 <button onClick={handleLogout} className="ml-4 px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 flex items-center">
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            ) : (
                 <button onClick={() => setView('login')} className={`ml-4 px-4 py-2 text-sm font-medium rounded-md flex items-center ${view === 'login' || view === 'admin' ? 'text-primary-700 bg-primary-100' : 'text-gray-600 hover:bg-gray-100'}`}>
                <i className="fas fa-user-shield mr-2"></i> Admin Panel
              </button>
            )}
          </nav>
        </div>
      </header>
      <div className="container mx-auto px-4 mt-6">
        <div className="bg-primary-50 border border-primary-200 rounded-xl shadow-elegant p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between slide-up">
          <div>
            <h2 className="text-lg font-semibold text-primary-900 mb-2 flex items-center"><i className="fas fa-tag mr-2"></i> Room Rates</h2>
            <ul className="text-primary-800 text-base space-y-1">
              <li><i className="fas fa-bed mr-2 text-primary-600"></i><span className="font-medium">Single Room:</span> $75/night</li>
              <li><i className="fas fa-bed mr-2 text-primary-600"></i><span className="font-medium">Double Room:</span> $100/night</li>
              <li><i className="fas fa-star mr-2 text-primary-600"></i><span className="font-medium">Suite:</span> $150/night</li>
            </ul>
          </div>
        </div>
      </div>
      <main className="container mx-auto p-4 md:p-8">
        {renderView()}
      </main>
      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <i className="fas fa-hotel text-primary-400 mr-3 text-2xl"></i>
              <span className="text-xl font-semibold">Marryiot Hotel & Suites</span>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-300 hover:text-white"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-300 hover:text-white"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-400">&copy; 2025 Marryiot Hotel & Suites. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
