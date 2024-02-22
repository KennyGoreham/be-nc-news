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
                expect(topic).toEqual(expect.objectContaining({
                    description: expect.any(String),
                    slug: expect.any(String)
                }));
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
                expect(article).toEqual(expect.objectContaining({
                    article_id: 5,
                    title: "UNCOVERED: catspiracy to bring down democracy",
                    topic: "cats",
                    author: "rogersop",
                    body: "Bastet walks amongst us, and the cats are taking arms!",
                    votes: 0,
                    created_at: '2020-08-03T13:14:00.000Z',
                    article_img_url:
                      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                  }));
            });
        });
        test(`GET:200 responds with an article object, that includes a 'comment_count' key, where article_id matches given parameterised endpoint`, () => {
            return request(app)
            .get('/api/articles/5')
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toEqual(expect.objectContaining({
                    article_id: 5,
                    title: "UNCOVERED: catspiracy to bring down democracy",
                    topic: "cats",
                    author: "rogersop",
                    body: "Bastet walks amongst us, and the cats are taking arms!",
                    votes: 0,
                    created_at: '2020-08-03T13:14:00.000Z',
                    article_img_url:
                      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    comment_count: 2
                }));
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
        test('PATCH:400 responds with an appropriate status code and error message when attempting to update an invalid article_id type', () => {
            return request(app)
            .patch('/api/articles/notAnId')
            .expect(400)
            .send({
                inc_votes: 5
            })
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
        test('PATCH:404 responds with an appropriate status code and error message when attempting to update a valid but non-existent article', () => {
            return request(app)
            .patch('/api/articles/99999')
            .expect(404)
            .send({
                inc_votes: 5
            })
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Resource not found.");
            });
        });
    });
});

describe('/api/articles', () => {
    test(`GET:200 responds with an array of article objects which should include a 'comment_count' key but not a 'body' key, and be sorted by 'created_at' in descending order by default`, () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            articles.forEach((article) => {
                expect(article).toEqual(expect.objectContaining({
                    author: expect.any(String),
                    title: expect.any(String),
                    article_id: expect.any(Number),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(Number)
                }));
                expect(article).toEqual(expect.not.objectContaining({
                    body: expect.any(String)
                }));
            });
            expect(articles).toBeSortedBy('created_at', { descending: true });
        });
    });
    test('GET:200 responds with an array of article objects filtered by a topic query', () => {
        return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles.length).toBe(12);
            articles.forEach((article) => {
                expect(article).toEqual(expect.objectContaining({
                    title: expect.any(String),
                    topic: 'mitch',
                    article_id: expect.any(Number),
                    author: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(Number)
                }));
            });
        });
    });
    test('GET:200 responds with an empty array when given a topic query that exists in the database but has no relation to any article', () => {
        return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles).toEqual([]);
        })
    });
    test('GET:200 responds with an array of objects sorted by given query provided it is a valid column', () => {
        return request(app)
        .get('/api/articles?sort_by=title')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy('title', { descending: true });
        })
        .then(() => {
            return request(app)
            .get('/api/articles?sort_by=votes')
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles.length).toBe(13);
                expect(articles).toBeSortedBy('votes', { descending: true });
            });
        });
    });
    test('GET:200 responds with an array of objects ordered by given query provided it is a valid order', () => {
        return request(app)
        .get('/api/articles?order=asc')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy('created_at');
        });
    });
    test('GET:200 responds with an array of objects ordered, sorted and only of a given topic when provided all valid queries', () => {
        return request(app)
        .get('/api/articles?topic=mitch&sort_by=comment_count&order=asc')
        .expect(200)
        .then(({ body: { articles } }) => {
            expect(articles.length).toBe(12);
            expect(articles).toBeSortedBy('comment_count');
            articles.forEach((article) => {
                expect(article).toEqual(expect.objectContaining({
                    topic: 'mitch'
                }));
            });
        });
    });
    test('GET:400 responds with an appropriate status code and error message when attempting a sort_by query that is not a valid column', () => {
        return request(app)
        .get('/api/articles?topic=mitch&sort_by=whatever&order=asc')
        .expect(400)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request.");
        });
    });
    test('GET:400 responds with an appropriate status code and error message when attempting an invalid ordering query', () => {
        return request(app)
        .get('/api/articles?topic=paper&sort_by=author&order=anything')
        .expect(400)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request.");
        });
    });
    test('GET:404 responds with an appropriate status code and error message when attempting to query by a topic which does not exist', () => {
        return request(app)
        .get('/api/articles?topic=dogs')
        .expect(404)
        .then(({ body: { msg } }) => {
            expect(msg).toBe("Resource not found.");
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
                    expect(comment).toEqual(expect.objectContaining({
                        comment_id: expect.any(Number),
                        body: expect.any(String),
                        article_id: 1,
                        author: expect.any(String),
                        votes: expect.any(Number),
                        created_at: expect.any(String)
                    }));
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
                expect(comment).toEqual(expect.objectContaining({
                    comment_id: 19,
                    body: 'cant stop, wont stop',
                    article_id: 2,
                    author: 'icellusedkars',
                    votes: 0,
                    created_at: expect.any(String)
                }));
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
        test('POST:400 responds with an appropriate status code and error message when provided with an invalid id type', () => {
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
        test('POST:404 responds with an appropriate status code and error message when provided with a valid but non-existent id', () => {
            const newComment = {
                username: 'icellusedkars',
                body: 'cant stop, wont stop'
            };

            return request(app)
            .post('/api/articles/99999/comments')
            .expect(404)
            .send(newComment)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Resource not found.");
            });
        });
        test('POST:404 responds with an appropriate status code and error message when provided with a username that does not exist', () => {
            const newComment = {
                username: 'notAUsername',
                body: 'a legitimate comment'
            };

            return request(app)
            .post('/api/articles/2/comments')
            .expect(404)
            .send(newComment)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Resource not found.");
            })
        });
    });
});

describe('/api/comments/:comments_id', () => {
    describe('DELETE', () => {
        test('DELETE:204 should delete a comment using given parameterised comment_id', () => {

            return request(app)
            .delete(`/api/comments/1`)
            .expect(204)
            .then(({ body }) => {
                expect(body).toEqual({});
                return db.query(`SELECT * FROM comments;`)
            })
            .then(({ rows, rowCount }) => {
                expect(rowCount).toBe(17);
                rows.forEach((row) => {
                    expect(row.comment_id).not.toBe(1);
                });
            });
        });
        test('DELETE:404 responds with an appropriate status code and error message when attempting to delete a comment that does not exist', () => {
            return request(app)
            .delete('/api/comments/99999')
            .expect(404)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Resource not found.");
            });
        });
        test('DELETE:400 responds with an appropriate status code and error message when provided an invalid id', () => {
            return request(app)
            .delete('/api/comments/notAnId')
            .expect(400)
            .then(({ body: { msg } }) => {
                expect(msg).toBe("Bad request.");
            });
        });
    });
});

describe('/api/users', () => {
    describe('GET', () => {
        test('GET:200 responds with an array of user objects, each with a "username", "name" and "avatar_url" property', () => {
            return request(app)
            .get('/api/users')
            .expect(200)
            .then(({ body: { users } }) => {
                expect(users.length).toBe(4);
                users.forEach((user) => {
                    expect(user).toEqual(expect.objectContaining({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    }));
                });
            });
        });
    });
});