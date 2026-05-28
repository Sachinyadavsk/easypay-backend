
const TravelBooking = require('../models/TravelBooking');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit')
// Train
// SEARCH TRAIN
const searchTrain = async (req, res) => {
    try {
        const { from, to, journeyDate, classType, quota, passengers } = req.body
        if (!from || !to || !journeyDate) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // DEMO TRAIN LIST
        const trains = [
            {
                id: 1,
                name: 'Rajdhani Express',
                number: '12951',
                from,
                to,
                departure: '06:30 AM',
                arrival: '02:10 PM',
                duration: '7h 40m',
                price: 1450,
                seats: 42,
                rating: 4.9,
                features: ['Wifi', 'Food']
            },
            {
                id: 2,
                name: 'Shatabdi Express',
                number: '12002',
                from,
                to,
                departure: '08:00 AM',
                arrival: '01:45 PM',
                duration: '5h 45m',
                price: 980,
                seats: 26,
                rating: 4.8,
                features: ['Meals', 'AC']
            }
        ]

        return res.status(200).json({
            status: true,
            trains
        })

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: 'Train search failed'
        })
    }
}

// BOOK TRAIN
const bookTrain = async (req, res) => {
    try {
        const { from, to, journeyDate, quota, classType, passengers, selectedTrain, amount, mpin } = req.body;
        const user_id = req.user._id;
        if (!from || !to || !journeyDate || !selectedTrain || !amount || !mpin) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // FIND USER
        const user = await User.findById(user_id);
        // Verify MPIN
        if (!user.mpin) return res.status(400).json({
            message: 'Please setup MPIN first'
        });
        const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin);
        if (!isMpinCorrect)
            return res.status(401).json({
                message: 'Incorrect MPIN'
            });
        if (user.balance < amount) {
            return res.status(400).json({
                message: 'Insufficient wallet balance'
            });
        }
        // GENERATE BOOKING ID
        const booking_id = 'TRN' + Date.now()
        // SAVE BOOKING
        const booking = new TravelBooking({
            user_id,
            booking_id,
            train_name: selectedTrain,
            train_number: '12951',
            from_station: from,
            to_station: to,
            journey_date: journeyDate,
            departure: '06:30 AM',
            arrival: '02:10 PM',
            duration: '7h 40m',
            class_type: classType,
            quota,
            travel_type: 'Train',
            passengers,
            amount
        })

        await booking.save()
        // DEDUCT BALANCE
        user.balance = Number(user.balance) - Number(amount)
        await user.save()
        return res.status(200).json({
            status: true,
            message: 'Train ticket booked successfully',
            ticket: booking,
            balance: user.balance,
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Booking failed'
        })
    }
}

// RECENT BOOKINGS
const recentBookings = async (req, res) => {
    try {
        const user_id = req.params.user_id
        const bookings = await TravelBooking.find({ user_id })
            .sort({ createdAt: -1 })
            .limit(10)
        return res.status(200).json({
            status: true,
            bookings
        })
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch bookings'
        })
    }
}

