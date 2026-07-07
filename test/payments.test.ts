import request from 'supertest'
import app from '../src/server'
import { db as prisma } from '../src/config/db'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

// Mock mercadopago
jest.mock('mercadopago', () => {
    return {
        MercadoPagoConfig: jest.fn(),
        Preference: class {
            create = jest.fn().mockResolvedValue({
                id: 'mock_pref_id',
                init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_pref_id'
            })
        },
        Payment: class {
            get = jest.fn().mockImplementation(async ({ id }) => {
                if (id === 'approved_id') {
                    return {
                        status: 'approved',
                        metadata: { booking_id: '9999' },
                        payment_method_id: 'visa',
                        status_detail: 'accredited'
                    }
                } else if (id === 'rejected_id') {
                    return {
                        status: 'rejected',
                        metadata: { booking_id: '9999' },
                        payment_method_id: 'visa',
                        status_detail: 'cc_rejected_other_reason'
                    }
                }
                return null;
            })
        }
    }
})

describe('Payments API Integration', () => {
    beforeAll(async () => {
        // Clean up before tests
        await prisma.payment.deleteMany()
        await prisma.booking.deleteMany()
        await prisma.court.deleteMany()
        await prisma.complex.deleteMany()
        await prisma.user.deleteMany()
        
        // Setup initial data needed for webhook test
        const user = await prisma.user.create({
            data: {
                email: "payer@test.com",
                username: "payeruser",
                name: "Payer User",
                password: "hashedpassword", 
                role: "USER", 
                phoneNumber: "123456789"
            }
        })

        const complex = await prisma.complex.create({
            data: {
                name: "Payments Complex",
                address: "Payments Dir",
                ownerId: user.id
            }
        })

        const court = await prisma.court.create({
            data: {
                name: "Payments Court",
                complexId: complex.id,
                price: 2000, 
                sport: "PADEL"
            }
        })

        await prisma.booking.create({
            data: {
                id: 9999, // We use this ID in our mock
                userId: user.id,
                courtId: court.id,
                startTime: new Date('2026-10-10T10:00:00Z'),
                endTime: new Date('2026-10-10T11:00:00Z'),
                totalPrice: 2000,
                status: 'PENDING'
            }
        })

        await prisma.payment.create({
            data: {
                bookingId: 9999,
                amount: 2000,
                status: 'PENDING'
            }
        })
    })

    afterAll(async () => {
        await prisma.$disconnect()
    })

    it('POST /payments/webhook - Should process approved payment and update booking status to CONFIRMED', async () => {
        const response = await request(app)
            .post('/api/v1/payments/webhook')
            .query({ 'data.id': 'approved_id', type: 'payment' })

        expect(response.status).toBe(200)

        // Verify booking in DB
        const booking = await prisma.booking.findUnique({ where: { id: 9999 } })
        expect(booking?.status).toBe('CONFIRMED')

        // Verify payment in DB
        const payment = await prisma.payment.findFirst({ where: { bookingId: 9999 } })
        expect(payment?.status).toBe('APPROVED')
    })

    it('POST /payments/webhook - Should process rejected payment and update booking status to CANCELLED', async () => {
        // Reset DB states to pending
        await prisma.booking.update({
            where: { id: 9999 },
            data: { status: 'PENDING' }
        })
        await prisma.payment.updateMany({
            where: { bookingId: 9999 },
            data: { status: 'PENDING' }
        })

        const response = await request(app)
            .post('/api/v1/payments/webhook')
            .query({ 'data.id': 'rejected_id', type: 'payment' })

        expect(response.status).toBe(200)

        // Verify booking in DB
        const booking = await prisma.booking.findUnique({ where: { id: 9999 } })
        expect(booking?.status).toBe('CANCELLED')

        // Verify payment in DB
        const payment = await prisma.payment.findFirst({ where: { bookingId: 9999 } })
        expect(payment?.status).toBe('REJECTED')
    })
})
