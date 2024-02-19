const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const data = require('../db/data/test-data');
const apiEndpoints = require('../endpoints.json');
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
    test('GET: 200 responds with an array of objects describing all the available endpoints on the api', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body: { apiDocs } }) => {
            expect(apiDocs).toEqual(apiEndpoints);
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

describe('/api/articles', () => {
    test(`GET:200 responds with an array of article objects which should include a 'comments' count and be sorted by date in descending order by default`, () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            articles.forEach((article) => {
                expect(typeof article.author).toBe('string');
                expect(typeof article.title).toBe('string');
                expect(typeof article.article_id).toBe('number');
                expect(typeof article.topic).toBe('string');
                expect(typeof article.created_at).toBe('string');
                expect(typeof article.votes).toBe('number');
                expect(typeof article.article_img_url).toBe('string');
                expect(typeof article.comment_count).toBe('string');
            })
            expect(articles).toBeSortedBy('created_at', { descending: true, coerce: true });
        });
    });
    test('GET:200 responds with an array of article objects which should include a comment count and be sorted and ordered by queries', () => {
        return request(app)
        .get('/api/articles?sort_by=title&order=desc')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy('title', { descending: true });
        })
    });
    test('GET:400 responds with an appropriate status code and error message when given an invalid ordering query', () => {
        return request(app)
        .get('/api/articles?order=anythingElse')
        .expect(400)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request.");
        });
    });
    test('GET:400 responds with an appropriate status code and error message when given an invalid sorting query', () => {
        return request(app)
        .get('/api/articles?sort_by=anythingElse')
        .expect(400)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request.");
        });
    });
});