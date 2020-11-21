// grabs the client with destructuring from the export in index.js
const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getUserById,
  getPostsByTagName,
} = require("./index");

// drops all tables from the database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

// creates all tables for our database
async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
        
        CREATE TABLE posts(
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
        );

        CREATE TABLE tags(
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE post_tags(
          "postId" INTEGER REFERENCES posts(id),
          "tagId" INTEGER REFERENCES tags(id),
          UNIQUE ("postId", "tagId")
          );
      `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialusers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
      name: "Al Bert",
      location: "Sidney, Australia",
    });
    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Just Sandra",
      location: "Ain't tellin'",
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Gladys",
      location: "Upper East Side",
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them!",
      tags: ["#happy", "#youcandoanything"],
    });
    await createPost({
      authorId: sandra.id,
      title: "Don't mess with me",
      content: "See the title, I'm not here to play any games!",
      tags: ["#happy", "#worst-day-ever"],
    });
    await createPost({
      authorId: glamgal.id,
      title: "Have no fear, glamgal is here",
      content: "Call me Fergie, because I'm glamourous!",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"],
    });

    console.log("Finished creating posts!");
  } catch (error) {
    console.log("Error creating posts!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialusers();
    await createInitialPosts();
  } catch (error) {
    console.log("Error during rebuildDB!");
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("getAllusers: ", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result: ", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("getAllPosts: ", posts);

    console.log("Caling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content",
    });
    console.log("Result: ", updatePostResult);

    console.log("Calling updatePost on posts[1], only updating tags");
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ["#youcandoanything", "#redfish", "#bluefish"],
    });
    console.log("Result:", updatePostTagsResult);

    console.log("Calling getUserById with 3");
    const userThree = await getUserById(3);
    console.log("Result: ", userThree);

    console.log("Calling getPostsByTagName with #happy");
    const postsWithHappy = await getPostsByTagName("#happy");
    console.log("Result:", postsWithHappy);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => {
    client.end();
  });
