//Set timer for a spinner
function loadFunction() {
    var delay = setTimeout(showContent, 1000);
}

//Initialize recipe and user objects
var recipe = {test: 'test'};
var user = {};

//main function block
function showContent(){
  //Check if there are cookies stored of a logged in user, set the user object as per cookies
  var logincheck = Cookies.get('username');
  if (logincheck) {
    console.log(logincheck);
    console.log(Cookies.get('id'));
    user.username = Cookies.get('username');
    user.pwd = Cookies.get('pwd');
    user._id = Cookies.get('id');
    user.friends = Cookies.get('friends');
    $('#welcome').html('<p>Welcome '+user.username+'</p>');
    $('.login-btn').removeClass('show');
    $('.register-btn').removeClass('show');
    $('.logout-btn').addClass('show');
    $('.profile-btn').addClass('show');
  }

  //Store the recipe in database if user wants to continue with this recipe
  $(document.body).on('click','#yes-button',function(){
    //obtain the recipe
    var image = recipe.recipe.image_url;
    var ingredients = recipe.recipe.ingredients;
    var ingredientsObj = [];
    var directions = recipe.recipe.source_url;
    var title = recipe.recipe.title;
    var counter = 0;
    //go through the ingredients and
    for (const ing of ingredients) {
      // console.log(ing);
      ingredientsObj.push({ing:ing,done:false});
      counter += 1;
    }
    ingredientsObj = JSON.stringify(ingredientsObj);
    var owner = user._id;
    var ownerName = user.username;
    var recipeId = '';
    // console.log(image, ingredientsObj, directions, title, owner, ownerName);
    console.log(ingredientsObj);
    //send data to server
    $.post("/recipe",
      {
          image: image,
          ingredients: ingredientsObj,
          directions: directions,
          title: title,
          owner: owner,
          ownername: ownerName,
          friends: []
      }).done(function(data){
        console.log(data);
        recipePlan(data);
        addOwner(data, title);
        recipeId = data;
    });
  })

  //Add recipe id to user data owner array
  function addOwner(recipeId, title){
    var data = {
      id: user._id,
      ownerRecipeName: title,
      ownerRecipeId: recipeId
    };
    console.log(data);
    //update the entry with a true boolean
    $.ajax({
      url: '/user',
      type: 'PUT',
      data: data,
      success: function(data) {
        console.log('Recipe added');
      }
    });
  }

  //Show app header
  var headerContent = $('#headerContent');
  headerContent.addClass('show');

  //Generate a random ID between 10000 and 50000 and call the API function
  $(document.body).on('click','.generate-btn',function(event){
    //generate a random recipe id
    var id = Math.floor((Math.random() * 40000) + 10000);
    console.log(id);
    document.getElementById("loader").style.display = "block";
    //call API for request function
    getRecipe(id);
  })

  //hide the recipe gen button and placeholder, unhide control buttons and recipe container
  $(document.body).on('click','.generate-btn',function(event){
    var controlButtons = $('#control-buttons');
    controlButtons.addClass('show');
    var genButton = $('#gen-button');
    genButton.removeClass('show');
    var placeholder = $('.placeholder');
    placeholder.removeClass('show');
  })

  //If user doesn't like the retrieved recipe, generate another random ID and call the API function
  $(document.body).on('click','#no-button',function(event){
    //generate a random recipe id
    var id = Math.floor((Math.random() * 40000) + 10000);
    console.log(id);
    document.getElementById("loader").style.display = "block";
    //call API for request function
    getRecipe(id);
  })

  //Show user registration form
  $(document.body).on('click','.register-btn',function(event){
    var registrationForm = $('#newUser');
    if(!registrationForm.hasClass('show')){
      registrationForm.addClass('show');
    } else {
      registrationForm.removeClass('show');
    }
  });

  //Register new user
  $(document.body).on('submit','#newUser',function(event){
    event.preventDefault();
    var username = $('#username').val();
    var pwd = $('#pwd').val();
    $.post("/user",
      {
          username: username,
          pwd: pwd,
          friends: [],
          owner: [],
          recipeFriend: []
      });
    var registrationForm = $('#newUser');
    registrationForm.removeClass('show');
    $('#username').val('');
    $('#pwd').val('');
    $('<div id="message"><h2>You are now registered. Please log in.</h2></div>').prependTo('body');
    setTimeout(hidemessage, 2000);
    function hidemessage(){
      $('#message').hide();
    }
  });

  //Show login form
  $(document.body).on('click','.login-btn',function(event){
    var loginForm = $('#login');
    if(!loginForm.hasClass('show')){
      loginForm.addClass('show');
    } else {
      loginForm.removeClass('show');
    }
  });

  //Obtain login input, check against database and set Cookies if correct
  $(document.body).on('submit','#login',function(event){
    event.preventDefault();
    var userdata = {};
    var username = $('#loginusername').val();
    console.log(username);
    var pwd = $('#loginpwd').val();
    var url = '/user/'+username;
    console.log(url, pwd);
    //Get user data from server
    $.ajax({
      url: url
    }).done(function(response){
      console.log(response);
      userdata = response['0'];
      pwdcheck(userdata);
    });
    function pwdcheck(userdata){
      if (userdata.pwd !== pwd) {
        alert('Wrong password!');
      } else {
        user = userdata;
        Cookies.set('username', user.username);
        Cookies.set('pwd', user.pwd);
        Cookies.set('id', user._id);
        Cookies.set('friends', user.friends);
        console.log(user.username, ' has logged in');
        $('#welcome').html('<p>Welcome '+user.username+'</p>');
        $('.login-btn').removeClass('show');
        $('.register-btn').removeClass('show');
        $('.logout-btn').addClass('show');
        $('.profile-btn').addClass('show');
      }
    }
    var loginForm = $('#login');
    loginForm.removeClass('show');
    $('#username').val('');
    $('#pwd').val('');
  });

  //Log user out
  $(document.body).on('click','.logout-btn',function(event){
    Cookies.remove('username');
    Cookies.remove('pwd');
    Cookies.remove('id');
    $('.login-btn').addClass('show');
    $('.register-btn').addClass('show');
    $('.logout-btn').removeClass('show');
    $('.profile-btn').removeClass('show');
    $('#welcome').html('');
    location.reload();
  });

  //View user profile
  $(document.body).on('click','.profile-btn',function(event){
    $('#gen-button').removeClass('show');
    $('#control-buttons').removeClass('show');
    $('.placeholder').removeClass('show');
    $('#target').addClass('show');
    var username = user.username;
    var url = '/user/'+username;
    $.ajax({
      url: url
    }).done(function(response){
      console.log(response);
      var userdata = response['0'];
      var rendertarget = $('#target');
      var source = $('#profile-template').html();
      var templ = Handlebars.compile(source);
      var newHTML = templ(userdata);
      rendertarget.html(newHTML);
    });
  });

  $(document.body).on('click','.profile-owner-line',function(event){
    let recipeId = this.id;
    console.log(recipeId);
    recipePlan(recipeId);
  });

  //Expand friend finder form
  $(document.body).on('click','#profileAddFriends',function(event){
    $('#addFriendForm').toggleClass('show');
  });


  //Search for usernames in database so that user can add them as friends
  $(document.body).on('submit','#addFriendForm',function(event){
    event.preventDefault();
    var searchname = $('#friendUsername').val();
    var url = '/user/'+searchname;
    $.ajax({
      url: url
    }).done(function(response){
      console.log(response);
      console.log(Object.keys(response).length);
      if(Object.keys(response).length === 0) {
        $('#friendSearchNo').html('Nothing found');
        $('#friendSearchNo').addClass('show');
        $('#friendSearchResult').removeClass('show');
      } else {
        $('#friendResultLine').html(response['0'].username);
        $('#friendSearchResult').addClass('show');
        $('#friendSearchNo').removeClass('show');
      }
    });
    $('#friendUsername').val('');
  });

  //Update user records with the friend details
  $(document.body).on('click','#addFriendResult',function(event){
    var addfriendname = $('#friendResultLine').html();
    var url = '/user/'+addfriendname;
    $.ajax({
      url: url
    }).done(function(response){
      console.log(user.username+' will add '+response['0'].username+' as a friend');

      var data = {
        id: user._id,
        friendid: response['0']._id,
        username: response['0'].username
      };
      console.log(data);
      //update the entry with a true boolean
      $.ajax({
        url: '/user',
        type: 'PUT',
        data: data,
        success: function(data) {
          console.log('Friend added');
          $('.profile-btn').click();
        }
      });
    });
  });

  //Update the database when product is ticket as bought
  $(document.body).on('click','#itemDone',function(){
    let recipeId = this.parentNode.parentNode.parentNode.getAttribute('data-recipeid');
    let ingIndex = this.getAttribute('data-index');
    let itemDesc = this.getAttribute('data-item');
    var data = {
      id: recipeId,
      ingIndex: ingIndex,
      done: true,
      itemDesc: itemDesc
    };
    console.log(data);
    //update the entry with a true boolean
    $.ajax({
      url: '/recipe',
      type: 'PUT',
      data: data,
      success: function(data) {
        console.log('Item ticket as bought');
        recipePlan(recipeId);
      }
    });
  });

  //Refresh the recipe
  $(document.body).on('click','#refreshRecipe',function(){
    let recipeId = this.getAttribute('data-recipe');
    recipePlan(recipeId);
  });

  //Show or hide drop down to add friends to recipe
  $(document.body).on('click','#recipeAddFriends',function(){
    let target = $('.friend-pick-line');
    $(target).toggleClass('show');
  });

  //Add picked friend to recipe friend list
  $(document.body).on('click','.friend-pick-line',function(){
    //Obtain data to be passed to recipe put request
    let addFriendId = this.id;
    let addFriendName = this.getAttribute('data-friend');
    let recipeId = this.getAttribute('data-recipe');
    console.log(addFriendId+' with name of '+addFriendName+' will be added to '+recipeId);
    //Create data object
    var data = {
      id: recipeId,
      addFriendName: addFriendName,
      addFriendId: addFriendId
    };
    console.log(data);
    //update the recipe record with added friend
    $.ajax({
      url: '/recipe',
      type: 'PUT',
      data: data,
      success: function(data) {
        console.log('Friend added to recipe');
      }
    });
    //Obtain data to be passed to put request to update user
    let userId = this.id;
    let friendRecipeName = this.getAttribute('data-title');
    let friendRecipeId = this.getAttribute('data-recipe');
    console.log(friendRecipeName+' will be added to '+userId);
    //Create data object
    var userdata = {
      id: userId,
      friendRecipeName: friendRecipeName,
      friendRecipeId: friendRecipeId
    };
    // console.log(data);
    //update the entry with a true boolean
    $.ajax({
      url: '/user',
      type: 'PUT',
      data: userdata,
      success: function(data) {
        console.log('Recipe added to user friend recipe list');
      }
    });
    recipePlan(recipeId);
  });

  $(document.body).on('submit','#chatBox',function(event){
    event.preventDefault();
    let chatText = $('#chatInput').val();
    let recipeId = this.getAttribute('data-recipeid');
    let chatUser = user.username;
    console.log(chatUser+' says: '+chatText);
    $('#chatInput').val('');
    var data = {
      id: recipeId,
      chatText: chatText,
      chatUser: chatUser
    };
    console.log(data);
    //update the recipe record with added friend
    $.ajax({
      url: '/recipe',
      type: 'PUT',
      data: data,
      success: function(data) {
        console.log('Chat message sent');
      }
    });
    recipePlan(recipeId, 'yes');
  });

  //Get a recipe from Food2fork API based on pregenerated ID
  function getRecipe(id){
    var recipeUrl = "http://food2fork.com/api/get?key=19b9f7e3df065a89d6f1f874374989a3&rId="+id;
    // var userurl = '//api.github.com/users/' + user;
    $.ajax({
      url: recipeUrl,
    }).done(function(response){
      console.log(JSON.parse(response));
      recipe = JSON.parse(response);
      var rendertarget = $('#target');
      var source = $('#recipe-template').html();
      var templ = Handlebars.compile(source);
      var newHTML = templ(recipe);
      rendertarget.html(newHTML);
      var recipeContainer = $('#show-recipe');
      recipeContainer.addClass('show');
      document.getElementById("loader").style.display = "none";
    })
  }

  //Get recipe details from database and pass them to handlebars
  function recipePlan(id, scroll){
    var url = '/recipe/'+id;
    $.ajax({
      url: url
    }).done(function(response){
      console.log(response);
      var recipeData = response['0'];
      // recipeData.ingredients = JSON.parse(recipeData.ingredients);
      var rendertarget = $('#target');
      var source = $('#recipePlan-template').html();
      var templ = Handlebars.compile(source);
      var newHTML = templ(recipeData);
      rendertarget.html(newHTML);
      addFriendPick(recipeData._id, recipeData.title);
      hideFriendPick(recipeData.ownername);
      if(scroll === 'yes'){
        $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
      }
      let chatList = $('#chatList');
      if(recipeData.chat.length !== 0){
        // console.log(recipeData.chat)
        var height = chatList[0].scrollHeight;
        chatList.scrollTop(height);
      }
    });
    $('#control-buttons').removeClass('show');
  }

  function addFriendPick(recId, recTitle){
    let target = $('#recipeFriendTarget');
    var url = '/user/'+user.username;
    $.ajax({
      url: url
    }).done(function(response){
        let userFriends = response['0'].friends;
        console.log(userFriends, userFriends.length);
        for (i=0; i<userFriends.length; i++){
          $('<div data-title="'+recTitle+'" data-friend="'+userFriends[i].friendname+'" data-recipe="'+recId+'" id="'+userFriends[i].friendid+'" class="friend-pick-line collapse"><a href="#"><li class="list-group-item">'+userFriends[i].friendname+'<button class="btn-success recipe-friendpick-add">Add Friend</button></li></a></div>').appendTo(target);
        }
    });
  }

  function hideFriendPick(owner){
    let currentUser = user.username;
    if(currentUser !== owner){
      $('#recipeAddFriends').hide();
    }
  }

  //hide the spinner
  document.getElementById("loader").style.display = "none";
}
