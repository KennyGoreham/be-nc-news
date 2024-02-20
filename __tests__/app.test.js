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
    test('GET:200 responds with an array of objects describing all the available endpoints on the api', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body: { apiDocs } }) => {
            expect(apiDocs).toEqual(apiEndpoints);
        });
    });
});

describe('/api/articles/:article_id', () => {
    describe('GET', () => {
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
            });
        });
    });
    describe('PATCH', () => {
        test('PATCH:200 updates an existing article by parameterised article_id', () => {
            const update = {
                inc_votes: 2
            };
    
            return request(app)
            .patch('/api/articles/5')
            .expect(200)
            .send(update)
            .then(({ body: { article } }) => {
                expect(article).toEqual({
                    article_id: 5,
                    title: "UNCOVERED: catspiracy to bring down democracy",
                    topic: "cats",
                    author: "rogersop",
                    body: "Bastet walks amongst us, and the cats are taking arms!",
                    votes: 2,
                    created_at: '2020-08-03T13:14:00.000Z',
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                });
            });
        });
        test('PATCH:400 responds with an appropriate status code and error message when provided with a malformed body', () => {
            return request(app)
            .patch('/api/articles/5')
            .expect(400)
            .send({})
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
        test('PATCH:400 responds with an appropriate status code and error message when attempting to update database with an incorrect type ', () => {
            return request(app)
            .patch('/api/articles/5')
            .expect(400)
            .send({
                inc_votes: 'hello'
            })
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
        test('PATCH:400 responds with an appropriate status code and error message when attempting to update a non-existent article', () => {
            return request(app)
            .patch('/api/articles/99999')
            .expect(400)
            .send({
                inc_votes: 5
            })
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
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
            });
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
        });
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

describe('/api/articles/:article_id/comments', () => {
    describe('GET', () => {
        test(`GET:200 responds with an array of comments pertaining to a parameterised article_id, ordering by most recent ('created_at') first ('desc')`, () => {
            return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments.length).toBe(11);
                comments.forEach((comment) => {
                    expect(typeof comment.comment_id).toBe('number');
                    expect(typeof comment.votes).toBe('number');
                    expect(typeof comment.created_at).toBe('string');
                    expect(typeof comment.author).toBe('string');
                    expect(typeof comment.body).toBe('string');
                    expect(typeof comment.article_id).toBe('number');
                    expect(comment.article_id).toBe(1);
                });
                expect(comments).toBeSortedBy('created_at', { descending: true });
            });
        });
        test('GET:404 responds with an appropriate status code and error message when given a valid but non-existent id', () => {
            return request(app)
            .get('/api/articles/99999/comments')
            .expect(404)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Resource not found.");
            });
        });
        test('GET:400 responds with an appropriate status code and error message when given an invalid id', () => {
            return request(app)
            .get('/api/articles/notAnId/comments')
            .expect(400)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
        test('GET:200 responds with an appropriate status code when given an id that has no comments', () => {
            return request(app)
            .get('/api/articles/13/comments')
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments).toEqual([]);
            })
        }); 
    });
    describe('POST', () => {
        test('POST:201 adds a comment for an article using parameterised article_id', () => {
            const newComment = { 
                username: 'icellusedkars',
                body: 'cant stop, wont stop'
            };

            return request(app)
            .post('/api/articles/2/comments')
            .expect(201)
            .send(newComment)
            .then(({ body: { comment } }) => {
                expect(comment).toEqual({
                    comment_id: 19,
                    body: 'cant stop, wont stop',
                    article_id: 2,
                    author: 'icellusedkars',
                    votes: 0,
                    created_at: comment.created_at
                });
                expect(Object.keys(comment).length).toBe(6);
                expect(typeof comment.comment_id).toBe('number');
                expect(typeof comment.body).toBe('string');
                expect(typeof comment.article_id).toBe('number');
                expect(typeof comment.author).toBe('string');
                expect(typeof comment.votes).toBe('number');
                expect(typeof comment.created_at).toBe('string');
            });
        });
        test('POST:400 responds with an appropriate status code and error message when provided with a malformed request body', () => {
            const newComment1 = {
                username: 'whatever'
            };

            return request(app)
            .post('/api/articles/2/comments')
            .expect(400)
            .send(newComment1)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            })
            .then(() => {

                return request(app)
                .post('/api/articles/2/comments')
                .expect(400)
                .send({})
                .then(({ body: { msg } }) => {
                    expect(msg).toBe("Bad request.");
                });
            });
        });
        test('POST:400 responds with an appropriate status code and error message when provided with a request body that fails schema validation', () => {
            const newComment = {
                username: 5,
                body: ''
            };

            return request(app)
            .post('/api/articles/2/comments')
            .expect(400)
            .send(newComment)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
        test('POST:400 responds with an appropriate status code and error message when provided with an invalid id', () => {
            const newComment = {
                username: 'icellusedkars',
                body: 'cant stop, wont stop'
            };

            return request(app)
            .post('/api/articles/notAnId/comments')
            .expect(400)
            .send(newComment)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
    });
});
