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
      .get("/api/reviews/11")
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
        expect(reviewObject.comment_count).toBe("0");
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
  it("should return status 200, responds with array of default 10 review objects in descending order with comment_count column that counts total comments for each review when passed with no queries", () => {
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
          total_count: expect.any(String),
        };
        const reviewsArray = response.body.reviews;
        expect(reviewsArray).toBeSortedBy("created_at", {
          descending: true,
        });
        expect(reviewsArray.length).toBe(10);
        reviewsArray.forEach((review) => {
          expect(review).toMatchObject(expectedCategory);
        });
      });
  });
  it("should return status 200, responds with number of reviews from limit query value", () => {
    return request(app)
      .get("/api/reviews?limit=1")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        expect(reviewsArray.length).toBe(1);
      });
  });
  it("should return status 200, responds with reviews offset by the review limit times by page number e.g. page limit 5, page 2 responds with reviews 6-10", () => {
    const expectedReview = [
      {
        review_id: 4,
        title: "Dolor reprehenderit",
        designer: "Gamey McGameface",
        owner: "mallionaire",
        review_img_url:
          "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?w=700&h=700",
        category: "social deduction",
        created_at: expect.any(String),
        votes: 7,
        comment_count: "0",
        total_count: expect.any(String),
      },
    ];
    return request(app)
      .get("/api/reviews?category=social deduction&limit=1&page=2")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        expect(reviewsArray).toEqual(expectedReview);
      });
  });
  it("should return status 200, responds with reviews selected from category query value", () => {
    return request(app)
      .get("/api/reviews?category=social deduction&limit=100")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        expect(reviewsArray.length).toBe(11);
        reviewsArray.forEach((review) => {
          expect(review.category).toBe("social deduction");
        });
      });
  });
  it("should return status 200, array of reviews with added total_count property, which is the total number of reviews returned by the query taking into account any filters without the limit applied", () => {
    return request(app)
      .get("/api/reviews?category=social deduction&limit=3")
      .expect(200)
      .then((response) => {
        const reviewsArray = response.body.reviews;
        reviewsArray.forEach((review) => {
          expect(review.total_count).toBe("11");
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
      .get(
        "/api/reviews?sort_by=votes&order=ASC&category=social deduction&limit=100&page=1"
      )
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
  it("should return status 400, when passed invalid limit query", () => {
    return request(app)
      .get("/api/reviews?limit=BISCUITS")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 400, when passed negative limit query", () => {
    return request(app)
      .get("/api/reviews?limit=-44")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("input must be positive");
      });
  });
  it("should return status 400, when passed negative page query", () => {
    return request(app)
      .get("/api/reviews?page=-10")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("input must be positive");
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
  it("should return status 200, respond with array of comment objects up to limit query value", () => {
    return request(app)
      .get("/api/reviews/3/comments?limit=1")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        expect(commentsArray.length).toBe(1);
      });
  });
  it("should return status 200, responds with comments array offset by the  limit times by page number e.g. page limit 5, page 2 responds with comments 6-10", () => {
    const expectedComments = [
      {
        comment_id: 2,
        body: "My dog loved this game too!",
        review_id: 3,
        author: "mallionaire",
        votes: 13,
        created_at: "2021-01-18T10:09:05.410Z",
      },
    ];
    return request(app)
      .get("/api/reviews/3/comments?limit=1&page=3")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        expect(commentsArray).toEqual(expectedComments);
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
  it("should return status 400, when passed invalid limit query", () => {
    return request(app)
      .get("/api/reviews/3/comments?limit=BISCUITS")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 400, when passed invalid page query", () => {
    return request(app)
      .get("/api/reviews/3/comments?page=BISCUITS")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 400, when passed negative limit query", () => {
    return request(app)
      .get("/api/reviews/3/comments?limit=-44")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("input must be positive");
      });
  });
  it("should return status 400, when passed negative page query", () => {
    return request(app)
      .get("/api/reviews/3/comments?page=-10")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("input must be positive");
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

describe("PATCH /api/comments/:comment_id", () => {
  it("should return status 201, responds with updated comment", () => {
    const expectedResponse = {
      comment_id: 1,
      body: "I loved this game too!",
      votes: 26,
      author: "bainesface",
      review_id: 2,
      created_at: expect.any(String),
    };
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 10 })
      .expect(201)
      .then((response) => {
        expect(response.body.comment).toEqual(expectedResponse);
      });
  });
  it("should return status 404 when passed comment_id that does not exist", () => {
    return request(app)
      .patch("/api/comments/9999")
      .send({ inc_votes: 10 })
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("comment_id not found");
      });
  });
  it("should return status 400 when passed invalid comment_id", () => {
    return request(app)
      .patch("/api/comments/BEANS")
      .send({ inc_votes: 10 })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 400 when passed object with invalid value", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "ten" })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 400 when passed object with invalid key", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_vo: 10 })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object missing required keys");
      });
  });
});