// DOWNLOAD TICKET
const downloadTicket = async (
    req,
    res
) => {

    try {

        const booking_id =
            req.params.booking_id

        const ticket =
            await TravelBooking.findOne({
                booking_id
            })

        if (!ticket) {

            return res.status(404).json({
                status: false,
                message: 'Ticket not found'
            })
        }

        // ===============================
        // PDF HEADERS
        // ===============================

        res.setHeader(
            'Content-Type',
            'application/pdf'
        )

        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${booking_id}.pdf`
        )

        // ===============================
        // CREATE PDF
        // ===============================

        const doc = new PDFDocument({
            size: 'A4',
            margin: 40
        })

        doc.pipe(res)

        // ===============================
        // HEADER
        // ===============================

        doc
            .rect(0, 0, 595, 90)
            .fill('#0f4c81')

        doc
            .fillColor('white')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text(
                'INDIAN RAILWAYS',
                40,
                25
            )

        doc
            .fontSize(12)
            .font('Helvetica')
            .text(
                'E-Ticket / Electronic Reservation Slip',
                40,
                58
            )

        // ===============================
        // RESET COLOR
        // ===============================

        doc.fillColor('black')

        // ===============================
        // TICKET BOX
        // ===============================

        doc
            .roundedRect(
                30,
                110,
                535,
                620,
                10
            )
            .lineWidth(1)
            .stroke('#cccccc')

        // ===============================
        // BOOKING DETAILS TITLE
        // ===============================

        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .fillColor('#0f4c81')
            .text(
                'Ticket Details',
                50,
                130
            )

        doc.fillColor('black')

        // ===============================
        // BOOKING DETAILS
        // ===============================

        const leftX = 50
        const rightX = 310

        let y = 180

        const rowGap = 32

        // LEFT COLUMN

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(
                'Booking ID:',
                leftX,
                y
            )

        doc
            .font('Helvetica')
            .text(
                ticket.booking_id,
                leftX + 120,
                y
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Train Name:',
                leftX,
                y + rowGap
            )

        doc
            .font('Helvetica')
            .text(
                ticket.train_name,
                leftX + 120,
                y + rowGap
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Train Number:',
                leftX,
                y + rowGap * 2
            )

        doc
            .font('Helvetica')
            .text(
                ticket.train_number,
                leftX + 120,
                y + rowGap * 2
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Journey Date:',
                leftX,
                y + rowGap * 3
            )

        doc
            .font('Helvetica')
            .text(
                ticket.journey_date,
                leftX + 120,
                y + rowGap * 3
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Passengers:',
                leftX,
                y + rowGap * 4
            )

        doc
            .font('Helvetica')
            .text(
                ticket.passengers.toString(),
                leftX + 120,
                y + rowGap * 4
            )

        // RIGHT COLUMN

        doc
            .font('Helvetica-Bold')
            .text(
                'Class:',
                rightX,
                y
            )

        doc
            .font('Helvetica')
            .text(
                ticket.class_type,
                rightX + 120,
                y
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Quota:',
                rightX,
                y + rowGap
            )

        doc
            .font('Helvetica')
            .text(
                ticket.quota,
                rightX + 120,
                y + rowGap
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Amount:',
                rightX,
                y + rowGap * 2
            )

        doc
            .font('Helvetica')
            .text(
                `₹${ticket.amount}`,
                rightX + 120,
                y + rowGap * 2
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Status:',
                rightX,
                y + rowGap * 3
            )

        doc
            .fillColor('green')
            .text(
                ticket.booking_status,
                rightX + 120,
                y + rowGap * 3
            )

        doc.fillColor('black')

        // ===============================
        // ROUTE SECTION
        // ===============================

        doc
            .roundedRect(
                50,
                380,
                475,
                100,
                8
            )
            .fillAndStroke(
                '#f4f7fb',
                '#d6d6d6'
            )

        doc
            .fillColor('#0f4c81')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(
                ticket.from_station,
                80,
                415
            )

        doc
            .fontSize(28)
            .text(
                '→',
                275,
                405,
                {
                    align: 'center'
                }
            )

        doc
            .fontSize(16)
            .text(
                ticket.to_station,
                400,
                415
            )

        // ===============================
        // JOURNEY INFO
        // ===============================

        doc.fillColor('black')

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(
                'Departure:',
                60,
                520
            )

        doc
            .font('Helvetica')
            .text(
                ticket.departure || '06:30 AM',
                160,
                520
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Arrival:',
                300,
                520
            )

        doc
            .font('Helvetica')
            .text(
                ticket.arrival || '02:10 PM',
                380,
                520
            )

        doc
            .font('Helvetica-Bold')
            .text(
                'Duration:',
                60,
                560
            )

        doc
            .font('Helvetica')
            .text(
                ticket.duration || '7h 40m',
                160,
                560
            )

        // ===============================
        // IMPORTANT NOTE
        // ===============================

        doc
            .roundedRect(
                50,
                610,
                475,
                70,
                8
            )
            .fillAndStroke(
                '#fff8e6',
                '#e5c96b'
            )

        doc
            .fillColor('#9a6700')
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(
                'Important Instructions',
                65,
                625
            )

        doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('black')
            .text(
                '• Carry valid government ID proof during journey.\n• Please arrive at station 30 minutes before departure.\n• Ticket once booked cannot be transferred.',
                65,
                645
            )

        // ===============================
        // FOOTER
        // ===============================

        doc
            .fontSize(10)
            .fillColor('#666666')
            .text(
                'Generated by Indian Railways Reservation System',
                50,
                760,
                {
                    align: 'center',
                    width: 500
                }
            )

        // ===============================
        // END PDF
        // ===============================

        doc.end()

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            status: false,
            message: 'PDF generation failed'
        })
    }
}

// Hotel
const searchHotel = async (req, res) => {
    try {
        const { city, checkIn, checkOut, guests, roomType } = req.body;
        if (!city || !checkIn || !checkOut) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // DEMO HOTEL LIST
        const hotels = [
            {
                id: 1,
                name: 'Grand Palace Hotel',
                location: city,
                room: roomType,
                price: 3499,
                rating: 4.8,
                amenities: [
                    'Wifi',
                    'Breakfast',
                    'Parking'
                ]
            },

            {
                id: 2,
                name: 'Royal Stay Inn',
                location: city,
                room: roomType,
                price: 4999,
                rating: 4.9,
                amenities: [
                    'Pool',
                    'Restaurant',
                    'Wifi'
                ]
            },

            {
                id: 3,
                name: 'Sunrise Residency',
                location: city,
                room: roomType,
                price: 2899,
                rating: 4.6,
                amenities: [
                    'Breakfast',
                    'Beach View',
                    'Wifi'
                ]
            }

        ]

        return res.status(200).json({
            status: true,
            hotels
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Hotel search failed'
        })
    }
}

// BOOK HOTEL
const bookHotel = async (req, res) => {
    try {
        const { city, checkIn, checkOut, guests, selectedHotel, roomType, amount, mpin } = req.body;
        const user_id = req.user._id

        // VALIDATION
        if (!city || !checkIn || !checkOut || !selectedHotel || !amount || !mpin) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // FIND USER
        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            })
        }

        // CHECK MPIN
        if (!user.mpin) {
            return res.status(400).json({
                status: false,
                message: 'Please setup MPIN first'
            })
        }

        const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin)
        if (!isMpinCorrect) {
            return res.status(401).json({
                status: false,
                message: 'Incorrect MPIN'
            })
        }

        // CHECK BALANCE
        if (Number(user.balance) < Number(amount)) {
            return res.status(400).json({
                status: false,
                message: 'Insufficient wallet balance'
            })
        }

        // CREATE BOOKING ID
        const booking_id = 'HTL' + Date.now()

        // SAVE BOOKING
        const booking = new TravelBooking({
            user_id,
            booking_id,
            hotel_name: selectedHotel,
            city,
            room_type: roomType,
            check_in: checkIn,
            check_out: checkOut,
            travel_type: 'Hotel',
            guests,
            amount
        })

        await booking.save()
        // DEDUCT BALANCE
        user.balance = Number(user.balance) - Number(amount)
        await user.save()
        // RESPONSE
        return res.status(200).json({
            status: true,
            message: 'Hotel booked successfully',
            ticket: booking,
            balance: user.balance
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Hotel booking failed'
        })
    }
}

// RECENT BOOKINGS
const hotelBookings = async (req, res) => {
    try {
        const user_id = req.params.user_id
        const bookings = await TravelBooking.find({ user_id })
            .sort({
                createdAt: -1
            })
            .limit(10)

        return res.status(200).json({
            status: true,
            bookings
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch bookings'
        })
    }
}

// DOWNLOAD HOTEL PDF
const downloadTicketHotel = async (req, res) => {
    try {
        const booking_id = req.params.booking_id
        const ticket = await TravelBooking.findOne({ booking_id })
        if (!ticket) {
            return res.status(404).json({
                status: false,
                message: 'Booking not found'
            })
        }

        // PDF HEADERS
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${booking_id}.pdf`)
        // CREATE PDF
        const doc = new PDFDocument({ size: 'A4', margin: 40 })
        doc.pipe(res)
        // HEADER
        doc.rect(0, 0, 595, 100).fill('#be185d')
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('HOTEL BOOKING', 40, 30)
        doc.fontSize(12).font('Helvetica').text('Reservation Confirmation', 40, 65)
        doc.fillColor('black')
        // BOX
        doc.roundedRect(30, 120, 535, 580, 10).stroke('#cccccc')
        // TITLE
        doc.fontSize(18).fillColor('#be185d').font('Helvetica-Bold').text('Booking Details', 50, 145)
        doc.fillColor('black')

        // DETAILS
        let y = 200
        const gap = 35

        doc.fontSize(12).font('Helvetica-Bold').text('Booking ID:', 50, y)
        doc.font('Helvetica').text(ticket.booking_id, 180, y)
        doc.font('Helvetica-Bold').text('Hotel Name:', 50, y + gap)
        doc.font('Helvetica').text(ticket.hotel_name, 180, y + gap)
        doc.font('Helvetica-Bold').text('City:', 50, y + gap * 2)
        doc.font('Helvetica').text(ticket.city, 180, y + gap * 2)
        doc.font('Helvetica-Bold').text('Room Type:', 50, y + gap * 3)
        doc.font('Helvetica').text(ticket.room_type, 180, y + gap * 3)
        doc.font('Helvetica-Bold').text('Check-In:', 50, y + gap * 4)
        doc.font('Helvetica').text(ticket.check_in, 180, y + gap * 4)
        doc.font('Helvetica-Bold').text('Check-Out:', 50, y + gap * 5)
        doc.font('Helvetica').text(ticket.check_out, 180, y + gap * 5)
        doc.font('Helvetica-Bold').text('Guests:', 50, y + gap * 6)

        doc.font('Helvetica').text(String(ticket?.guests || "N/A"), 180, y + gap * 6)
        doc.font('Helvetica-Bold').text('Amount:', 50, y + gap * 7)
        doc.font('Helvetica').text(`₹${ticket.amount}`, 180, y + gap * 7)
        doc.font('Helvetica-Bold').text('Status:', 50, y + gap * 8)
        doc.fillColor('green').text(ticket.booking_status, 180, y + gap * 8)
        // FOOTER
        doc.fillColor('#666666').fontSize(10).text('Generated by Hotel Reservation System', 50, 760,
            {
                align: 'center',
                width: 500
            }
        )
        doc.end()
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'PDF generation failed'
        })
    }
}

