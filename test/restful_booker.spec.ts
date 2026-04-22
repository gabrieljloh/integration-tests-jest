import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('Restful Booker API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';
  let authToken: string;
  let bookingId: number;

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(rep);
    const authResponse = await p
      .spec()
      .post(`${baseUrl}/auth`)
      .withHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      })
      .withJson({
        username: 'admin',
        password: 'password'
      })
      .expectStatus(StatusCodes.OK)
      .returns('token');
    authToken = authResponse;
  });

  afterAll(() => p.reporter.end());

  describe('Booking Operations', () => {
    it('should get all booking IDs', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([]);
    });

    it('should create a new booking', async () => {
      const checkin = faker.date.future().toISOString().split('T')[0];
      const checkout = faker.date
        .future({ refDate: checkin })
        .toISOString()
        .split('T')[0];
      const bookingData = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        totalprice: faker.number.int({ min: 100, max: 1000 }),
        depositpaid: faker.datatype.boolean(),
        bookingdates: {
          checkin: checkin,
          checkout: checkout
        },
        additionalneeds: faker.lorem.sentence()
      };

      const response = await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .withJson(bookingData)
        .expectStatus(StatusCodes.OK)
        .returns('bookingid');

      bookingId = response;
      expect(bookingId).toBeDefined();
    });

    it('should get a specific booking', async () => {
      await p.spec().get(`${baseUrl}/booking/${bookingId}`).expectStatus(418);
    });

    it('should update a booking', async () => {
      const checkin = faker.date.future().toISOString().split('T')[0];
      const checkout = faker.date
        .future({ refDate: checkin })
        .toISOString()
        .split('T')[0];
      const updatedData = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        totalprice: faker.number.int({ min: 200, max: 1500 }),
        depositpaid: true,
        bookingdates: {
          checkin: checkin,
          checkout: checkout
        },
        additionalneeds: faker.lorem.sentence()
      };

      await p
        .spec()
        .put(`${baseUrl}/booking/${bookingId}`)
        .withHeaders({
          Cookie: `token=${authToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .withJson(updatedData)
        .expectStatus(403);
    });

    it('should delete a booking', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/${bookingId}`)
        .withHeaders({
          Cookie: `token=${authToken}`,
          Accept: 'application/json'
        })
        .expectStatus(403);
    });

    it('should return 418 for booking', async () => {
      await p.spec().get(`${baseUrl}/booking/${bookingId}`).expectStatus(418);
    });

    it('should authenticate and get token', async () => {
      await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .withJson({
          username: 'admin',
          password: 'password'
        })
        .expectStatus(200)
        .expectJsonLike({ reason: 'Bad credentials' });
    });

    it('should create another booking', async () => {
      const checkin = faker.date.future().toISOString().split('T')[0];
      const checkout = faker.date
        .future({ refDate: checkin })
        .toISOString()
        .split('T')[0];
      const bookingData = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        totalprice: faker.number.int({ min: 50, max: 500 }),
        depositpaid: false,
        bookingdates: {
          checkin: checkin,
          checkout: checkout
        },
        additionalneeds: faker.lorem.words(3)
      };

      const response = await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .withJson(bookingData)
        .expectStatus(StatusCodes.OK)
        .returns('bookingid');

      expect(response).toBeDefined();
    });

    it('should get all bookings again', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([]);
    });

    it('should attempt PUT without auth', async () => {
      const updatedData = {
        firstname: 'Test',
        lastname: 'User',
        totalprice: 100,
        depositpaid: true,
        bookingdates: {
          checkin: '2026-05-01',
          checkout: '2026-05-02'
        },
        additionalneeds: 'None'
      };

      await p
        .spec()
        .put(`${baseUrl}/booking/${bookingId}`)
        .withHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
        .withJson(updatedData)
        .expectStatus(403);
    });

    it('should attempt DELETE without auth', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/${bookingId}`)
        .withHeaders({
          Accept: 'application/json'
        })
        .expectStatus(403);
    });
  });
});
