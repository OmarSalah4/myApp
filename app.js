var express = require('express');
var path = require('path');
var app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
var fs = require('fs');
const { name } = require('ejs');
const { title } = require('process');
const { Console } = require('console');
var app = express();


app.use(session({
  secret: 'yourSecretKey',  // Secret for signing the session ID cookie
  resave: false,  // Don't save the session if it wasn't modified
  saveUninitialized: false,  // Don't create a session until something is stored
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/myDB',  // Your MongoDB URL
    collectionName: 'myCollection',  // Name of the collection to store sessions
    ttl: 14 * 24 * 60 * 60  // Session expiration time in seconds (14 days)
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000  // Cookie expiration time (in milliseconds)
  }
}));
//check if user is logged in function before completing the route
function ensureAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next(); // User is authenticated, proceed to the route
  }
  else{
  return res.redirect('/'); // Redirect to login page if not authenticated
}
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/home' , ensureAuthenticated, function(req,res){
  res.render('home')
});


app.get('/', function (req, res) {
  // Redirect authenticated users to /home
  // if (req.session.isAuthenticated) {
  //   return res.redirect('/home');
  // }
  res.render('login'); // Render login page for unauthenticated users
});

app.get('/login', function (req, res) {
  res.redirect('/'); // Redirect to the main login route
});

app.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/'); // Redirect to login page
  });
});

app.get('/registration' ,function(req,res){
  res.render('registration')
});
app.get('/hiking' , ensureAuthenticated, function(req,res){
  res.render('hiking')
});
app.get('/cities', ensureAuthenticated, function(req,res){
  res.render('cities')
});
app.get('/islands', ensureAuthenticated, function(req,res){
  res.render('islands')
});
app.get('/annapurna', function(req,res){
  console.log(req.query)
  res.render('annapurna', {message: req.query.message || '', messageType: req.query.messageType || ''})
});
app.get('/inca', function(req,res){
  console.log(req.query)
  res.render('inca', {message: req.query.message || '', messageType: req.query.messageType || ''})
});
app.get('/rome', function(req,res){
  console.log(req.query)
  res.render('rome', {message: req.query.message || '', messageType: req.query.messageType || ''})
});
app.get('/paris', function(req,res){
  console.log(req.query)
  res.render('paris', {message: req.query.message || '', messageType: req.query.messageType || ''})
});
app.get('/bali', function(req,res){
  console.log(req.query)
  res.render('bali', {message: req.query.message || '', messageType: req.query.messageType || ''})
});
app.get('/santorini', function(req,res){
  console.log(req.query)
  res.render('santorini', {message: req.query.message || '', messageType: req.query.messageType || ''})
});

