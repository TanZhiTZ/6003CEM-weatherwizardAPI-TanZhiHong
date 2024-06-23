const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const db = "mongodb+srv://admin:123@tancluster.ipi5sgu.mongodb.net/WebAPI";

// Connect to MongoDB
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Define the schema and model for the form data
const userDataSchema = new mongoose.Schema({
    Email: String,
    Password: String,
    Country: String,
    Favorites: [String],
});

// Pre-save hook to hash the password before saving it
userDataSchema.pre('save', async function(next) {
  if (!this.isModified('Password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userDataSchema);

// API endpoint to handle registration and login
app.post('/register', async (req, res) => {
  try {
    const { email, password, location } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ Email: email });

    if (existingUser) {
      // Compare the provided password with the stored password
      const isMatch = await bcrypt.compare(password, existingUser.Password);
      if (isMatch) {
        return res.status(200).json({ message: 'Login Successful' });
      } else {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
    } else {
      // Create a new user
      const newUser = new User({ Email: email, Password: password, Country: location });
      await newUser.save();
      res.status(201).send('User registered successfully');
    }
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// API endpoint to get user country by email
app.get('/getUserCountry', async (req, res) => {
  try {
    const { email } = req.query;

    // Find the user by email
    const user = await User.findOne({ Email: email });

    if (user) {
      res.status(200).json({ country: user.Country });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).send('Error fetching user country: ' + error.message);
  }
});

// API endpoint to add a favorite country
app.post('/add-favorite', async (req, res) => {
  try {
    const { email, country } = req.body;

    const user = await User.findOne({ Email: email });

    if (user) {
      if (!user.Favorites.includes(country)) {
        user.Favorites.push(country);
        await user.save();
        return res.status(200).json({ message: 'Favorite added successfully' });
      } else {
        return res.status(400).json({ message: 'Country already in favorites' });
      }
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).send('Error adding favorite: ' + error.message);
  }
});

// API endpoint to get user favorites by email
app.get('/get-favorites', async (req, res) => {
  try {
    const { email } = req.query;

    // Find the user by email
    const user = await User.findOne({ Email: email });

    if (user) {
      res.status(200).json({ favorites: user.Favorites });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).send('Error fetching user favorites: ' + error.message);
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
