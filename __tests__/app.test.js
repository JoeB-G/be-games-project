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
          comment_count: expect.any(String),
        };
        expect(reviewObject).toMatchObject(expectedReview);
        expect(reviewObject.comment_count).toBe("3");
      });
  });
  it("should return status 404 when reponding to a review_id that does not exist", () => {
    return request(app)
      .get("/api/reviews/999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("review_id not found");
      });
  });
  it("should return status 400 when reponding to invalid review_id", () => {
    return request(app)
      .get("/api/reviews/sausages")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
});

describe("GET /api/reviews", () => {
  it("should return status 200, responds with array of review objects in descending order with comment_count column that counts total comments for each review when passed with no queries", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((response) => {
        const expectedCategory = {
          owner: expect.any(String),
          title: expect.any(String),
          review_id: expect.any(Number),
          category: expect.any(String),
          review_img_url: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          designer: expect.any(String),
          comment_count: expect.any(String),
        };
        const reviewsArray = response.body.reviews;
        expect(reviewsArray).toBeSortedBy("created_at", {
          descending: true,
        });
        expect(reviewsArray.length).toBe(13);
        reviewsArray.forEach((review) => {
          expect(review).toMatchObject(expectedCategory);
        });
      });
  });
  it("should return status 200, responds with review selected from category query value", () => {
    return request(app)
      .get("/api/reviews?category=social deduction")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        expect(reviewsArray.length).toBe(11);
        reviewsArray.forEach((review) => {
          expect(review.category).toBe("social deduction");
        });
      });
  });
  it("should return status 200, responds with review ordered by query value", () => {
    return request(app)
      .get("/api/reviews?order=ASC")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        expect(reviewsArray).toBeSortedBy("created_at", { descending: false });
      });
  });
  it("should return status 200, responds with review sorted by query value", () => {
    return request(app)
      .get("/api/reviews?sort_by=comment_count")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        expect(reviewsArray).toBeSortedBy("comment_count", {
          descending: true,
        });
      });
  });
  it("should return status 200, should handle all query values simultaneously", () => {
    return request(app)
      .get("/api/reviews?sort_by=votes&order=ASC&category=social deduction")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        expect(reviewsArray.length).toBe(11);
        expect(reviewsArray).toBeSortedBy("votes", { descending: false });
      });
  });
  it("should return status 200, when passed valid category query value with no associated reviews", () => {
    return request(app)
      .get("/api/reviews?category=children's games")
      .expect(200)
      .then((response) => {
        expect(response.body.reviews).toEqual([]);
      });
  });
  it("should return status 404, when passed invalid category query value", () => {
    return request(app)
      .get("/api/reviews?category=CHEESE")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("categories slug not found");
      });
  });
  it("should return status 400, when passed invalid sort_by query", () => {
    return request(app)
      .get("/api/reviews?sort_by=BISCUITS")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid sort query");
      });
  });
  it("should return status 400, when passed invalid order query", () => {
    return request(app)
      .get("/api/reviews?order=BISCUITS")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid sort order");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  it("should return status 200, responds with an array of comment objects sorted in descending date order", () => {
    return request(app)
      .get("/api/reviews/3/comments")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        const expectedComment = {
          review_id: expect.any(Number),
          body: expect.any(String),
          comment_id: expect.any(Number),
          author: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
        };
        expect(commentsArray).toBeSortedBy("created_at", {
          descending: true,
        });
        commentsArray.forEach((comment) => {
          expect(comment).toMatchObject(expectedComment);
        });
      });
  });
  it("should return status 404 when reponding to a review_id that does not exist", () => {
    return request(app)
      .get("/api/reviews/3000/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("reviews review_id not found");
      });
  });
  it("should return status 400 when reponding to invalid review_id", () => {
    return request(app)
      .get("/api/reviews/SAUSAGES/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  it("should return status 201 and respond with the posted comment object", () => {
    const commentObj = { username: "mallionaire", body: "blahdeblad" };
    const expectedResponse = {
      comment_id: expect.any(Number),
      body: "blahdeblad",
      review_id: 1,
      author: "mallionaire",
      votes: expect.any(Number),
      created_at: expect.any(String),
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(commentObj)
      .expect(201)
      .then((response) => {
        expect(response.body.comment).toEqual(expectedResponse);
      });
  });
  it("should return status 404 when responding to review_id that does not exist", () => {
    const commentObj = { username: "mallionaire", body: "blahdeblad" };
    return request(app)
      .post("/api/reviews/99999/comments")
      .send(commentObj)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("reviews review_id not found");
      });
  });
  it("should return status 400 when responding to invalid review_id", () => {
    const commentObj = { username: "mallionaire", body: "blahdeblad" };
    return request(app)
      .post("/api/reviews/BEANS/comments")
      .send(commentObj)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 400 when passed object missing required keys", () => {
    const commentObj = { user: "mallionaire", body: "blahdeblad" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(commentObj)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object missing required keys");
      });
  });
  it("should return status 400 when passed object with invalid values", () => {
    const commentObj = { username: "trallionaire", body: "blahdeblad" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(commentObj)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object contains invalid values");
      });
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  it("should return status 201 and respond with the updated review object", () => {
    const votesUpdateObj = { inc_votes: 10 };
    const expectedResponse = {
      owner: "mallionaire",
      title: "Agricola",
      review_id: 1,
      category: expect.any(String),
      review_img_url: expect.any(String),
      created_at: expect.any(String),
      votes: 11,
      designer: "Uwe Rosenberg",
      review_body: expect.any(String),
    };
    return request(app)
      .patch("/api/reviews/1/")
      .send(votesUpdateObj)
      .expect(201)
      .then((response) => {
        expect(response.body.review).toEqual(expectedResponse);
      });
  });
  it("should return status 404 when responding to review_id that does not exist", () => {
    const votesUpdateObj = { inc_votes: 10 };
    return request(app)
      .patch("/api/reviews/9999")
      .send(votesUpdateObj)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("reviews review_id not found");
      });
  });
  it("should return status 400 when responding to invalid review_id", () => {
    const votesUpdateObj = { inc_votes: 10 };
    return request(app)
      .patch("/api/reviews/CHEESE")
      .send(votesUpdateObj)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 400 when passed object missing required keys", () => {
    const votesUpdateObj = { inc_vootes: 10 };
    return request(app)
      .patch("/api/reviews/1")
      .send(votesUpdateObj)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object missing required keys");
      });
  });
  it("should return status 400 when passed object with invalid values", () => {
    const votesUpdateObj = { inc_votes: "sausages" };
    return request(app)
      .patch("/api/reviews/1")
      .send(votesUpdateObj)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("should return status 204 when passed valid comment_id", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  it("should return status 400 when passed invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/BANANAS")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 404 when passed comment_id that does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("comment_id not found");
      });
  });
});