describe("POST /api/reviews", () => {
  it("should return status 201, responds with posted review", () => {
    const reviewToPost = {
      title: "QWEQWE",
      designer: "QWEQWEWEWE",
      owner: "dav3rid",
      review_img_url:
        "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
      review_body: "QWEWEWEWE!",
      category: "euro game",
    };

    const expectedResponse = {
      review_id: 14,
      title: "QWEQWE",
      category: "euro game",
      designer: "QWEQWEWEWE",
      owner: "dav3rid",
      review_body: "QWEWEWEWE!",
      review_img_url:
        "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
      created_at: expect.any(String),
      votes: 0,
      comment_count: "0",
    };
    return request(app)
      .post("/api/reviews")
      .send(reviewToPost)
      .expect(201)
      .then((response) => {
        expect(response.body.review).toEqual(expectedResponse);
      });
  });
  it("should return status 404 when passed object with owner or category that does not exist", () => {
    return request(app)
      .post("/api/reviews")
      .send({
        title: "QWEQWE",
        designer: "QWEQWEWEWE",
        owner: "SAUSAGES",
        review_img_url:
          "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
        review_body: "QWEWEWEWE!",
        category: "euro game",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object contains invalid values");
      });
  });
  it("should return status 400 when passed object with invalid key", () => {
    return request(app)
      .post("/api/reviews")
      .send({
        title: "QWEQWE",
        designer: "QWEQWEWEWE",
        sausages: "dav3rid",
        review_img_url:
          "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
        review_body: "QWEWEWEWE!",
        category: "euro game",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object missing required keys");
      });
  });
});

describe("POST /api/categories", () => {
  it("should return status 201, response with the posted category object", () => {
    const categoryObject = {
      slug: "Stupid games",
      description: "silly games for stupid people",
    };
    return request(app)
      .post("/api/categories")
      .send(categoryObject)
      .expect(201)
      .then((response) => {
        expect(response.body.category).toEqual(categoryObject);
      });
  });
  it("should return status 400 when passed object no slug key/value", () => {
    const categoryObject = {
      snail: "Stupid games",
      description: "silly games for stupid people",
    };
    return request(app)
      .post("/api/categories")
      .send(categoryObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object missing required keys");
      });
  });
  it("should return status 400 when passed object no description key", () => {
    const categoryObject = {
      slug: "Stupid games",
      FOOL: "silly games for stupid people",
    };
    return request(app)
      .post("/api/categories")
      .send(categoryObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("object missing required keys");
      });
  });
});

describe("DELETE /api/reviews/:review_id", () => {
  it("should return status 204 when passed valid review_id", () => {
    return request(app).delete("/api/reviews/1").expect(204);
  });
  it("should return status 400 when passed invalid review_id", () => {
    return request(app)
      .delete("/api/reviews/BANANAS")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("invalid input type");
      });
  });
  it("should return status 404 when passed review_id that does not exist", () => {
    return request(app)
      .delete("/api/reviews/9999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("review_id not found");
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
