const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/Blog");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const helper = require("../utils/list_helper");

const initialBlogs = helper.initialBlogs;
describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });
    await user.save();
  });
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "testuser",
      name: "test user",
      password: "testpassword",
    };
    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });
  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("`username` to be unique");
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
  test("creation fails with proper statuscode/message if username/password is < 3 characters", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "ro",
      name: "Superuser",
      password: "sa",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    expect(result.body.error).toContain(
      "'username' and 'password' must be at least 3 characters long"
    );
  });
});

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 10000);

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(initialBlogs.length);
  }, 10000);

  test("id is defined for each blogObject", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  }, 10000);
});
describe("addition of a new blog", () => {
  test("login succeeds with correct credentials", async () => {
    const result = await api
      .post("/api/login")
      .send({ username: "root", password: "sekret" })
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(result.body.token).toBeDefined();
  });

  let token;
  beforeAll(async () => {
    await User.deleteMany({});
    const user = {
      username: "root",
      name: "root",
      password: "sekret",
    };
    await api.post("/api/users").send(user);
    const result = await api
      .post("/api/login")
      .send({ username: "root", password: "sekret" });

    token = { Authorization: `Bearer ${result.body.token}` };
  });
  test("HTTP Post request adds a new blog", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "testurl.com",
      likes: 0,
    };

    await api.post("/api/blogs").set(token).send(newBlog).expect(201);
    const response = await api.get("/api/blogs");
    const index = initialBlogs.length;
    expect(response.body).toHaveLength(index + 1);
    expect(response.body[index].title).toEqual(newBlog.title);
  });

  test("HTTP Post request sets likes to 0 if likes is not defined", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "test author",
      url: "testurl.com",
    };
    await api.post("/api/blogs").set(token).send(newBlog);
    const response = await api.get("/api/blogs");
    const index = initialBlogs.length;
    expect(response.body[index].likes).toEqual(0);
  });

  test("HTTP Post request returns 400 if title and url are not defined", async () => {
    const newBlog = {};
    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});
describe("deletion of a blog", () => {
  let token;
  beforeAll(async () => {
    await User.deleteMany({});
    const user = {
      username: "root",
      name: "root",
      password: "sekret",
    };
    await api.post("/api/users").send(user);
    const result = await api
      .post("/api/login")
      .send({ username: "root", password: "sekret" });

    token = { Authorization: `Bearer ${result.body.token}` };
  });
  test("HTTP Delete request deletes a blog", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "test author",
      url: "testurl.com",
    };
    await api.post("/api/blogs").set(token).send(newBlog);
    const response = await api.get("/api/blogs");
    const index = initialBlogs.length;
    const id = response.body[index].id;
    await api.delete(`/api/blogs/${id}`).set(token).expect(204);
    const response2 = await api.get("/api/blogs");
    expect(response2.body).toHaveLength(index);
  });
});

describe("updating a blog", () => {
  test("HTTP Put request updates a blog", async () => {
    const response = await api.get("/api/blogs");
    const index = initialBlogs.length;
    const id = response.body[index - 1].id;
    const updatedBlog = {
      likes: 100,
    };
    await api.put(`/api/blogs/${id}`).send(updatedBlog).expect(200);
    const response2 = await api.get("/api/blogs");
    expect(response2.body[index - 1].likes).toEqual(100);
  });
});

beforeEach(async () => {
  await Blog.deleteMany({});
  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
