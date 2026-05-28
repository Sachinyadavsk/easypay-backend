const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const {
    searchTrain,
    bookTrain,
    recentBookings,
    downloadTicket,
    searchHotel,
    bookHotel,
    hotelBookings,
    downloadTicketHotel,
    searchBus,
    bookBus,
    BusBookings,
    downloadTicketBus,
    searchFlight,
    bookFlight,
    FlightBookings,
    downloadTicketFlight
} = require('../controllers/travelController');

// train
router.post('/train/search', protect, searchTrain);
router.post('/train/book', protect, bookTrain);
router.get('/train/recent-bookings/:user_id', protect, recentBookings);
router.get('/train/download/:booking_id', protect, downloadTicket);

// Hotel
router.post('/hotel/search', protect, searchHotel);
router.post('/hotel/book', protect, bookHotel);
router.get('/hotel/recent-bookings/:user_id', protect, hotelBookings);
router.get('/hotel/download/:booking_id', protect, downloadTicketHotel);

// Bus
router.post('/bus/search', protect, searchBus);
router.post('/bus/book', protect, bookBus);
router.get('/bus/recent-bookings/:user_id', protect, BusBookings);
router.get('/bus/download/:booking_id', protect, downloadTicketBus);

// Flight
router.post('/flight/search', protect, searchFlight);
router.post('/flight/book', protect, bookFlight);
router.get('/flight/recent-bookings/:user_id', protect, FlightBookings);
router.get('/flight/download/:booking_id', protect, downloadTicketFlight);


module.exports = router;