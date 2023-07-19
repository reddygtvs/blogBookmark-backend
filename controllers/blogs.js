const blogsRouter = require("express").Router();
const Blog = require("../models/Blog");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const userExtractor = require("../utils/middleware").userExtractor;

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(blogs);
});

blogsRouter.post("/", userExtractor, async (request, response) => {
  const blog = request.body;
  const user = await User.findById(request.user);
  // const user = await User.findById(blog.userId);
  if (!blog.title || !blog.url) {
    return response.status(400).end();
  }
  const newBlog = new Blog({
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    user: user.id,
  });

  const savedBlog = await newBlog.save();
  await savedBlog.populate("user", { username: 1, name: 1 });
  user.blogs = user.blogs.concat(savedBlog.id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", userExtractor, async (request, response) => {
  const id = request.params.id;
  const blog = await Blog.findById(id);
  if (blog.user.toString() !== request.user.toString()) {
    return response.status(401).json({ error: "invalid token" });
  }
  await Blog.findByIdAndRemove(id);
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const id = request.params.id;

  const body = request.body;
  const blog = {
    likes: body.likes,
  };
  await Blog.findByIdAndUpdate(id, blog, { new: true });
  const updated = await Blog.findById(id).populate("user", {
    username: 1,
    name: 1,
  });
  response.status(201).json(updated);
  /*return the updated blog*/

  // response.status(200).end();
});

module.exports = blogsRouter;