describe("GET /api/users", () => {
  it("should return status 200, array of users objects ", () => {
    const expectedUser = {
      username: expect.any(String),
      name: expect.any(String),
      avatar_url: expect.any(String),
    };
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const usersArray = response.body.users;

        expect(usersArray.length).toBe(4);

        usersArray.forEach((user) => {
          expect(user).toMatchObject(expectedUser);
        });
      });
  });
});

describe("GET /api", () => {
  it("should return status 200, responds with endpoint.json object", () => {
    const expectedReponse = {
      "GET /api": expect.any(Object),
      "GET /api/categories": expect.any(Object),
      "GET /api/reviews": expect.any(Object),
      "GET /api/reviews/:review_id": expect.any(Object),
      "GET /api/reviews/:review_id/comments": expect.any(Object),
      "POST /api/reviews/:review_id/comments": expect.any(Object),
      "PATCH /api/reviews/:review_id": expect.any(Object),
      "DELETE /api/comments/:comment_id": expect.any(Object),
      "GET /api/users": expect.any(Object),
    };
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.endpoints).toMatchObject(expectedReponse);
      });
  });
});

describe("GET /api/users/:username", () => {
  it("should return status 200, respond with user object", () => {
    const expectedUser = {
      username: "mallionaire",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
      name: "haz",
    };
    return request(app)
      .get("/api/users/mallionaire")
      .expect(200)
      .then((response) => {
        expect(response.body.user).toEqual(expectedUser);
      });
  });
  it("should return status 404 when passed username that does not exist", () => {
    return request(app)
      .get("/api/users/xxx360quickscopesxxx")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("username not found");
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
