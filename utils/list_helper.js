const User = require("../models/user");

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  };
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const reducer = (maximum, item) => {
    if (item.likes > maximum.likes) {
      return item;
    } else {
      return maximum;
    }
  };
  return blogs.reduce(reducer, blogs[0]);
};

const mostBlogs = (blogs) => {
  let blogHash = new Map();
  const reducer = (most, item) => {
    if (most.title === "none") {
      blogHash.set(item.author, 1);
      return item;
    }
    if (!blogHash.has(item.author)) {
      blogHash.set(item.author, 1);
    } else {
      blogHash.set(item.author, blogHash.get(item.author) + 1);
    }
    if (blogHash.get(most.author) < blogHash.get(item.author)) {
      return item;
    } else {
      return most;
    }
  };
  return blogs.reduce(reducer, { title: "none" });
};

const mostLikes = (blogs) => {
  let blogHash = new Map();
  const reducer = (most, item) => {
    if (most.title === "none") {
      blogHash.set(item.author, item.likes);
      return item;
    }
    if (!blogHash.has(item.author)) {
      blogHash.set(item.author, item.likes);
    } else {
      blogHash.set(item.author, blogHash.get(item.author) + item.likes);
    }
    if (blogHash.get(most.author) < blogHash.get(item.author)) {
      return item;
    } else {
      return most;
    }
  };
  return blogs.reduce(reducer, { title: "none" });
};
const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
    user: "645a60873849f84274e0206b",
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
    user: "645a60873849f84274e0206b",
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
    user: "645a60873849f84274e0206b",
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
    user: "645a60873849f84274e0206b",
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
    user: "645a60873849f84274e0206b",
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
    user: "645a60873849f84274e0206b",
  },
];
//

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  initialBlogs,
  usersInDb,
  // token,
};
