const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const apiEndpoints = require("../endpoints.json");
const request = require("supertest");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("/api", () => {
  test("GET:200 responds with an array of objects describing all the available endpoints on the api", () => {

    return request(app)
      .get("/api")
      .expect(200)
      .then(({body: {endpoints}}) => {
        expect(endpoints).toEqual(apiEndpoints);
      });
  });
});

describe("/*", () => {
  test("404: responds with an appropriate status code and error message when attempting to access an endpoint which does not exist", () => {

    return request(app)
      .get("/notARoute")
      .expect(404)
      .then(({body: {msg}}) => {
        expect(msg).toBe("Path not found.");
      });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("GET:200 responds with an array of article objects which should include a 'comment_count' key but not a 'body' key, and be sorted by 'created_at' in descending order by default", () => {

      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({body: {articles}}) => {

          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {

            expect(article).toEqual(expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            }));

            expect(article).toEqual(expect.not.objectContaining({
              body: expect.any(String),
            }));
          });
          expect(articles).toBeSortedBy("created_at", {descending: true});
        });
    });
    test("GET:200 responds with an array of article objects filtered by a topic query", () => {

      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({body: {articles}}) => {

          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {

            expect(article).toEqual(expect.objectContaining({
              title: expect.any(String),
              topic: "mitch",
              article_id: expect.any(Number),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            }));
          });
        });
    });
    test("GET:200 responds with an empty array when given a topic query that exists in the database but has no relation to any article", () => {

      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({body: {articles}}) => {
          expect(articles).toEqual([]);
        });
    });
    test("GET:200 responds with an array of objects sorted by given query provided it is a valid column", () => {

      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({body: {articles}}) => {

          expect(articles.length).toBeGreaterThan(0);
          expect(articles).toBeSortedBy("title", {descending: true});
        })
        .then(() => {

          return request(app)
            .get("/api/articles?sort_by=votes")
            .expect(200);
        })
        .then(({body: {articles}}) => {

          expect(articles.length).toBeGreaterThan(0);
          expect(articles).toBeSortedBy("votes", {descending: true});
        });
    });
    test("GET:200 responds with an array of objects ordered by given query provided it is a valid order", () => {

      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({body: {articles}}) => {
          expect(articles).toBeSortedBy("created_at");
        });
    });
    test("GET:200 responds with an array of objects ordered, sorted and of a given topic when provided all valid queries", () => {

      return request(app)
        .get("/api/articles?topic=mitch&sort_by=comment_count&order=asc")
        .expect(200)
        .then(({body: {articles}}) => {

          expect(articles.length).toBeGreaterThan(0);
          expect(articles).toBeSortedBy("comment_count");
          articles.forEach((article) => {

            expect(article).toEqual(expect.objectContaining({
              topic: "mitch",
            }));
          });
        });
    });
    test("GET:200 responds with an array of article objects that are paginated according to 'limit' and 'p' queries and provides a 'total_pages' value", () => {

      return request(app)
        .get("/api/articles?limit=5&p=1")
        .expect(200)
        .then(({body: {articles, totalPages}}) => {

          expect(articles.length).toBe(5);
          expect(totalPages).toBe(3);
        });
    });
    test("GET:200 responds with an array of article objects that each have a 'total_count' property that counts up all the articles received with any filters applied but discounting limit and p queries", () => {

      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({body: {articles}}) => {

          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {
            expect(article.total_count).toBe(13);
          });
        })
        .then(() => {

          return request(app)
            .get("/api/articles?topic=mitch")
            .expect(200);
        })
        .then(({body: {articles}}) => {

          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {

            expect(article.total_count).toBe(12);
            expect(article.topic).toBe("mitch");
          });
        });
    });
    test("GET:200 responds with every article object in the table when using a limit query that is greater than the number of results", () => {

      return request(app)
        .get("/api/articles?limit=99999")
        .expect(200)
        .then(({body: {articles, totalPages}}) => {
          expect(articles[0].total_count).toBe(articles.length);
          expect(totalPages).toBe(1);
        });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting a sort_by query that is not a valid column", () => {

      return request(app)
        .get("/api/articles?topic=mitch&sort_by=whatever&order=asc")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting an invalid ordering query", () => {

      return request(app)
        .get("/api/articles?topic=paper&sort_by=author&order=anything")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting an invalid limit query", () => {

      return request(app)
        .get("/api/articles?limit=notANumber")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting an invalid page query", () => {

      return request(app)
        .get("/api/articles?p=notANumber")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:404 responds with an appropriate status code and error message when attempting to query a page that does not contain any results", () => {

      return request(app)
        .get("/api/articles?p=9999")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
    test("GET:404 responds with an appropriate status code and error message when attempting to query by a topic which does not exist", () => {

      return request(app)
        .get("/api/articles?topic=dogs")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
  describe("POST", () => {
    test("POST:201 responds with a newly created article object that includes the following valid key/value pairs: author, title, body, topic, article_img_url (that will default if not provided), article_id, votes, created_at, comment_count", () => {

      return request(app)
        .post("/api/articles")
        .expect(201)
        .send({
          author: "icellusedkars",
          title: "How to build a backend",
          body: "Sign up to a Northcoders bootcamp!",
          topic: "paper",
          article_img_url: "https://images.pexels.com/photos/965345/pexels-photo-965345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        })
        .then(({body: {article}}) => {

          expect(article).toEqual(expect.objectContaining({
            author: "icellusedkars",
            title: "How to build a backend",
            body: "Sign up to a Northcoders bootcamp!",
            topic: "paper",
            article_img_url: "https://images.pexels.com/photos/965345/pexels-photo-965345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            article_id: 14,
            created_at: expect.any(String),
            votes: 0,
            comment_count: 0,
          }));
        });
    });
    test("POST:201 responds with a newly created article object that has a default article_img_url value when given a request body that omits an article_img_url", () => {

      return request(app)
        .post("/api/articles")
        .expect(201)
        .send({
          author: "icellusedkars",
          title: "How to build a backend",
          body: "Sign up to a Northcoders bootcamp!",
          topic: "paper",
        })
        .then(({body: {article}}) => {

          expect(article).toEqual(expect.objectContaining({
            author: "icellusedkars",
            title: "How to build a backend",
            body: "Sign up to a Northcoders bootcamp!",
            topic: "paper",
            article_img_url: "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            article_id: 14,
            created_at: expect.any(String),
            votes: 0,
            comment_count: 0,
          }));
        });
    });
    test("POST:201 responds with a newly created article object when given a request body that includes excess information but at least the following valid key/value pairs: author, title, topic, body", () => {

      return request(app)
        .post("/api/articles")
        .expect(201)
        .send({
          randomKey: "randomValue",
          author: "icellusedkars",
          anotherRandomKey: "anotherRandomValue",
          title: "How to build a backend",
          yetAnotherRandomKey: 999,
          body: "Sign up to a Northcoders bootcamp!",
          topic: "paper",
        })
        .then(({body: {article}}) => {

          expect(article).toEqual(expect.objectContaining({
            author: "icellusedkars",
            title: "How to build a backend",
            body: "Sign up to a Northcoders bootcamp!",
            topic: "paper",
            article_img_url: "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            article_id: 14,
            created_at: expect.any(String),
            votes: 0,
            comment_count: 0,
          }));
        });
    });
    test("POST:400 responds with an appropriate status code and error message when given an empty body", () => {

      return request(app)
        .post("/api/articles")
        .expect(400)
        .send({})
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("POST:400 responds with an appropriate status code and error message when provided a body with missing fields", () => {

      return request(app)
        .post("/api/articles")
        .expect(400)
        .send({
          author: "icellusedkars",
          topic: "paper",
          body: "Another interesting body",
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET:200 responds with an article object where article_id matches given parameterised endpoint", () => {

      return request(app)
        .get("/api/articles/5")
        .expect(200)
        .then(({body: {article}}) => {

          expect(article).toEqual(expect.objectContaining({
            article_id: 5,
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            author: "rogersop",
            body: "Bastet walks amongst us, and the cats are taking arms!",
            votes: 0,
            created_at: expect.any(String),
            article_img_url:
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          }));
        });
    });
    test("GET:200 responds with an article object, that includes a 'comment_count' key, where article_id matches given parameterised endpoint", () => {

      return request(app)
        .get("/api/articles/5")
        .expect(200)
        .then(({body: {article}}) => {

          expect(article).toEqual(expect.objectContaining({
            article_id: 5,
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            author: "rogersop",
            body: "Bastet walks amongst us, and the cats are taking arms!",
            votes: 0,
            created_at: expect.any(String),
            article_img_url:
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 2,
          }));
        });
    });
    test("GET:400 responds with an appropriate status code and error message when given an invalid id", () => {

      return request(app)
        .get("/api/articles/notAnId")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:404 responds with an appropriate status code and error message when given a valid but non-existent id", () => {

      return request(app)
        .get("/api/articles/9999")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
  describe("PATCH", () => {
    test("PATCH:200 updates an existing article by parameterised article_id", () => {

      const update = {
        inc_votes: 2,
      };

      return request(app)
        .patch("/api/articles/5")
        .expect(200)
        .send(update)
        .then(({body: {article}}) => {

          expect(article).toEqual({
            article_id: 5,
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            author: "rogersop",
            body: "Bastet walks amongst us, and the cats are taking arms!",
            votes: 2,
            created_at: expect.any(String),
            article_img_url:
                      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("PATCH:400 responds with an appropriate status code and error message when provided with a malformed body", () => {

      return request(app)
        .patch("/api/articles/5")
        .expect(400)
        .send({})
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("PATCH:400 responds with an appropriate status code and error message when attempting to update database with an incorrect type ", () => {

      return request(app)
        .patch("/api/articles/5")
        .expect(400)
        .send({
          inc_votes: "hello",
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("PATCH:400 responds with an appropriate status code and error message when attempting to update an invalid article_id type", () => {

      return request(app)
        .patch("/api/articles/notAnId")
        .expect(400)
        .send({
          inc_votes: 5,
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("PATCH:404 responds with an appropriate status code and error message when attempting to update a valid but non-existent article", () => {

      return request(app)
        .patch("/api/articles/99999")
        .expect(404)
        .send({
          inc_votes: 5,
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
  describe("DELETE", () => {
    test("DELETE:204 removes an article that has no comments using given parameterised id", () => {

      return request(app)
        .delete("/api/articles/2")
        .expect(204)
        .then(({body}) => {

          expect(body).toEqual({});

          return db
            .query("SELECT * FROM articles;");
        })
        .then(({rows, rowCount}) => {

          expect(rowCount).toBeGreaterThan(0);
          rows.forEach((row) => {
            expect(row.article_id).not.toBe(2);
          });
        });
    });
    test("DELETE:204 removes an article and any comments it has using given parameterised id", () => {

      return request(app)
        .delete("/api/articles/1")
        .expect(204)
        .then(({body}) => {

          expect(body).toEqual({});

          return db
            .query("SELECT * FROM comments WHERE article_id=1");
        })
        .then(({rowCount}) => {

          expect(rowCount).toBe(0);

          return db
            .query("SELECT * FROM articles;");
        })
        .then(({rows, rowCount}) => {

          expect(rowCount).toBeGreaterThan(0);
          rows.forEach((row) => {
            expect(row.article_id).not.toBe(1);
          });
        });
    });
    test("DELETE:400 responds with an appropriate status code and error message when attempting to delete an article using an invalid id", () => {

      return request(app)
        .delete("/api/articles/notAnId")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("DELETE:404 responds with an appropriate status code and error message when attempting to delete an article that does not exist but the id in the endpoint is valid", () => {

      return request(app)
        .delete("/api/articles/99999")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("GET:200 responds with an array of comment objects pertaining to a parameterised article_id, ordering by most recent ('created_at') first ('desc')", () => {

      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({body: {comments}}) => {

          expect(comments.length).toBeGreaterThan(0);
          comments.forEach((comment) => {

            expect(comment).toEqual(expect.objectContaining({
              comment_id: expect.any(Number),
              body: expect.any(String),
              article_id: 1,
              author: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.any(String),
            }));
          });
          expect(comments).toBeSortedBy("created_at", {descending: true});
        });
    });
    test("GET:200 responds with an empty array when given an id that has no comments", () => {

      return request(app)
        .get("/api/articles/13/comments")
        .expect(200)
        .then(({body: {comments}}) => {
          expect(comments).toEqual([]);
        });
    });
    test("GET:200 responds with an object containing an array of comments pertaining to a parameterised article_id paginated by 'limit' and 'p' queries and a 'totalPages' key", () => {

      return request(app)
        .get("/api/articles/1/comments?limit=5&p=2")
        .expect(200)
        .then(({body: {comments, totalPages}}) => {

          expect(comments.length).toBe(5);
          expect(comments[0].comment_id).toBe(8);
          expect(totalPages).toBe(3);
        });
    });
    test("GET:200 responds with every comment object in the table that matches the article_id when given a limit query that is greater than the number of results in the database", () => {

      return request(app)
        .get("/api/articles/1/comments?limit=99999")
        .expect(200)
        .then(({body: {comments, totalPages}}) => {

          expect(comments.length).toBe(11);
          expect(totalPages).toBe(1);
        });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting an invalid limit query", () => {

      return request(app)
        .get("/api/articles/1/comments?limit=notANumber")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting an invalid page query", () => {

      return request(app)
        .get("/api/articles/1/comments?p=notANumber")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:400 responds with an appropriate status code and error message when given an invalid id", () => {

      return request(app)
        .get("/api/articles/notAnId/comments")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("GET:404 responds with an appropriate status code and error message when attempting to query a page that does not contain any results", () => {

      return request(app)
        .get("/api/articles/1/comments?limit=5&p=99999")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
    test("GET:404 responds with an appropriate status code and error message when given a valid but non-existent id", () => {

      return request(app)
        .get("/api/articles/99999/comments")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
  describe("POST", () => {
    test("POST:201 adds a comment for an article using parameterised article_id", () => {

      const newComment = {
        username: "icellusedkars",
        body: "cant stop, wont stop",
      };

      return request(app)
        .post("/api/articles/2/comments")
        .expect(201)
        .send(newComment)
        .then(({body: {comment}}) => {

          expect(comment).toEqual(expect.objectContaining({
            comment_id: 19,
            body: "cant stop, wont stop",
            article_id: 2,
            author: "icellusedkars",
            votes: 0,
            created_at: expect.any(String),
          }));
        });
    });
    test("POST:400 responds with an appropriate status code and error message when provided with a malformed request body", () => {

      const newComment1 = {
        username: "whatever",
      };

      return request(app)
        .post("/api/articles/2/comments")
        .expect(400)
        .send(newComment1)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        })
        .then(() => {

          return request(app)
            .post("/api/articles/2/comments")
            .expect(400)
            .send({})
            .then(({body: {msg}}) => {
              expect(msg).toBe("Bad request.");
            });
        });
    });
    test("POST:400 responds with an appropriate status code and error message when provided with an invalid id type", () => {

      const newComment = {
        username: "icellusedkars",
        body: "cant stop, wont stop",
      };

      return request(app)
        .post("/api/articles/notAnId/comments")
        .expect(400)
        .send(newComment)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("POST:404 responds with an appropriate status code and error message when provided with a valid but non-existent id", () => {

      const newComment = {
        username: "icellusedkars",
        body: "cant stop, wont stop",
      };

      return request(app)
        .post("/api/articles/99999/comments")
        .expect(404)
        .send(newComment)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
    test("POST:404 responds with an appropriate status code and error message when provided with a username that does not exist", () => {

      const newComment = {
        username: "notAUsername",
        body: "a legitimate comment",
      };

      return request(app)
        .post("/api/articles/2/comments")
        .expect(404)
        .send(newComment)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("PATCH", () => {
    test("PATCH:200 updates the votes on a comment using its comment_id and responds with the updated comment object", () => {

      return request(app)
        .patch("/api/comments/5")
        .expect(200)
        .send({inc_votes: 2})
        .then(({body: {comment}}) => {

          expect(comment).toEqual(expect.objectContaining({
            comment_id: 5,
            body: "I hate streaming noses",
            article_id: 1,
            author: "icellusedkars",
            votes: 2,
            created_at: "2020-11-03T21:00:00.000Z",
          }));
        });
    });
    test("PATCH:200 updates the votes on a comment using its comment_id if the request body contains excess information but at least votes to increment", () => {

      return request(app)
        .patch("/api/comments/5")
        .expect(200)
        .send({
          randomKey: "randomValue",
          inc_votes: 3,
          anotherRandomKey: 67,
        })
        .then(({body: {comment}}) => {

          expect(comment).toEqual(expect.objectContaining({
            comment_id: 5,
            body: "I hate streaming noses",
            article_id: 1,
            author: "icellusedkars",
            votes: 3,
            created_at: "2020-11-03T21:00:00.000Z",
          }));
        });
    });
    test("PATCH:400 responds with an appropriate status code and error message when provided a malformed body", () => {

      return request(app)
        .patch("/api/comments/5")
        .expect(400)
        .send({})
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("PATCH:400 responds with an appropriate status code and error message when attempting to update value with invalid type", () => {

      return request(app)
        .patch("/api/comments/5")
        .expect(400)
        .send({
          inc_votes: "notANumber",
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("PATCH:400 responds with an appropriate status code and error message when provided with an invalid id type", () => {

      return request(app)
        .patch("/api/comments/notAnId")
        .expect(400)
        .send({
          inc_votes: 2,
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("PATCH:404 responds with an appropriate status code and error message when provided with a valid but non-existent id", () => {

      return request(app)
        .patch("/api/comments/99999")
        .expect(404)
        .send({
          inc_votes: 2,
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
  describe("DELETE", () => {
    test("DELETE:204 should delete a comment using given parameterised comment_id", () => {

      return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then(({body}) => {

          expect(body).toEqual({});
          return db
            .query("SELECT * FROM comments;");
        })
        .then(({rows, rowCount}) => {

          expect(rowCount).toBe(17);
          rows.forEach((row) => {
            expect(row.comment_id).not.toBe(1);
          });
        });
    });
    test("DELETE:400 responds with an appropriate status code and error message when provided an invalid id", () => {

      return request(app)
        .delete("/api/comments/notAnId")
        .expect(400)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("DELETE:404 responds with an appropriate status code and error message when attempting to delete a comment that does not exist", () => {

      return request(app)
        .delete("/api/comments/99999")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("GET:200 responds with an array of topic objects", () => {

      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({body: {topics}}) => {

          expect(topics.length).toBe(3);
          topics.forEach((topic) => {

            expect(topic).toEqual(expect.objectContaining({
              description: expect.any(String),
              slug: expect.any(String),
            }));
          });
        });
    });
  });
  describe("POST", () => {
    test("POST:201 responds with a topic object containing the newly created topic", () => {

      return request(app)
        .post("/api/topics")
        .expect(201)
        .send({
          slug: "topic-name-here",
          description: "description-here",
        })
        .then(({body: {topic}}) => {

          expect(topic).toEqual(expect.objectContaining({
            slug: "topic-name-here",
            description: "description-here",
          }));
        });
    });
    test("POST:201 responds with a topic object containing the newly created topic when request body contains excess information but at least a 'slug' and 'description' field", () => {

      return request(app)
        .post("/api/topics")
        .expect(201)
        .send({
          randomKey: "randomKeyValue",
          slug: "topic-name-here",
          anotherRandomKey: 78,
          description: "description-here",
          yetAnotherRandomKey: [1, 2, 4],
        })
        .then(({body: {topic}}) => {

          expect(topic).toEqual(expect.objectContaining({
            slug: "topic-name-here",
            description: "description-here",
          }));
        });
    });
    test("POST:201 responds wth a topic object containing only a 'slug' key when provided a body with no 'description' field", () => {

      return request(app)
        .post("/api/topics")
        .expect(201)
        .send({
          slug: "topic-name-here",
        })
        .then(({body: {topic}}) => {

          expect(topic).toEqual(expect.objectContaining({
            slug: "topic-name-here",
          }));
        });
    });
    test("POST:400 responds with an appropriate status code and error message when provided a malformed body", () => {

      return request(app)
        .post("/api/topics")
        .expect(400)
        .send({})
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("POST:400 responds with an appropriate status code and error message when provided a body with a missing 'slug' field", () => {

      return request(app)
        .post("/api/topics")
        .expect(400)
        .send({
          description: "description-here",
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
    test("POST:400 responds with an appropriate status code and error message when provided with a 'slug' field that already exists in the database", () => {

      return request(app)
        .post("/api/topics")
        .expect(400)
        .send({
          slug: "mitch",
          description: "the man, the Mitch, the legend",
        })
        .then(({body: {msg}}) => {
          expect(msg).toBe("Bad request.");
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("GET:200 responds with an array of user objects, each with a \"username\", \"name\" and \"avatar_url\" property", () => {

      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({body: {users}}) => {

          expect(users.length).toBe(4);
          users.forEach((user) => {

            expect(user).toEqual(expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            }));
          });
        });
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("GET:200 responds with a user object using given parameterised endpoint", () => {

      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(({body: {user}}) => {

          expect(user).toEqual(expect.objectContaining({
            username: "butter_bridge",
            name: "jonny",
            avatar_url: "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          }));
        });
    });
    test("GET:404 responds with an appropriate status code and error message when attempting to find a username that does not exist", () => {

      return request(app)
        .get("/api/users/notAUsername")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
});

describe("/api/users/:username/comments", () => {
  describe("GET", () => {
    test("GET:200 responds with an array of comment objects pertaining to parameterised username endpoint, sorted by most recent ('created_at') first ('desc')", () => {

      return request(app)
        .get("/api/users/icellusedkars/comments")
        .expect(200)
        .then(({body: {comments}}) => {

          expect(comments.length).toBeGreaterThan(0);
          comments.forEach((comment) => {
            expect(comment).toEqual(expect.objectContaining({
              comment_id: expect.any(Number),
              body: expect.any(String),
              article_id: expect.any(Number),
              author: "icellusedkars",
              votes: expect.any(Number),
              created_at: expect.any(String),
            }));
          });
          expect(comments).toBeSortedBy("created_at", {descending: true});
        });
    });
    test("GET:200 responds with an empty array when user has no comments", () => {

      return request(app)
        .get("/api/users/lurker/comments")
        .expect(200)
        .then(({body: {comments}}) => {
          expect(comments).toEqual([]);
        });
    });
    test("GET:200 responds with an object containing an array of comment objects and a 'totalPages' key paginated by 'limit' and 'p' queries", () => {

      return request(app)
      .get("/api/users/icellusedkars/comments?limit=5&p=2")
      .expect(200)
      .then(({body: {comments, totalPages}}) => {

        expect(comments.length).toBe(5);
        comments.forEach((comment) => {
          expect(comment).toEqual(expect.objectContaining({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: expect.any(Number),
            author: "icellusedkars",
            votes: expect.any(Number),
            created_at: expect.any(String),
          }));
        });
        expect(totalPages).toBe(3);
      });
    });
    test("GET:200 responds with an object containing an array of every comment object that pertains to the parameterised username when given a limit query that is greater than the amount of results in the database", () => {

      return request(app)
      .get("/api/users/icellusedkars/comments?limit=99999")
      .expect(200)
      .then(({body: {comments, totalPages}}) => {

        expect(comments.length).toBe(13);
        expect(totalPages).toBe(1);
      });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting an invalid limit query", () => {
      
      return request(app)
      .get("/api/users/icellusedkars/comments?limit=notANumber")
      .expect(400)
      .then(({body: {msg}}) => {
        expect(msg).toBe("Bad request.");
      });
    });
    test("GET:400 responds with an appropriate status code and error message when attempting an invalid p query", () => {
      
      return request(app)
      .get("/api/users/icellusedkars/comments?limit=5&p=notANumber")
      .expect(400)
      .then(({body: {msg}}) => {
        expect(msg).toBe("Bad request.");
      });
    });
    test("GET:404 responds with an appropriate status code and error message when attempting to query a page that does not contain any results", () => {
      
      return request(app)
      .get("/api/users/icellusedkars/comments?limit=5&p=99999")
      .expect(404)
      .then(({body: {msg}}) => {
        expect(msg).toBe("Resource not found.");
      });
    });
    test("GET:404 responds with an appropriate status code and error message when attempting to query comments from a username that does not exist", () => {

      return request(app)
        .get("/api/users/notAValidUsername/comments")
        .expect(404)
        .then(({body: {msg}}) => {
          expect(msg).toBe("Resource not found.");
        });
    });
  });
});
