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
        categoriesArray.forEach((category) => {
          expect(category).toMatchObject(expectedCategory);
        });
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
