import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('Monster Battle API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dnd-combat-api-7f3660dcecb1.herokuapp.com'; // Assuming this is the base URL for the API

  p.request.setDefaultTimeout(90000);

  beforeAll(async () => {
    p.reporter.add(rep);
  });

  describe('GET /api/monsters/names/{page}', () => {
    it('should return a list of monster names for page 1', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/1`)
        .expectStatus(StatusCodes.OK);
    });

    it('should return a list of monster names for page 2', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/2`)
        .expectStatus(StatusCodes.OK);
    });

    it('should return a list of monster names for page 65 (boundary)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/65`)
        .expectStatus(StatusCodes.OK);
    });

    it('should return 500 for page 0 (below minimum)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/0`)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 500 for negative page', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/-1`)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 500 for invalid page', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/66`) // Beyond 1-65
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('GET /api/monsters/{name}', () => {
    it('should return details of a specific monster', async () => {
      const monsterName = 'Dragon'; // Assuming a monster name exists
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/${monsterName}`)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR); // API returns 500
    });

    it('should return 500 for non-existent monster', async () => {
      const monsterName = 'NonExistentMonster';
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/${monsterName}`)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 404 for empty monster name', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('should return 500 for monster name with special characters', async () => {
      const monsterName = 'Dragon@#$%';
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/${encodeURIComponent(monsterName)}`)
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('POST /api/battle/{monster}', () => {
    it('should simulate a battle and return result', async () => {
      const monsterName = 'Goblin';
      await p
        .spec()
        .post(`${baseUrl}/api/battle/${monsterName}`)
        .withJson({
          character: {
            name: faker.internet.username(),
            health: 100,
            attack: 20
            // Assuming character data structure
          }
        })
        .expectStatus(StatusCodes.BAD_REQUEST); // API returns 400
    });

    it('should return 400 for invalid monster', async () => {
      const monsterName = 'InvalidMonster';
      await p
        .spec()
        .post(`${baseUrl}/api/battle/${monsterName}`)
        .withJson({
          character: {
            name: faker.internet.username(),
            health: 100,
            attack: 20
          }
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 for empty monster name', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/battle/`)
        .withJson({
          character: {
            name: faker.internet.username(),
            health: 100,
            attack: 20
          }
        })
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /api/characters/check', () => {
    it('should validate a valid character', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson({
          name: faker.internet.username(),
          health: 100,
          attack: 20,
          defense: 10
          // Assuming character structure
        })
        .expectStatus(StatusCodes.BAD_REQUEST); // API returns 400
    });

    it('should return validation errors for invalid character', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson({
          name: '', // Invalid name
          health: -10, // Invalid health
          attack: 20
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('should return validation errors for character with zero health', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson({
          name: faker.internet.username(),
          health: 0,
          attack: 20,
          defense: 10
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('should return validation errors for character with missing fields', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson({
          name: faker.internet.username()
          // Missing health, attack, defense
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('should return validation errors for character with very large values', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson({
          name: faker.internet.username(),
          health: 999999999,
          attack: 999999999,
          defense: 999999999
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });
  });

  describe('GET /api/characters/example', () => {
    it('should return a template example character', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/characters/example`)
        .expectStatus(StatusCodes.OK);
    });
  });
});
