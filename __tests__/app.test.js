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
        expect(categoriesArray.length).toBe(4)
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
          const reviewObject = response.body.review[0]
          const expectedReview = {
            review_id: 2,
              title: 'Jenga',
      designer: 'Leslie Scott',
      owner: 'philippaclaire9',
      review_img_url:
        'https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700',
      review_body: 'Fiddly fun for all the family',
      category: 'dexterity',
      created_at: "2021-01-18T10:01:41.251Z",
      votes: 5
          }
            expect(reviewObject).toEqual(expectedReview);
          });
        });
    });
    it("should return status 404 when reponding to invalid review_id in request", () => {
        return request(app)
        .get("/api/reviews/999")
        .expect(404)
        .then((response) => {
            expect(response.body.message).toBe("review ID not found")
        })
    })
  

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
