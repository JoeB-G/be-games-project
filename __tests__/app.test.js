const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data/index")
const db = require("../db/connection")
const request = require("supertest")
const app = require("../app")

beforeEach(() => seed(data))
afterAll(() => db.end())

describe("GET /api/categories", () => {
    it('should return status 200, responds with array of category objects with properties slug and description', () => {
        return request(app)
            .get("/api/categories")
            .expect(200)
            .then((response) => {
                const expectedCategories = [
                    { slug: 'euro game', description: 'Abstact games that involve little luck' },
                    {
                      slug: 'social deduction',
                      description: "Players attempt to uncover each other's hidden role"
                    },
                    { slug: 'dexterity', description: 'Games involving physical skill' },
                    { slug: "children's games", description: 'Games suitable for children' }
                  ]
                expect(response.body.categories).toEqual(expectedCategories)
            })
    });
})

describe("404", () => {
    it('should return 404 status when responding to request to endpoint that does not exist', () => {
        return request(app)
            .get("/qwerty")
            .expect(404)
            .then((response) => {
                expect(response.body.message).toBe("not found")
            })
    });
})