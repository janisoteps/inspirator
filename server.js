var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose'); // DB control program

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/recipe');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('DATABASE CONNECTED!!');
});

var Schema = mongoose.Schema;
var recipeSchema = new Schema({
  image: String,
  ingredients: Array,
  directions: String,
  title: String,
  owner: String,
  ownername: String,
  friends: Array,
  chat: Array
});

var userSchema = new Schema({
  username: String,
  pwd: String,
  friends: Array,
  owner: Array,
  recipeFriend: Array
});

var Recipe = mongoose.model('Recipe', recipeSchema);

var User = mongoose.model('User', userSchema);

app.get('/recipe/:id',function(request, response, next){
  var recipeId = request.params.id;
  Recipe.find({_id:recipeId}).exec(function(error, data){
    if (error){
      return response.status(500).send(error);
    }
    return response.status(200).send(data);
  });
});

app.get('/user/:username',function(request, response, next){
  var username = request.params.username;
  console.log(username);
  User.find({username:username}).exec(function(error, data){
    if (error){
      return response.status(500).send(error);
    }
    return response.status(200).send(data);
  });
});

app.post('/recipe',function(request, response){
  var recipeData = request.body;
  recipeData.ingredients = JSON.parse(recipeData.ingredients);
  var newRecipe = new Recipe(recipeData);
  newRecipe.save(function(error, model){
    if(error){
      return response.status(500).send(error);
    }
    return response.status(201).send(newRecipe._id);
  });
});

app.post('/user',function(request, response){
  var userData = request.body;
  var newUser = new User(userData);
  newUser.save(function(error, model){
    if(error){
      return response.status(500).send(error);
    }
    return response.sendStatus(201);
  });
});

app.put('/user',function(request, response){
  var updateId = request.body.id;
  var friendId = request.body.friendid;
  var friendUsername = request.body.username;
  var ownerRecipeId = request.body.ownerRecipeId;
  var ownerRecipeName = request.body.ownerRecipeName;
  var friendRecipeName = request.body.friendRecipeName;
  var friendRecipeId = request.body.friendRecipeId;

  if (friendId) {
    User.update({ _id: updateId }, { $push: {friends: { friendid: friendId, friendname: friendUsername } } }, function (error, model) {
        if(error){
          return response.status(500).send(error);
        }
        return response.sendStatus(200);
    });
  } else if (ownerRecipeId) {
    User.update({ _id: updateId }, { $push: {owner: { recipeid: ownerRecipeId, recipename: ownerRecipeName } } }, function (error, model) {
        if(error){
          return response.status(500).send(error);
        }
        return response.sendStatus(200);
    });
  } else {
    User.update({ _id: updateId }, { $push: {recipeFriend: { recipeid: friendRecipeId, recipename: friendRecipeName } } }, function (error, model) {
        if(error){
          return response.status(500).send(error);
        }
        return response.sendStatus(200);
    });
  }
});

app.put('/recipe',function(request, response){
  var updateId = request.body.id;
  var friendId = request.body.addFriendId;
  friendUsername = request.body.addFriendName;
  var chatText = request.body.chatText;
  var chatUser = request.body.chatUser;
  var chatDate = new Date();
  var ingIndex = request.body.ingIndex;
  var done = request.body.done;
  var itemDesc = request.body.itemDesc;
  if(friendId) {
    Recipe.update({ _id: updateId }, { $push: {friends: { friendid: friendId, friendname: friendUsername } } }, function (error, model) {
        if(error){
          return response.status(500).send(error);
        }
        return response.sendStatus(200);
    });
  } else if(chatText) {
    Recipe.update({ _id: updateId }, { $push: {chat: { chatuser: chatUser, chattext: chatText, chatdate: chatDate } } }, function (error, model) {
        if(error){
          return response.status(500).send(error);
        }
        return response.sendStatus(200);
    });
  } else {
    // {$set: {'ingredients.0': {done:done, ing:itemDesc}}}
    var updateObj = {};
    updateObj['ingredients.'+ingIndex] = {done:done, ing:itemDesc};
    console.log(updateObj);
    Recipe.update({ _id: updateId }, {$set: updateObj}, function (error, model) {
        if(error){
          return response.status(500).send(error);
        }
        return response.sendStatus(200);
    });
  }
});


app.delete('/recipe/:id',function(request, response){
  var removeId = request.params.id;

  Recipe.remove({_id: removeId}, function(error){
    if(error){
      return response.status(500).send(error, model);
    }
    return response.sendStatus(204);
  })
});

app.listen(3333, function(){
  console.log('app is listening');
});