// Bus conditon setup
// Bus
const searchBus = async (req, res) => {
    try {
        const { from, to, passengers, date } = req.body;
        if (!from || !to || !passengers || !date) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // DEMO HOTEL LIST
        const buses = [
            {
                id: 1,
                name: 'Volvo AC Sleeper',
                time: '08:30 PM',
                arrival: '06:00 AM',
                price: 899,
                seats: passengers,
                rating: 4.8
            },
            {
                id: 2,
                name: 'Scania Luxury',
                time: '09:45 PM',
                arrival: '07:15 AM',
                price: 1099,
                seats: passengers,
                rating: 4.9
            },
            {
                id: 3,
                name: 'Express Non AC',
                time: '06:00 PM',
                arrival: '04:30 AM',
                price: 599,
                seats: passengers,
                rating: 4.5
            }
        ];

        return res.status(200).json({
            status: true,
            buses
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Bus search failed'
        })
    }
}

// BOOK Bus
const bookBus = async (req, res) => {
    try {
        const { from, to, date, passengers, selectedBus, amount, mpin, classType } = req.body;
        const user_id = req.user._id

        // VALIDATION
        if (!from || !to || !date || !passengers || !selectedBus || !amount || !mpin) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // FIND USER
        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            })
        }

        // CHECK MPIN
        if (!user.mpin) {
            return res.status(400).json({
                status: false,
                message: 'Please setup MPIN first'
            })
        }

        const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin)
        if (!isMpinCorrect) {
            return res.status(401).json({
                status: false,
                message: 'Incorrect MPIN'
            })
        }

        // CHECK BALANCE
        if (Number(user.balance) < Number(amount)) {
            return res.status(400).json({
                status: false,
                message: 'Insufficient wallet balance'
            })
        }

        // CREATE BOOKING ID
        const booking_id = 'HTL' + Date.now()

        // SAVE BOOKING
        const booking = new TravelBooking({
            user_id,
            booking_id,
            bus_name: selectedBus,
            from_station: from,
            to_station: to,
            journey_date: date,
            departure: '06:30 AM',
            arrival: '02:10 PM',
            duration: '7h 40m',
            class_type: classType,
            travel_type: 'Bus',
            passengers,
            amount
        })

        await booking.save()
        // DEDUCT BALANCE
        user.balance = Number(user.balance) - Number(amount)
        await user.save()
        // RESPONSE
        return res.status(200).json({
            status: true,
            message: 'Bus booked successfully',
            ticket: booking,
            balance: user.balance
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Hotel booking failed'
        })
    }
}

