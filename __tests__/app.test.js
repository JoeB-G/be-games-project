const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/categories", () => {
  it("should return status 200, responds with array of category objects with properties slug and description", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((response) => {
        const expectedCategory = {
          slug: expect.any(String),
          description: expect.any(String),
        };
        const categoriesArray = response.body.categories;
        expect(categoriesArray.length).toBe(4);
        categoriesArray.forEach((category) => {
          expect(category).toMatchObject(expectedCategory);
        });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  it("should return status 200, responds with a review object", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then((response) => {
        const reviewObject = response.body.review[0];
        const expectedReview = {
          review_id: expect.any(Number),
          title: expect.any(String),
          designer: expect.any(String),
          owner: expect.any(String),
          review_img_url: expect.any(String),
          review_body: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
        };
        expect(reviewObject).toMatchObject(expectedReview);
      });
  });
  it("should return status 404 when reponding to a review_id that does not exist", () => {
    return request(app)
      .get("/api/reviews/999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("review ID not found");
      });
  });
  it("should return status 400 when reponding to invalid review_id", () => {
    return request(app)
      .get("/api/reviews/sausages")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid review ID");
      });
  });
});

describe("404", () => {
  it("should return 404 status when responding to request to endpoint that does not exist", () => {
    return request(app)
      .get("/qwerty")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("not found");
      });
  });
});
