const Multer = require('multer');
const mongoose = require('mongoose');
const parseIngredient = require('parse-ingredient');
const { ObjectId } = require('mongodb');
const recipeScraper = require('recipe-scraper');
const RecipeModel = require('../models/Recipe');
const UserModel = require('../models/User');

mongoose.set('useFindAndModify', false);
let userId;

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 megabytes
  },
});

module.exports = (app) => {
  // fetch Recipe names from db to Home page.
  app.get('/home', async (req, res) => {
    const query = await RecipeModel.find({ hidden: false }).select({
      name: 1,
      _id: 0,
      imageUrl: 1,
      meta: 1,
      recipeId: 1,
      time: 1,
    });
    res.json(query);
  });

  // eslint-disable-next-line consistent-return
  const checkAuth = (req, res, next) => {
    // console.log('Current user is:', req.user);
    const isLoggedIn = req.isAuthenticated() && req.user;
    if (!isLoggedIn) {
      return res.status(401).json({
        error: 'You must be logged in!',
      });
    }
    console.log('Authed!');
    // eslint-disable-next-line no-underscore-dangle
    userId = req.user._id;
    next();
  };

  app.get('/pinned/:id', checkAuth, async (req, res) => {
    const recipeId = req.params.id;
    const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
    const user = results[0];
    if (!user) {
      res.json([]);
      return;
    }
    const recipeIds = user.recipesPinned;
    console.log(recipeIds);

    if (recipeIds.includes(recipeId.toString())) {
      res.json(recipeId);
      return;
    }
    res.json([]);
  });

  app.get('/pinned', checkAuth, async (req, res) => {
    const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
    const user = results[0];
    if (!user) {
      res.json([]);
      return;
    }
    const recipeIds = user.recipesPinned;

    const query = await RecipeModel.find({
      recipeId: { $in: recipeIds },
    }).select({
      name: 1,
      _id: 0,
      imageUrl: 1,
      meta: 1,
      recipeId: 1,
    });
    // console.log('pinned:', query);
    res.json(query);
  });

  app.get('/saved/:id', checkAuth, async (req, res) => {
    const recipeId = req.params.id;
    const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
    const user = results[0];
    if (!user) {
      res.json([]);
      return;
    }
    const recipeIds = user.recipesStarred;
    console.log(recipeIds);

    if (recipeIds.includes(recipeId.toString())) {
      res.json(recipeId);
      return;
    }
    res.json([]);
  });

  app.get('/saved', checkAuth, async (req, res) => {
    const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
    const user = results[0];
    if (!user) {
      res.json([]);
      return;
    }
    const recipeIds = user.recipesStarred;

    const query = await RecipeModel.find({
      recipeId: { $in: recipeIds },
    }).select({
      name: 1,
      _id: 0,
      imageUrl: 1,
      meta: 1,
      recipeId: 1,
      time: 1,
      category: 1,
    });
    // console.log('saved:', query);
    res.json(query);
  });

  app.post('/star/add/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    try {
      const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
      const user = results[0];
      console.log(user);
      if (user) {
        const updateDoc = { $addToSet: { recipesStarred: recipeId } };
        try {
          const response = await UserModel.updateOne(
            { _id: userId },
            updateDoc
          );
          if (response) {
            console.log('starred successfully');
            res.json(recipeId);
          } else {
            console.log('failed to star');
          }
        } catch (err) {
          console.log(err, 'fail to star recipe on DB');
        }
      }
    } catch (err) {
      console.log(err, 'fail to find user in DB to star recipe');
    }
  });

  app.post('/star/remove/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    try {
      const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
      const user = results[0];
      console.log(user);
      if (user) {
        const updateDoc = { $pull: { recipesStarred: recipeId } };
        try {
          const response = await UserModel.updateOne(
            { _id: userId },
            updateDoc
          );
          if (response) {
            console.log('unstarred successfully');
            res.json(recipeId);
          } else {
            console.log('failed to unstar');
          }
        } catch (err) {
          console.log(err, 'fail to unstar recipe on DB');
        }
      }
    } catch (err) {
      console.log(err, 'fail to find user in DB to unstar recipe');
    }
  });

  app.post('/pin/add/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    try {
      const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
      const user = results[0];
      console.log(user);
      if (user) {
        const updateDoc = { $addToSet: { recipesPinned: recipeId } };
        try {
          const response = await UserModel.updateOne(
            { _id: userId },
            updateDoc
          );
          if (response) {
            console.log('starred successfully');
            res.json(recipeId);
          } else {
            console.log('failed to star');
          }
        } catch (err) {
          console.log(err, 'fail to star recipe on DB');
        }
      }
    } catch (err) {
      console.log(err, 'fail to find user in DB to star recipe');
    }
  });

  app.post('/pin/remove/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    try {
      const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
      const user = results[0];
      console.log(user);
      if (user) {
        const updateDoc = { $pull: { recipesPinned: recipeId } };
        try {
          const response = await UserModel.updateOne(
            { _id: userId },
            updateDoc
          );
          if (response) {
            console.log('unstarred successfully');
            res.json(recipeId);
          } else {
            console.log('failed to unstar');
          }
        } catch (err) {
          console.log(err, 'fail to unstar recipe on DB');
        }
      }
    } catch (err) {
      console.log(err, 'fail to find user in DB to unstar recipe');
    }
  });

  app.post('/recipes/new', multer.single('file'), async (req, res) => {
    console.log('adding new recipe');
    let newId = 1;
    console.log('user', userId);
    try {
      const maxIdRecipe = await RecipeModel.find()
        .sort({ recipeId: -1 })
        .limit(1); // returns array
      if (maxIdRecipe.length > 0) {
        // if db has at least 1 recipe, else sets newId to 1
        newId = +maxIdRecipe[0].recipeId + 1;
      }
      const query = JSON.parse(req.body.data);
      console.log('q::::', query);
      const postReq = {};
      if (query.category) {
        postReq.category = query.category
          .replace(', ', ',')
          .replace(' ,', ',')
          .split(',');
      }
      if (query.ingredients) {
        postReq.ingredients = parseIngredient(query.ingredients.toLowerCase());
      }
      if (query.directions) {
        postReq.directions = query.directions
          .replace(/[\r]/g, '')
          .split('\n')
          .filter((T) => T.length > 0)
          .map((item) => item.trim());
      }
      postReq.hidden = !!query.hidden;
      postReq.name = query.name;
      postReq.votes = +1;
      postReq.recipeId = newId;
      postReq.time = {
        prepHour: query.prepHour,
        prepMin: query.prepMin,
        cookHour: query.cookHour,
        cookMin: query.cookMin,
      };
      postReq.meta = { votes: 1, rating: query.rating };
      postReq.url = query.url;
      postReq.imageUrl = query.imageUrl; // Embed the Google Cloud Storage image URL
      postReq.servingSize = +query.servingSize;
      const recipe = await RecipeModel.create(postReq);
      console.log('recipe added successfully', recipe);

      // add to user owned
      let addedToUser = false;

      if (recipe && userId) {
        try {
          const userRes = await UserModel.find({ _id: ObjectId(userId) }).limit(
            1
          );
          const user = userRes[0];
          console.log('userRes:', userRes);
          if (user) {
            const updateDoc = {
              $addToSet: { recipesOwned: newId, recipesStarred: newId },
            };
            try {
              const response = await UserModel.updateOne(
                { _id: ObjectId(userId) },
                updateDoc
              );
              if (response) {
                addedToUser = true;
                console.log('added recipe to recipesOwned successfully');
                res.json(newId);
              } else {
                console.log('failed to add to recipesOwned');
              }
            } catch (err2) {
              console.log(err2, 'fail to add recipe to user DB');
            }
          }
        } catch (err) {
          console.log(err, 'fail to find user in DB to add recipe');
        }
        if (recipe && !addedToUser) {
          console.log('recipe added publicly, but no author');
        }
        console.log('done!');
      }
    } catch (err3) {
      console.log('error, cant create new recipes');
      console.log(err3);
    }
    res.json(newId);
  });

  // NEED TO DO:  modify
  // router.patch('/:id', async (req, res) => {
  // not implemented yet
  // });

  app.get('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    try {
      // faster to use find().limit(1) instead of findOne()
      const results = await RecipeModel.find({ recipeId: +id }).limit(1);
      const recipe = results[0];
      if (recipe) {
        console.log('recipe found');
        res.send(recipe);
      } else {
        const dne = 'no such recipe with this id';
        console.log(dne);
        res.json({ error: dne });
      }
    } catch (err) {
      console.log('no such recipe');
      res.json({ error: err.message });
    }
  });

  app.get('/recipes/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
      // faster to use find().limit(1) instead of findOne()
      const results = await RecipeModel.find({ recipeId: +id }).limit(1);
      const recipe = results[0];
      if (recipe) {
        console.log('parse content of recipe to edit page');
        res.send(recipe);
      } else {
        const dne = 'no such recipe with this id';
        console.log(dne);
        res.json({ error: dne });
      }
    } catch (err) {
      console.log('fail to go to edit page');
      res.json({ error: err.message });
    }
  });

  // search keyword in non-sensitive case
  app.get('/search/:name', async (req, res) => {
    const searchName  = req.params.name;
    console.log(searchName,"Sadjaisia");
    try {
      const recipe = await RecipeModel.find({ name: { $regex: searchName, $options: 'i'} }).select({
        name: 1, _id: 0, imageUrl: 1, meta: 1, recipeId: 1
      });
      if (recipe) {
        console.log('searched recipes found');
        res.json(recipe);
      } else {
        const dne = 'no such recipe with this name';
        console.log(dne);
        res.json({ error: dne });
      }
    } catch (err) {
      console.log('no such recipe');
      res.json({ error: err.message });
    }
  });

  app.post('/remove/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    let isOwner = false;
    try {
      const results = await UserModel.find({ _id: ObjectId(userId) }).limit(1);
      const user = results[0];
      console.log(user);
      if (user) {
        if (user.recipesOwned.includes(recipeId)) {
          isOwner = true;
        }
        const updateDoc = {
          $pull: {
            recipesOwned: recipeId,
            recipesStarred: recipeId,
            recipesPinned: recipeId,
          },
        };
        try {
          const response = await UserModel.updateOne(
            { _id: userId },
            updateDoc
          );
          if (response) {
            console.log('recipe removed from user successfully');
            if (isOwner) {
              const hiddenResponse = await RecipeModel.updateOne(
                { recipeId },
                { $set: { hidden: true } }
              );
              if (hiddenResponse) {
                console.log('recipe hidden successfully');
                res.json({ recipeId, hidden: true });
              } else {
                console.log('failure to hide recipe');
              }
            } else {
              console.log('user is not owner');
              res.json({ recipeId });
            }
          } else {
            console.log('fail to find user');
          }
        } catch (e) {
          console.log('error removing recipe:', e);
        }
      }
    } catch (err) {
      console.log('error find user and removing recipe:', err);
    }
  });

  // perhaps for admin deletion
  app.delete('/recipes/:id', async (req, res) => {
    console.log(req.params);
    const query = { _id: mongoose.Types.ObjectId(req.params.id) };
    try {
      const recipe = await RecipeModel.findOneAndRemove(query);
      if (recipe) {
        console.log('recipe deleted successfully');
        res.json(recipe);
      } else {
        console.log('fail to delete recipe');
      }
    } catch (err) {
      console.log('error, cant delete recipe');
      res.json({ error: err.message });
    }
  });

  app.post('/parse', async (req, res) => {
    console.log('Parse the URL to recipe');
    let newId = 1;
    try {
      const maxIdRecipe = await RecipeModel.find()
        .sort({ recipeId: -1 })
        .limit(1); // returns array
      if (maxIdRecipe.length > 0) {
        // if db has at least 1 recipe, else sets newId to 1
        newId = +maxIdRecipe[0].recipeId + 1;
      }
    } catch (e) {
      console.log('err with find maxId', e);
    }

    const postReq = {};
    const urlAddr = req.body.url;
    console.log(urlAddr);

    recipeScraper(urlAddr).then(async (recipe) => {
      console.log(recipe);
      if (recipe.tag) {
        postReq.category = recipe.tag
          .replace(', ', ',')
          .replace(' ,', ',')
          .split(',');
      }
      postReq.name = recipe.name;
      postReq.recipeId = newId;
      postReq.hidden = false;
      postReq.url = urlAddr;
      const newIngre = [];
      for (let i = 0; i < recipe.ingredients.length; i++) {
        newIngre[i] = recipe.ingredients[i].replace(',', '');
      }
      const formatIngre = newIngre.toString().split(',').join('\n');
      // console.log(formatIngre);
      postReq.ingredients = parseIngredient(formatIngre);
      const newInstruct = [];
      let index = 0;
      for (let n = 0; n < recipe.instructions.length; n++) {
        if (recipe.instructions[n].length !== 0) {
          newInstruct[index] = recipe.instructions[n];
          index++;
        }
      }
      postReq.directions = newInstruct;

      function isNumber(n) {
        return !Number.isNaN(parseFloat(n)) && !Number.isNaN(n - 0);
      }

      // https://stackoverflow.com/questions/17885850/how-to-parse-a-string-containing-text-for-a-number-float-in-javascript
      // parses string for num
      function parseSentenceForNumber(sentence) {
        const matches = sentence.match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/);
        return (matches && matches[0]) || null;
      }

      // http://www.4codev.com/javascript/convert-seconds-to-time-value-hours-minutes-seconds-idpx6943853585885165320.html
      function convertHMS(value) {
        // convert seconds to hours and minutes
        const sec = parseInt(value, 10);
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec - hours * 3600) / 60);
        return { hours, minutes };
      }

      // https://stackoverflow.com/questions/5772197/javascript-converting-a-string-ie-1-hour-2-minutes-to-time-in-seconds
      function timespanMillis(s) {
        const tMillis = {
          second: 1000,
          min: 60 * 1000,
          mins: 60 * 1000,
          minute: 60 * 1000,
          minutes: 60 * 1000,
          hr: 60 * 60 * 1000,
          hour: 60 * 60 * 1000,
          hours: 60 * 60 * 1000,
          hrs: 60 * 60 * 1000,
        };
        const regex =
          /(\d+)\s*(second|min|mins|minute|minutes|hr|hours|hour|hrs)/g;
        let ms = 0;
        let m;
        let x;
        while ((m = regex.exec(s))) {
          x = Number(m[1]) * (tMillis[m[2]] || 0);
          ms += x;
        }
        return x ? convertHMS(ms / 1000) : { hours: 0, minutes: 0 };
      }

      let cookHour = 0;
      let cookMin = 0;
      let prepHour = 0;
      let prepMin = 0;
      if (recipe.time.cook) {
        cookHour = timespanMillis(recipe.time.cook).hours;
        cookMin = timespanMillis(recipe.time.cook).minutes;
      } else if (recipe.time.total && recipe.time.prep) {
        cookHour =
          timespanMillis(recipe.time.total).hours -
          timespanMillis(recipe.time.prep).hours;
        cookMin =
          timespanMillis(recipe.time.total).minutes -
          timespanMillis(recipe.time.prep).minutes;
      }
      if (recipe.time.prep) {
        prepHour = timespanMillis(recipe.time.prep).hours;
        prepMin = timespanMillis(recipe.time.prep).minutes;
      } else if (recipe.time.total && recipe.time.cook) {
        prepHour =
          timespanMillis(recipe.time.total).hours -
          timespanMillis(recipe.time.cook).hours;
        prepMin =
          timespanMillis(recipe.time.total).minutes -
          timespanMillis(recipe.time.cook).minutes;
      }

      console.log('time', cookHour, cookMin, prepHour, prepMin);
      postReq.time = {
        cookHour,
        cookMin,
        prepHour,
        prepMin,
      };

      if (isNumber(recipe.servings)) {
        postReq.servingSize = recipe.servings;
      } else {
        postReq.servingSize = parseSentenceForNumber(recipe.servings);
      }
      postReq.imageUrl = recipe.image;

      let parseRecipe;
      try {
        parseRecipe = await RecipeModel.create(postReq);
        if (parseRecipe) {
          console.log('Parsed recipe inserted successfully');
        } else {
          console.log('Fail to parse new recipe');
        }
      } catch (err) {
        console.log('error:', err);
      }

      // add to user owned
      let addedToUser = false;

      console.log(userId);
      if (userId && parseRecipe) {
        try {
          const userRes = await UserModel.find({ _id: ObjectId(userId) }).limit(
            1
          );
          const user = userRes[0];
          console.log('userRes:', userRes);
          if (user) {
            const updateDoc = {
              $addToSet: { recipesOwned: newId, recipesStarred: newId },
            };
            try {
              const response = await UserModel.updateOne(
                { _id: ObjectId(userId) },
                updateDoc
              );
              if (response) {
                addedToUser = true;
                console.log('added recipe to recipesOwned successfully');
              } else {
                console.log('failed to add to recipesOwned');
              }
            } catch (err2) {
              console.log(err2, 'fail to add recipe to user DB');
            }
          }
        } catch (err) {
          console.log(err, 'fail to find user in DB to add recipe');
        }
        if (parseRecipe && !addedToUser) {
          console.log('recipe added publicly, but no author');
        }
        console.log('done!');
      }
      res.json(newId);
    });
  });

  app.post('/recipes/edit/:recipeId', multer.single('file'), async (req, res) => {
    console.log('in post')
    const resId = req.params.recipeId;
    console.log('req params', req.params)
    if (userId) {
      console.log('Updating recipe', resId);
      console.log('user ', userId, ' is updating the recipe');
    }
    try {
      const filter = { recipeId: req.params.recipeId };
      // console.log('filter', filter);
      // console.log('req', JSON.parse(JSON.stringify(req.body)));
      const query = JSON.parse(req.body.data);
      console.log('q::::', query);
      const postReq = {};
      if (query.category) {
        console.log(query.category);
        if (query.category.includes(',')) {
          postReq.category = query.category
            .replace(', ', ',')
            .replace(' ,', ',')
            .split(',');
        } else {
          postReq.category = query.category;
        }
      }
      if (query.ingredients) {
        postReq.ingredients = parseIngredient(query.ingredients.toLowerCase());
      }
      if (query.directions) {
        postReq.directions = query.directions
          .replace(/[\r]/g, '')
          .split('\n')
          .filter((T) => T.length > 0)
          .map((item) => item.trim());
      }
      postReq.hidden = !!query.hidden;
      postReq.name = query.name;
      postReq.votes = +1;
      postReq.time = {
        prepHour: query.prepHour,
        prepMin: query.prepMin,
        cookHour: query.cookHour,
        cookMin: query.cookMin,
      };
      postReq.meta = { votes: 1, rating: query.rating };
      postReq.url = query.url;
      postReq.imageUrl = query.imageUrl; // Embed the Google Cloud Storage image URL
      postReq.servingSize = +query.servingSize;
      await RecipeModel.findOneAndUpdate(filter, postReq, {
        upsert: true,
        returnOriginal: false,
      },function (err, result) {
        if (err) res.send(500, {error: err})
        console.log('recipe updated successfully', result);
        res.json(resId);
      })
    } catch (err3) {
      console.log('error, cant update the recipe');
      console.log(err3);
    }
  });
};
