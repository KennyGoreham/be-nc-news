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

describe('/api', () => {
    test('GET: 200 responds with an object describing all the available endpoints on the api', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body: { apiDocs } }) => {
            for (const endpoint in apiDocs) {
                expect(apiDocs[endpoint]).toHaveProperty('description');
                expect(typeof apiDocs[endpoint].description).toBe('string');
                expect(apiDocs[endpoint]).toHaveProperty('queries');
                expect(Array.isArray(apiDocs[endpoint].queries)).toBe(true);
                expect(apiDocs[endpoint]).toHaveProperty('exampleBody');
                expect(typeof apiDocs[endpoint].exampleBody).toBe('object');
                expect(apiDocs[endpoint]).toHaveProperty('exampleResponse');
                expect(typeof apiDocs[endpoint].exampleResponse).toBe('object');
            }
        });
    });
});

describe('/api/articles/:article_id', () => {
    test('GET:200 responds with an article object where article_id matches given parameterised endpoint', () => {
        return request(app)
        .get('/api/articles/5')
        .expect(200)
        .then(({ body: { article } }) => {
            expect(article).toEqual({
                article_id: 5,
                title: "UNCOVERED: catspiracy to bring down democracy",
                topic: "cats",
                author: "rogersop",
                body: "Bastet walks amongst us, and the cats are taking arms!",
                votes: 0,
                created_at: '2020-08-03T13:14:00.000Z',
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              });
        });
    });
    test('GET:404 responds with an appropriate status code and error message when given a valid but non-existent id', () => {
        return request(app)
        .get('/api/articles/9999')
        .expect(404)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Resource not found.");
        });
    });
    test('GET:400 responds with an appropriate status code and error message when given an invalid id', () => {
        return request(app)
        .get('/api/articles/notAnId')
        .expect(400)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request.");
        })
    });
});