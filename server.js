/*********************************************************************************
 * BTI325 – Assignment 05
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Stephanie Collins Chinaza Student ID: 137935235 Date: November 29 2024
 *
 * Online (Vercel) Link: assignment5-gamma-nine.vercel.app


 ********************************************************************************/

const express = require('express');
const app = express();
const blogService = require('./blog-service');
const path = require('path');

app.set('views', path.join(__dirname, 'views'));

const multer = require('multer');
const upload = multer();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

const PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));
app.set('view engine', '.hbs');

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

cloudinary.config({
    cloud_name: 'duvh5djuw',       
    api_key: '688811915143621',    
    api_secret: 'E5gfTeyf2-29y4vmX5FxiBJDXzo',  
    secure: true
});



app.get('/', (req, res) => {
    res.redirect('/blog');
});



app.get('/blog', async (req, res) => {
    let viewData = {};

    try {
       
        let posts = req.query.category 
            ? await blogService.getPublishedPostsByCategory(req.query.category) 
            : await blogService.getPublishedPosts();

      
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    
        viewData.posts = posts;
        viewData.post = posts[0]; 
    } catch (err) {
        viewData.message = "No results found";
    }

    try {
      
        let categories = await blogService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "No categories available";
    }

    
    res.render("blog", { data: viewData });
});



app.get('/blog/:id', async (req, res) => {
    let viewData = {};

    try {
        
        const post = await blogService.getPostById(req.params.id); 

        
        viewData.post = post; 

        
        const posts = await blogService.getPublishedPosts();
        viewData.posts = posts;

        const categories = await blogService.getCategories();
        viewData.categories = categories;

        
        res.render('blog', { data: viewData });

    } catch (err) {
      
        res.status(404).send('Post not found');
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/posts', (req, res) => {
    let promise;
    if (req.query.category) {
        promise = blogService.getPostsByCategory(req.query.category);
    } else if (req.query.minDate) {
        promise = blogService.getPostsByMinDate(req.query.minDate);
    } else {
        promise = blogService.getAllPosts();
    }

    promise
        .then(posts => res.render('posts', { posts }))
        .catch(err => res.render('posts', { message: "No results" }));
});

app.get('/categories', (req, res) => {
    blogService.getCategories()
        .then(categories => res.render('categories', { categories }))
        .catch(err => res.render('categories', { message: "No results" }));
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
    blogService.addCategory(req.body)
        .then(() => res.redirect('/categories'))
        .catch(err => res.status(500).send('Error: ' + err));
});

app.get('/categories/delete/:id', (req, res) => {
    blogService.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch(err => res.status(500).send("Unable to Remove Category / Category not found"));
});

app.get('/posts/add', (req, res) => {
    blogService.getCategories()
        .then(categories => res.render('addPost', { categories }))
        .catch(err => res.render('addPost', { categories: [] }));
});

app.post('/posts/add', upload.single('featureImage'), async (req, res) => {
    try {
        const uploaded = await new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) resolve(result);
                else reject(error);
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        req.body.featureImage = uploaded.url;

        await blogService.addPost(req.body);
        res.redirect('/posts');
    } catch (err) {
        console.error("Error adding post:", err);
        res.status(500).send('Error adding post: ' + err.message);
    }
});

app.get('/posts/delete/:id', (req, res) => {
    blogService.deletePostById(req.params.id)
        .then(() => res.redirect('/posts'))
        .catch(err => res.status(500).send("Unable to Remove Post / Post not found"));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

blogService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log(`Unable to start the server: ${err}`);
    });

