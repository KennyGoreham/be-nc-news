const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data');
const request = require('supertest');

beforeEach(() => seed(data));

afterAll(() => db.end());

describe('/api/topics', () => {
    test('GET:200 responds with an array of topic objects', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body: { topics } }) => {
            expect(topics.length).toBe(3);
            topics.forEach((topic) => {
                expect(typeof topic.description).toBe('string');
                expect(typeof topic.slug).toBe('string');
            });
        });
    });
    test('GET:404 responds with an appropriate status code and error message when attempting to access an endpoint which does not exist', () => {
        return request(app)
        .get('/api/topicsd')
        .expect(404)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Path not found.");
        })
    });
});

describe('/*', () => {
    test('404: responds with an appropriate status code and error message when attempting to access an endpoint which does not exist', () => {
        return request(app)
        .get('/notARoute')
        .expect(404)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Path not found.");
        })
    });
});