// RECENT BOOKINGS
const BusBookings = async (req, res) => {
    try {
        const user_id = req.params.user_id
        const bookings = await TravelBooking.find({ user_id })
            .sort({
                createdAt: -1
            })
            .limit(10)

        return res.status(200).json({
            status: true,
            bookings
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch bookings'
        })
    }
}

// DOWNLOAD Bus PDF
const downloadTicketBus = async (req, res) => {
    try {
        const booking_id = req.params.booking_id
        const ticket = await TravelBooking.findOne({ booking_id })
        if (!ticket) {
            return res.status(404).json({
                status: false,
                message: 'Booking not found'
            })
        }

        // PDF HEADERS
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${booking_id}.pdf`)
        // CREATE PDF
        const doc = new PDFDocument({ size: 'A4', margin: 40 })
        doc.pipe(res)
        // HEADER
        doc.rect(0, 0, 595, 100).fill('#be185d')
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('BUS BOOKING', 40, 30)
        doc.fontSize(12).font('Helvetica').text('Reservation Confirmation', 40, 65)
        doc.fillColor('black')
        // BOX
        doc.roundedRect(30, 120, 535, 580, 10).stroke('#cccccc')
        // TITLE
        doc.fontSize(18).fillColor('#be185d').font('Helvetica-Bold').text('Booking Details', 50, 145)
        doc.fillColor('black')

        // DETAILS
        let y = 200
        const gap = 35

        doc.fontSize(12).font('Helvetica-Bold').text('Booking ID:', 50, y)
        doc.font('Helvetica').text(ticket.booking_id, 180, y)
        doc.font('Helvetica-Bold').text('Bus Name:', 50, y + gap)
        doc.font('Helvetica').text(ticket.bus_name, 180, y + gap)
        doc.font('Helvetica-Bold').text('Class type:', 50, y + gap * 3)
        doc.font('Helvetica').text(ticket.class_type, 180, y + gap * 3)
        doc.font('Helvetica-Bold').text('From:', 50, y + gap * 4)
        doc.font('Helvetica').text(ticket.from_station, 180, y + gap * 4)
        doc.font('Helvetica-Bold').text('To:', 50, y + gap * 5)
        doc.font('Helvetica').text(ticket.to_station, 180, y + gap * 5)
        doc.font('Helvetica-Bold').text('Passengers:', 50, y + gap * 6)

        doc.font('Helvetica').text(String(ticket?.passengers || "N/A"), 180, y + gap * 6)
        doc.font('Helvetica-Bold').text('Amount:', 50, y + gap * 7)
        doc.font('Helvetica').text(`₹${ticket.amount}`, 180, y + gap * 7)
        doc.font('Helvetica-Bold').text('Status:', 50, y + gap * 8)
        doc.fillColor('green').text(ticket.booking_status, 180, y + gap * 8)
        // FOOTER
        doc.fillColor('#666666').fontSize(10).text('Generated by Bus Reservation System', 50, 760,
            {
                align: 'center',
                width: 500
            }
        )
        doc.end()
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'PDF generation failed'
        })
    }
}

// Flight conditon setup
// Flight
const searchFlight = async (req, res) => {
    try {
        const { from, to, passengers, departureDate } = req.body;
        if (!from || !to || !passengers || !departureDate) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // DEMO HOTEL LIST
        const flights = [
            {
                id: 1,
                airline: 'IndiGo Airlines',
                departure: '08:45 AM',
                arrival: '11:20 AM',
                duration: '2h 35m',
                price: 4899,
                rating: 4.7
            },
            {
                id: 2,
                airline: 'Air India',
                departure: '01:15 PM',
                arrival: '04:00 PM',
                duration: '2h 45m',
                price: 5699,
                rating: 4.8
            },
            {
                id: 3,
                airline: 'Vistara',
                departure: '06:30 PM',
                arrival: '09:05 PM',
                duration: '2h 35m',
                price: 6299,
                rating: 4.9
            }
        ];

        return res.status(200).json({
            status: true,
            flights
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Flights search failed'
        })
    }
}

// BOOK Bus
const bookFlight = async (req, res) => {
    try {
        const { from, to, departureDate, passengers, classType, selectedFlight, departure, arrival, duration, amount, mpin } = req.body;
        const user_id = req.user._id

        // VALIDATION
        if (!from || !to || !departureDate || !selectedFlight || !amount || !mpin) {
            return res.status(400).json({
                status: false,
                message: 'All fields required'
            })
        }

        // FIND USER
        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            })
        }

        // CHECK MPIN
        if (!user.mpin) {
            return res.status(400).json({
                status: false,
                message: 'Please setup MPIN first'
            })
        }

        const isMpinCorrect = await bcrypt.compare(mpin.toString(), user.mpin)
        if (!isMpinCorrect) {
            return res.status(401).json({
                status: false,
                message: 'Incorrect MPIN'
            })
        }

        // CHECK BALANCE
        if (Number(user.balance) < Number(amount)) {
            return res.status(400).json({
                status: false,
                message: 'Insufficient wallet balance'
            })
        }

        // CREATE BOOKING ID
        const booking_id = 'HTL' + Date.now()

        // SAVE BOOKING
        const booking = new TravelBooking({
            user_id,
            booking_id,
            from_station: from,
            to_station: to,
            journey_date: departureDate,
            departure: '06:30 AM',
            arrival: '02:10 PM',
            duration: '7h 40m',
            class_type: classType,
            travel_type: 'Airplane',
            passengers,
            amount
        })

        await booking.save()
        // DEDUCT BALANCE
        user.balance = Number(user.balance) - Number(amount)
        await user.save()
        // RESPONSE
        return res.status(200).json({
            status: true,
            message: 'Flight booked successfully',
            ticket: booking,
            balance: user.balance
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Flight booking failed'
        })
    }
}

// RECENT BOOKINGS
const FlightBookings = async (req, res) => {
    try {
        const user_id = req.params.user_id
        const bookings = await TravelBooking.find({ user_id })
            .sort({
                createdAt: -1
            })
            .limit(10)

        return res.status(200).json({
            status: true,
            bookings
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch bookings'
        })
    }
}

// DOWNLOAD Bus PDF
const downloadTicketFlight = async (req, res) => {
    try {
        const booking_id = req.params.booking_id
        const ticket = await TravelBooking.findOne({ booking_id })
        if (!ticket) {
            return res.status(404).json({
                status: false,
                message: 'Booking not found'
            })
        }

        // PDF HEADERS
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${booking_id}.pdf`)
        // CREATE PDF
        const doc = new PDFDocument({ size: 'A4', margin: 40 })
        doc.pipe(res)
        // HEADER
        doc.rect(0, 0, 595, 100).fill('#be185d')
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('Flight BOOKING', 40, 30)
        doc.fontSize(12).font('Helvetica').text('Reservation Confirmation', 40, 65)
        doc.fillColor('black')
        // BOX
        doc.roundedRect(30, 120, 535, 580, 10).stroke('#cccccc')
        // TITLE
        doc.fontSize(18).fillColor('#be185d').font('Helvetica-Bold').text('Booking Details', 50, 145)
        doc.fillColor('black')

        // DETAILS
        let y = 200
        const gap = 35

        doc.fontSize(12).font('Helvetica-Bold').text('Booking ID:', 50, y)
        doc.font('Helvetica').text(ticket.booking_id, 180, y)
        doc.font('Helvetica-Bold').text('Bus Name:', 50, y + gap)
        doc.font('Helvetica').text(ticket.bus_name, 180, y + gap)
        doc.font('Helvetica-Bold').text('Class type:', 50, y + gap * 3)
        doc.font('Helvetica').text(ticket.class_type, 180, y + gap * 3)
        doc.font('Helvetica-Bold').text('From:', 50, y + gap * 4)
        doc.font('Helvetica').text(ticket.from_station, 180, y + gap * 4)
        doc.font('Helvetica-Bold').text('To:', 50, y + gap * 5)
        doc.font('Helvetica').text(ticket.to_station, 180, y + gap * 5)
        doc.font('Helvetica-Bold').text('Passengers:', 50, y + gap * 6)

        doc.font('Helvetica').text(String(ticket?.passengers || "N/A"), 180, y + gap * 6)
        doc.font('Helvetica-Bold').text('Amount:', 50, y + gap * 7)
        doc.font('Helvetica').text(`₹${ticket.amount}`, 180, y + gap * 7)
        doc.font('Helvetica-Bold').text('Status:', 50, y + gap * 8)
        doc.fillColor('green').text(ticket.booking_status, 180, y + gap * 8)
        // FOOTER
        doc.fillColor('#666666').fontSize(10).text('Generated by Bus Reservation System', 50, 760,
            {
                align: 'center',
                width: 500
            }
        )
        doc.end()
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: 'PDF generation failed'
        })
    }
}

module.exports = {
    searchTrain, bookTrain, recentBookings,
    downloadTicket, searchHotel, bookHotel,
    hotelBookings, downloadTicketHotel, searchBus,
    bookBus, BusBookings, downloadTicketBus, searchFlight,
    bookFlight, FlightBookings, downloadTicketFlight
};