app.get('/wanttogo', ensureAuthenticated, async function (req, res) {
  const username = req.session.username;
  let want = [];

  if (!username) {
    return res.status(401).send('Unauthorized: Please log in to view your Want-to-Go list.');
  }

  try {
    // Await the result of the database query
    const user = await db.collection('myCollection').findOne({ Username: username });

    if (user && user.wanttogolist) {
      // Loop through the wanttogolist and push the corresponding data
      for (let i = 0; i < user.wanttogolist.length; i++) {
        if (user.wanttogolist[i] === 'rome') {
          want.push({ name: 'rome', url: '/rome', value: 'rome' });
        }
        if (user.wanttogolist[i] === 'bali') {
          want.push({ name: 'Bali', url: '/bali', value: 'bali' });
        }
        if (user.wanttogolist[i] === 'paris') {
          want.push({ name: 'paris', url: '/paris', value: 'paris' });
        }
        if (user.wanttogolist[i] === 'santorini') {
          want.push({ name: 'santorini', url: '/santorini', value: 'santorini' });
        }
        if (user.wanttogolist[i] === 'annapurna') {
          want.push({ name: 'annapurna', url: '/annapurna', value: 'annapurna' });
        }
        if (user.wanttogolist[i] === 'inca') {
          want.push({ name: 'inca', url: '/inca', value: 'inca' });
        }
      }
    }

    // Render the page with the updated 'want' list
    res.render('wanttogo', { want });
  } catch (err) {
    console.error('Error fetching Want-to-Go list:', err);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/wanttogo', async function (req, res) {

  const { place } = req.body; // The place the user wants to add

  const username = req.session.username; // Retrieve username from session


  if (!username) {

      return res.status(401).send('Unauthorized: Please log in to add to your list.');

  }


  try {

      const user = await db.collection('myCollection').findOne({ Username: username });


      if (!user) {

          return res.status(404).send('User not found.');

      }


      const updatedList = user.wanttogolist || [];

      let message = "";

      let messageType = ""; // success or error


      if (updatedList.includes(place)) {

          // If the place is already in the list, set the error message

          message = `The destination "${place}" is already in your Want-to-Go list.`;

          messageType = "error";

      } else {

          // If the place is not in the list, add it

          updatedList.push(place);

          await db.collection('myCollection').updateOne(

              { Username: username },

              { $set: { wanttogolist: updatedList } }

          );

          message = `The destination "${place}" has been added to your Want-to-Go list successfully.`;

          messageType = "success";

      }


      // Render the same page with the appropriate message

      res.redirect(place+`?message=${message}&messageType=${messageType}`);

    //   , { 

    //     want: updatedList, 

    //     message, 

    //      

    // }


  } catch (err) {

      console.error('Error adding to Want-to-Go list:', err);

      res.status(500).send('Internal Server Error');

  }

});



app.post('/register', async function (req, res) {
  const { username, password } = req.body;

  // Validate input: ensure both username and password are provided
  if (!username || !password) {
    return res.render('registration', { error: 'Both username and password are required' });
  }

  try {
    // Check if the username already exists in the database
    const existingUser = await db.collection('myCollection').findOne({ Username: username });

    if (existingUser) {
      // If the username exists, show an error message
      return res.render('registration', { error: 'This username already exists. Please choose another one.' });
    }

    // Insert the new user into the database
    const result = await db.collection('myCollection').insertOne({
      Username: username,
      Password: password, // Ensure you hash the password in a real app!
      wantToGoList: []
    });

    console.log('User registered:', result);
    res.redirect('/'); // Redirect to login page after successful registration

  } catch (err) {
    // If there's an error during the process, log it and send a 500 error response
    console.error('Error registering user:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/', async function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', { error: 'You should insert both username and password' });
  }

  try {
    // Find user in the database
    const user = await db.collection('myCollection').findOne({ Username: username, Password: password });

    if (user) {
      // Set session variables to track login status
      req.session.isAuthenticated = true;
      req.session.username = username;

      // Redirect to home page after login
      return res.redirect('/home');
    } else {
      // If login fails, render login page with an error
      return res.render('login', { error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).send('Internal Server Error');
  }
});

const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://127.0.0.1:27017', { monitorCommands: true });
const db = client.db("myDB");


db.collection('myCollection').find().toArray(function(err, results) {
  console.log(results)
});

//const { MongoClient } = require('mongodb');
// const client = new MongoClient('mongodb://127.0.0.1:27017', { monitorCommands: true });
// const db = client.db("myDB");

// Predefined destinations to be added
const destinations = [
  { name: 'rome', url: '/rome', type: 'destination' },
  { name: 'paris', url: '/paris', type: 'destination' },
  { name: 'bali', url: '/bali', type: 'destination' },
  { name: 'santorini', url: '/santorini', type: 'destination' },
  { name: 'annapurna', url: '/annapurna', type: 'destination' },
  { name: 'inca', url: '/inca', type: 'destination' }
];

// Function to initialize the destinations in the database
async function initializeDestinations() {
  try {
    const collection = db.collection('myCollection');
    for (const destination of destinations) {
      // Check if the destination already exists
      const existing = await collection.findOne({ name: destination.name, type: 'destination' });
      if (!existing) {
        await collection.insertOne(destination);
        console.log(`Inserted destination: ${destination.name}`);
      }
    }
    console.log('All destinations initialized successfully.');
  } catch (err) {
    console.error('Error initializing destinations:', err);
  }
}

// Connect to the database and initialize destinations
client.connect().then(async () => {
  console.log('Connected to MongoDB');
  await initializeDestinations(); // Initialize destinations
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

module.exports = db; // Export the database object for use in other parts of the app


// Search Functionality
app.post('/search', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.render('searchResults', { searchResults: [], error: 'Please enter a search term' });
  }

  try {
    const sanitizedKeyword = keyword.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
    const destinations = await db.collection('myCollection').find({
      name: { $regex: sanitizedKeyword, $options: 'i' },
      type: 'destination', // Ensure only destinations are searched
    }).toArray();

    if (destinations.length === 0) {
      return res.render('searchResults', { searchResults: [], error: 'Destination not found' });
    }

    const searchResults = destinations.map(dest => ({
      name: dest.name,
      url: dest.url,
    }));

    res.render('searchResults', { searchResults, error: null });
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000);