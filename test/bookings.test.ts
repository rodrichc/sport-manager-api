import request from 'supertest'
import { toZonedTime, format as formatTz } from 'date-fns-tz'
import { addDays, getDay, addMinutes } from "date-fns"
import app from '../src/server'
import { db as prisma } from '../src/config/db'
import { ComplexId, CourtId, UserId } from '../src/types'
import { generateJWT } from '../src/utils/jwt'



const TEST_TZ = "America/Argentina/Buenos_Aires";

const getNextMondayAt = (baseDate: Date, hour: number, minute = 0) => {
  const zonedNow = toZonedTime(baseDate, TEST_TZ);

  const currentDay = getDay(zonedNow);
  const daysUntilMonday = (1 + 7 - currentDay) % 7 || 7;

  const nextMonday = addDays(zonedNow, daysUntilMonday);
  nextMonday.setHours(hour, minute, 0, 0);

  return nextMonday
}

const TEST_START = getNextMondayAt(new Date(), 18)
const TEST_END = getNextMondayAt(new Date(), 19)
const TEST_DATE = formatTz(TEST_START, 'yyyy-MM-dd')

describe('Booking API Integration', () => {

    let userId: UserId
    let token: string
    let ownerId: UserId
    let complexId: ComplexId
    let courtId: CourtId

    beforeAll(async () => {
        await prisma.booking.deleteMany()
        await prisma.court.deleteMany()
        await prisma.complexSchedule.deleteMany()
        await prisma.complex.deleteMany()
        await prisma.user.deleteMany()

        const user = await prisma.user.create({
            data: {
                email: "test@test.com",
                username: "testuser",
                name: "Test User",
                password: "hashedpassword", 
                role: "USER", 
                phoneNumber: "123456789"
            }
        })

        userId = user.id
        token = generateJWT({id: userId})

        const owner = await prisma.user.create({
            data: {
                email: "owner@test.com",
                username: "testowner",
                name: "Test Owner",
                password: "hashedpassword", 
                role: "OWNER", 
                phoneNumber: "123456789"
            }
        })

        ownerId = owner.id

        const complex = await prisma.complex.create({
            data: {
                name: "Complex Test",
                address: "Test Direction",
                ownerId: ownerId
            }
        })

        complexId = complex.id

        await prisma.complexSchedule.create({
            data: {
                complexId: complexId,
                dayOfWeek: 1,
                startTime: '12:00',
                endTime: '23:00'
            }
        })


        const court = await prisma.court.create({
            data: {
                name: "Court Test",
                complexId: complexId,
                price: 2000, 
                sport: "PADEL"
            }
        })

        courtId = court.id
    })

    
    afterAll(async () => {
        await prisma.$disconnect()
    })


    it('POST /bookings - Should create a new booking successfully (201)', async () => {

        const response = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                courtId: courtId,
                startTime: TEST_START,
                endTime: TEST_END,
            })
        

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data.status).toBe('CONFIRMED')

        
        const bookingInDb = await prisma.booking.findUnique({
            where: { id: response.body.data.id }
        });
        expect(bookingInDb).toBeTruthy()
    })

    
    it('POST /bookings - Should reject overlapping bookings (400/409)', async () => {
        const response = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                courtId: courtId,
                startTime: TEST_START,
                endTime: TEST_END,
            });


        expect([400, 409]).toContain(response.status)
        expect(response.body.status).toEqual('error')
    })

    
    it('GET /bookings/availability - Should mark the booked slot as occupied', async () => {
        const response = await request(app)
            .get('/api/v1/bookings/availability')
            .query({ courtId: courtId, date: TEST_DATE })
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200)
        

        const bookedSlot = response.body.find((slot: any) => 
            new Date(slot.start).getTime() === new Date(TEST_START).getTime()
        )

        expect(bookedSlot).toBeDefined()
        expect(bookedSlot.available).toBe(false)
        expect(bookedSlot.status).toBe('BOOKED')
    })


    it('POST /bookings - Should reject invalid booking duration (ex. 45 min)', async () => {

        const badEnd = addMinutes(new Date(TEST_START), 45).toISOString();

        const response = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                courtId: courtId,
                startTime: TEST_START,
                endTime: badEnd,
            });

        expect(response.status).toBe(400);
    })


    it('POST /bookings - Should return 400 if required fields are missing', async () => {
    const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
            // Missing courtId
            startTime: TEST_START,
            endTime: TEST_END,
        });

    expect(response.status).toBe(400); 
})
})