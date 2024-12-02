
const Sequelize = require('sequelize');

const sequelize = new Sequelize('Assignment 5', 'Assignment 5_owner', '3MuWsmxH8rpG', {
    host: 'ep-dry-fog-a52607af-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectModule: require('pg'), 
    dialectOptions: {
        ssl: { rejectUnauthorized: false } 
    },
    query: { raw: true }
});



// Define the Post model
const Post = sequelize.define('Post', {
    body: { type: Sequelize.TEXT },
    title: { type: Sequelize.STRING },
    postDate: { type: Sequelize.DATE },
    featureImage: { type: Sequelize.STRING },
    published: { type: Sequelize.BOOLEAN }
});

// Define the Category model
const Category = sequelize.define('Category', {
    category: { type: Sequelize.STRING }
});

// Define the relationship
Post.belongsTo(Category, { foreignKey: 'category' });

// Initialize database and sync models
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject("Unable to sync the database: " + err));
    });
};

// Retrieve all posts
module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll()
            .then(posts => resolve(posts))
            .catch(() => reject("No results returned"));
    });
};

// Retrieve published posts
module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { published: true } })
            .then(posts => resolve(posts))
            .catch(() => reject("No results returned"));
    });
};


// Retrieve posts by category
module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { published: true, category: category } })
            .then(posts => resolve(posts))
            .catch(() => reject("No results returned"));
    });
};


// Retrieve published posts by category
module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: { published: true, category: category } })
            .then(posts => resolve(posts))
            .catch(() => reject("No results returned"));
    });
};

// Retrieve posts by minimum date
module.exports.getPostsByMinDate = function (minDateStr) {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: { [gte]: new Date(minDateStr) }
            }
        })
            .then(posts => resolve(posts))
            .catch(() => reject("No results returned"));
    });
};

// Retrieve a post by ID
module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findByPk(id)
            .then(post => {
                if (post) resolve(post);
                else reject("No results returned");
            })
            .catch(() => reject("No results returned"));
    });
};

// Add a new post
module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.published = postData.published ? true : false;
        postData.postDate = new Date();

        
        for (const key in postData) {
            if (postData[key] === "") {
                postData[key] = null;
            }
        }

        Post.create(postData)
            .then(() => resolve())
            .catch(() => reject("Unable to create post"));
    });
};

// Add a new category
module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
       
        for (const key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }

        Category.create(categoryData)
            .then(() => resolve())
            .catch(() => reject("Unable to create category"));
    });
};

// Delete a category by ID
module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } })
            .then((rowsDeleted) => {
                if (rowsDeleted > 0) {
                    resolve();
                } else {
                    reject("Category not found");
                }
            })
            .catch(() => reject("Unable to delete category"));
    });
};

// Delete a post by ID
module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.destroy({ where: { id: id } })
            .then((rowsDeleted) => {
                if (rowsDeleted > 0) {
                    resolve();
                } else {
                    reject("Post not found");
                }
            })
            .catch(() => reject("Unable to delete post"));
    });
};

// Retrieve all categories
module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(categories => resolve(categories))
            .catch(() => reject("No results returned"));
    });
};
