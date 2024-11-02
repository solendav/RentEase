const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Chapa = require("chapa");
const User = require("./models/user"); // Assuming schemas are in the same directory
const Property = require("./models/property");
const Booking = require("./models/booking");
const Profile = require("./models/profile");
const Account = require("./models/Account");
const Favorite = require("./models/favorite");
const Transaction = require("./models/transaction");
const Review = require("./models/review");
const Frozen_Deposit = require("./models/frozen_deposit");
const app = express();
const port = 8000;
const key_api = "CHASECK_TEST-4fF97ZiutAKHS4ZvkTFjKucoHyWlDSSd";
const myChapa = new Chapa(key_api);
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config();

// Set up multer for file uploads with unique filenames and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

// Define the multer instance with the storage and fileFilter configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Define valid field names for different types of uploads
    const validProfileFields = ["profile_picture", "id_image"];
    const validPropertyFields = ["image"];

    // Check if the field name is valid and the file type is an image
    if (
      validProfileFields.includes(file.fieldname) ||
      validPropertyFields.includes(file.fieldname)
    ) {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"), false);
      }
    } else {
      cb(new Error("Invalid field name"), false);
    }
  },
});

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins; adjust as needed
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const uri =
  "mongodb+srv://solomondawit807:solen@cluster1.ghzhuq8.mongodb.net/rentingService";
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Error connecting to MongoDB", error));

// Define the User schema

// Define the Property model

// Endpoint to add a property
app.post("/addProperty", upload.array("image", 10), async (req, res) => {
  try {
    const {
      property_name,
      description,
      price,
      quantity,
      category,
      status,
      user_id,
      latitude,
      longitude,
      address,
    } = req.body;

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude or longitude value." });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res
        .status(400)
        .json({ message: "Latitude or longitude out of bounds." });
    }

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const image = req.files ? req.files.map((file) => file.filename) : [];

    const newProperty = new Property({
      property_id: uuidv4(),
      property_name,
      image, // Store multiple images
      description,
      price,
      quantity,
      location: { latitude: lat, longitude: lon },
      category,
      status: status === "true",
      user_id,
      address,
    });

    await newProperty.save();
    res
      .status(201)
      .json({ message: "Property saved successfully", property: newProperty });
  } catch (error) {
    console.error("Error registering property:", error);
    res
      .status(500)
      .json({ message: "Failed to add property", error: error.message });
  }
});

// Endpoint to fetch all properties
app.get("/properties", async (req, res) => {
  try {
    // Fetch properties that have verification set to "verified"
    const properties = await Property.find({ verification: "verified" });
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to retrieve properties" });
  }
});

// Add this if you need to handle new arrivals specifically
app.get("/properties/new-arrival", async (req, res) => {
  try {
    // Fetch properties that are newly arrived
    const properties = await Property.find({ verification: "verified" }).sort({
      createdAt: -1,
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching new arrival properties:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve new arrival properties" });
  }
});

// Handle location-based property search
app.get("/properties/nearby", async (req, res) => {
  const { lat, lng } = req.query;
  try {
    // Ensure lat and lng are provided
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "Latitude and Longitude are required" });
    }

    // Parse latitude and longitude to floats
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Ensure that latitude and longitude are valid numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    // Fetch all verified properties
    const properties = await Property.find({ verification: "verified" });

    // Calculate distance and filter properties within 20 km radius
    const nearbyProperties = properties
      .map((property) => {
        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          property.location.latitude,
          property.location.longitude
        );
        return { ...property._doc, distance }; // Attach distance to property object
      })
      .filter((property) => property.distance <= 20) // Filter properties within 20 km
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    res.status(200).json(nearbyProperties);
  } catch (error) {
    console.error("Error fetching nearby properties:", error);
    res.status(500).json({ message: "Failed to retrieve nearby properties" });
  }
});

// Function to calculate distance between two coordinates
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Function to convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Backend route to get property details
app.get("/properties/:_id", async (req, res) => {
  const { _id } = req.params; // Destructure _id from req.params
  try {
    console.log("Received request for property _id:", _id); // Log the _id received

    // Fetch property by _id only if it is verified
    const property = await Property.findOne({ _id, verification: "verified" });

    if (!property) {
      console.log("Property not found or not verified with ID:", _id);
      return res
        .status(404)
        .json({ message: "Property not found or not verified" });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Failed to retrieve property details" });
  }
});

// Endpoint to get properties by category
app.get("/properties/:category", async (req, res) => {
  const { category } = req.params; // Get category from URL parameters

  try {
    console.log("Received request for category:", category); // Log the category received

    const properties = await Property.find({
      category,
      verification: "verified",
    });

    if (properties.length === 0) {
      console.log("No properties found for category:", category);
      return res
        .status(404)
        .json({ message: "No properties found for this category" });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to retrieve properties" });
  }
});
app.get("/api/properties/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("User ID:", userId); // Log the user ID
    const properties = await Property.find({
      user_id: userId,
      verification: "verified",
    });
    console.log("Properties:", properties); // Log the fetched properties
    res.json(properties);
  } catch (err) {
    console.error(err); // Log the full error
    res.status(500).json({ message: "Server error" });
  }
});
// Backend route to get user details
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  // Validate if id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Failed to retrieve user details" });
  }
});

app.post(
  "/api/profile",
  upload.fields([{ name: "profile_picture" }, { name: "id_image" }]),
  async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      console.log("Uploaded Files:", req.files);
      const {
        user_id,
        first_name,
        middle_name,
        last_name,
        phoneNumber,
        address,
        birth_date,
      } = req.body;

      // Retrieve the paths of uploaded files
      const profilePicturePath = req.files["profile_picture"]
        ? req.files["profile_picture"][0].filename
        : null;
      const idImagePath = req.files["id_image"]
        ? req.files["id_image"][0].filename
        : null;

      // Validate required fields
      if (
        !user_id ||
        !first_name ||
        !last_name ||
        !phoneNumber ||
        !address ||
        !birth_date
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Validate date format
      const birthDate = new Date(birth_date);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ message: "Invalid birth date format." });
      }

      // Check if a profile with the given user_id already exists
      let profile = await Profile.findOne({ user_id });

      if (profile) {
        // Update existing profile
        profile.first_name = first_name;
        profile.middle_name = middle_name;
        profile.last_name = last_name;
        profile.phoneNumber = phoneNumber;
        profile.address = address;
        profile.birth_date = birthDate.toISOString();
        if (profilePicturePath) profile.profile_picture = profilePicturePath;
        if (idImagePath) profile.id_image = idImagePath;

        await profile.save();
        res
          .status(200)
          .json({ message: "Profile updated successfully", profile });
      } else {
        // Create new profile
        const newProfile = new Profile({
          user_id,
          first_name,
          middle_name,
          last_name,
          phoneNumber,
          address,
          birth_date: birthDate.toISOString(),
          profile_picture: profilePicturePath,
          id_image: idImagePath,
        });

        await newProfile.save();
        res.status(201).json({
          message: "Profile created successfully",
          profile: newProfile,
        });
      }
    } catch (error) {
      console.error("Error handling profile:", error);
      res
        .status(500)
        .json({ message: "Failed to handle profile", error: error.message });
    }
  }
);

app.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send("Booking not found");
    res.json(booking);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ approval: "accepted" });

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings with accepted approval found." });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Corrected endpoint to fetch bookings by tenant_id
app.get("/api/bookings/tenant/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ tenant_id: userId });
    if (!bookings) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});

app.patch("/bookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { approval } = req.body;
    // Update the booking in the database
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { approval },
      { new: true }
    );
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error });
  }
});
app.delete("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the booking by ID and delete it
    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Booking canceled successfully!" });
  } catch (error) {
    console.error("Error canceling the booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const { start_date, end_date, total_price } = req.body;

  try {
    // Validate input
    if (!start_date || !end_date || !total_price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find and update the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.start_date = start_date;
    booking.end_date = end_date;
    booking.totalPrice = total_price;
    await booking.save();

    // Optionally, update the property if needed
    const property = await Property.findById(booking.property_id);
    if (property) {
      // Perform any necessary updates to the property if required
      // For example, you might want to recalculate availability
    }

    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/profile/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profiles = await Profile.find({
      user_id: userId,
      verification: "verified",
    });
    if (!profiles) {
      return res.status(404).json({ message: "No profiles found" });
    }
    res.json(profiles);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});

//for Editing
app.get("/api/bookings/owner/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ owner_id: userId, status: "booked" });
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});
app.get("/accounts/details/:accountNo", async (req, res) => {
  try {
    const { accountNo } = req.params;

    // Fetch account details from the database
    const account = await Account.findOne({ account_no: accountNo }).exec();

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Respond with the account details
    res.status(200).json(account);
  } catch (error) {
    console.error("Error fetching account details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/account/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
  } catch (error) {
    console.error("Error fetching account details", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching account details" });
  }
});
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({
      user_id: userId,
      verification: "verified",
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile details", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching profile details" });
  }
});
// In your backend code

app.post("/api/verify-account-password/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    console.log("userid", userId);
    console.log("password", password);
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const match = await bcrypt.compare(password, account.password);
    if (match) {
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (err) {
    console.error("Password verification error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/change-password/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Ensure new password and confirmation match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Find account by userId
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Compare old password with the stored password
    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Generate salt and hash the new password

    // Update the account with the new hashed password
    account.password = newPassword;
    await account.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password", error);
    res
      .status(500)
      .json({ error: "An error occurred while changing password" });
  }
});

//payment
app.get("/tran/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/transactionsnotification", async (req, res) => {
  try {
    const { userId, accountNo } = req.query;

    if (!userId || !accountNo) {
      return res
        .status(400)
        .json({ message: "User ID and Account Number are required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    // Log the received parameters
    console.log("Received parameters:", { userId, accountNo });

    // Fetch transactions with correct usage of ObjectId
    const transactions = await Transaction.find({
      $or: [
        { user_id: new mongoose.Types.ObjectId(userId) }, // Ensure new keyword
        { toAccountNo: accountNo },
      ],
      seen: false,
    });

    res.json(transactions);
  } catch (error) {
    console.error("Error in /api/transactionsnotification endpoint:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.patch("/transactions/:transactionId/update-seen", async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Set 'seen' field to true
    transaction.seen = true;

    // Save the updated transaction
    await transaction.save();

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error updating the transaction:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

app.post("/api/transfer", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fromAccountNo, amount, bookingId, toAccountNo } = req.body;
    console.log("Request Body:", req.body);

    let totalPrice = 0; // Define totalPrice globally

    // Validate Input
    if (!fromAccountNo || !amount || !toAccountNo || !bookingId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    // Find the From Account
    const fromAccount = await Account.findOne({
      account_no: fromAccountNo,
    }).session(session);
    if (!fromAccount) {
      console.error(`From Account not found: ${fromAccountNo}`);
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: `From account ${fromAccountNo} not found` });
    }

    // Find the To Account
    const toAccount = await Account.findOne({
      account_no: toAccountNo,
    }).session(session);
    if (!toAccount) {
      console.error(`To Account not found: ${toAccountNo}`);
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: `To account ${toAccountNo} not found` });
    }

    // Handle Booking
    if (bookingId) {
      try {
        const booking = await Booking.findById(bookingId).session(session);

        if (!booking) {
          console.error(`Booking not found: ${bookingId}`);
          await session.abortTransaction();
          session.endSession();
          return res
            .status(404)
            .json({ message: `Booking ${bookingId} not found` });
        }

        totalPrice = booking.totalPrice; // Assign the value to global totalPrice
        console.log("Total price:", totalPrice);

        // Check if the total price is less than the available amount
        if (amount < totalPrice) {
          console.error("Insufficient amount for booking transfer.");
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Amount is less than the total price",
            alert: "Insufficient funds in your balance account.",
          });
        }

        // Calculate remaining amount
        const remainingAmount = amount - totalPrice;

        // Check Balance
        if (fromAccount.balance < totalPrice) {
          console.error("Insufficient funds for booking transfer.");
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Insufficient funds",
            alert: "Insufficient funds in your balance account.",
          });
        }

        // Update Account Balances
        fromAccount.balance -= totalPrice;
        toAccount.balance += totalPrice;

        // Save Updates
        await fromAccount.save({ session });
        await toAccount.save({ session });

        // Log Balance After Booking Transfer
        console.log(
          "From Account Balance After Booking Transfer:",
          fromAccount.balance
        );
        console.log(
          "To Account Balance After Booking Transfer:",
          toAccount.balance
        );

        // Update Booking Status
        await Booking.findByIdAndUpdate(
          bookingId,
          { status: "booked" },
          { session }
        );

        // Update Property Quantity
        const property = await Property.findById(booking.property_id).session(
          session
        );
        if (property.quantity > 0) {
          property.quantity -= 1;
          await property.save({ session });
        } else {
          console.error("Property quantity is insufficient.");
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Property quantity is insufficient",
            alert: "Insufficient property Quantity please try again later.",
          });
        }

        // Transfer Remaining Amount to Fixed Account
        const fixedAccountNo = "8524438486"; // Fixed account number for remaining amount
        const fixedAccount = await Account.findOne({
          account_no: fixedAccountNo,
        }).session(session);

        if (!fixedAccount) {
          console.error(`Fixed account not found: ${fixedAccountNo}`);
          await session.abortTransaction();
          session.endSession();
          return res
            .status(404)
            .json({ message: `Fixed account ${fixedAccountNo} not found` });
        }

        if (remainingAmount > 0) {
          if (fromAccount.balance < remainingAmount) {
            console.error("Insufficient funds for remaining amount transfer.");
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              message: "Insufficient funds",
              alert: "Insufficient funds in your balance account.",
            });
          }

          // Update Account Balances
          fromAccount.balance -= remainingAmount;
          fixedAccount.balance += remainingAmount;

          // Save Updates
          await fromAccount.save({ session });
          await fixedAccount.save({ session });

          // Log Balance After Remaining Amount Transfer
          console.log(
            "From Account Balance After Remaining Transfer:",
            fromAccount.balance
          );
          console.log(
            "Fixed Account Balance After Transfer:",
            fixedAccount.balance
          );

          // Add Transaction Record for Remaining Amount Transfer
          const remainingTransaction = new Transaction({
            user_id: fromAccount.user_id,
            fromAccountNo: fromAccount.account_no,
            toAccountNo: fixedAccount.account_no,
            amount: remainingAmount,
            type: "service_fee",
            tx_ref: uuidv4(), // Unique transaction reference
          });

          await remainingTransaction.save({ session });
        }
      } catch (error) {
        console.error(
          "Error updating booking status or property quantity:",
          error
        );
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "Error updating booking status or property quantity",
        });
      }
    }

    if (fromAccount.deposit < totalPrice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Insufficient funds",
        alert: "Insufficient funds in your deposit account.",
      });
    }

    fromAccount.deposit -= totalPrice;

    // Create or Update Frozen Deposit Entry
    let frozenDeposit = await Frozen_Deposit.findOne({
      account_id: fromAccount._id,
      booking_id: bookingId,
    }).session(session);

    if (!frozenDeposit) {
      frozenDeposit = new Frozen_Deposit({
        account_id: fromAccount._id,
        booking_id: bookingId,
        frozen_amount: 0,
        status: "frozen",
      });
    }

    frozenDeposit.frozen_amount += totalPrice; // Using global totalPrice here
    await frozenDeposit.save({ session });
    await fromAccount.save({ session });

    // Add Transaction Record for Booking Transfer
    const transaction = new Transaction({
      user_id: fromAccount.user_id,
      fromAccountNo: fromAccountNo,
      toAccountNo: toAccountNo,
      amount: totalPrice, // Using global totalPrice here
      type: "transfer",
      tx_ref: uuidv4(), // Unique transaction reference
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Transfer successful",
      balance: fromAccount.balance,
    });
  } catch (error) {
    console.error("Error during transfer:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Transfer failed" });
  }
});

// In your Express server file
app.post("/api/transfer-from-frozen", async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    // Find the Frozen Deposit entry
    const frozenDeposit = await Frozen_Deposit.findOne({
      booking_id: bookingId,
      status: "frozen",
    });

    if (!frozenDeposit) {
      return res.status(404).json({ message: "Frozen deposit not found" });
    }

    // Find the corresponding Account entry
    const account = await Account.findOne({
      _id: frozenDeposit.account_id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Transfer amount from frozen deposit to deposit field
    account.deposit += frozenDeposit.frozen_amount;
    frozenDeposit.frozen_amount = 0;
    frozenDeposit.status = "released";

    // Save updates
    await account.save();
    await frozenDeposit.save();

    res.status(200).json({
      message: "Amount transferred from frozen deposit to account deposit",
    });
  } catch (error) {
    console.error("Error during transfer from frozen deposit:", error);
    res
      .status(500)
      .json({ message: "Failed to transfer amount from frozen deposit" });
  }
});

//end 0f transfer

app.post("/deposit", async (req, res) => {
  try {
    const tx_ref = uuidv4();
    const { userId, amount } = req.body;
    console.log("Received deposit request:", req.body);

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    let account = await Account.findOne({ user_id: userId });

    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user_id: userId });

    if (!user || !profile) {
      return res.status(404).json({ message: "User or Profile not found" });
    }

    const customerInfo = {
      amount: amount.toString(),
      currency: "ETB",
      email: user.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      account_no: account.account_no,
      tx_ref,
      callback_url: "https://www.google.com/callback",
      customization: {
        title: "Deposit",
        description: "Deposit to your account",
      },
    };

    console.log("Customer Info:", customerInfo);

    const chapaResponse = await myChapa.initialize(customerInfo);
    console.log("Chapa Response:", chapaResponse);

    if (chapaResponse.status !== "success") {
      return res.status(500).json({ message: "Failed to initiate deposit" });
    }

    // Update the account balance
    account.balance += parseFloat(amount);
    await account.save();

    // Store the transaction in the database
    const transaction = new Transaction({
      user_id: userId,
      type: "deposit",
      amount: parseFloat(amount),
      tx_ref: tx_ref,
      status: "completed", // Assuming the deposit was successful
      payment_url: chapaResponse.data.checkout_url,
      payment_provider: "Chapa", // Replace with actual provider name if different
    });

    await transaction.save();

    res.status(200).json({
      payment_url: chapaResponse.data.checkout_url,
      balance: account.balance,
    });
  } catch (error) {
    console.error("Deposit Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Payment success callback
app.post("/payment/success", async (req, res) => {
  const { tx_ref, status } = req.body;
  if (status === "success") {
    try {
      const transaction = await Transaction.findOne({ tx_ref });
      if (!transaction)
        return res.status(404).json({ message: "Transaction not found" });

      const user = await User.findOne({ user_id: transaction.user_id });
      if (!user) return res.status(404).json({ message: "User not found" });

      user.balance += transaction.amount;
      await user.save();

      transaction.status = "completed";
      await transaction.save();

      res.status(200).json({ message: "Deposit successful" });
    } catch (error) {
      console.error("Payment Success Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(400).json({ message: "Payment failed" });
  }
});
// Withdraw funds
// Import your Transaction model

app.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount, paymentGateway } = req.body;
    console.log("Received withdraw request:", req.body);

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found for this user" });
    }

    if (account.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user_id: userId });

    if (!user || !profile) {
      return res.status(404).json({ message: "User or Profile not found" });
    }

    const withdrawResponse = await initiateWithdrawal(
      paymentGateway,
      userId,
      amount,
      user,
      profile,
      account
    );

    if (withdrawResponse.status !== "success") {
      return res.status(500).json({ message: "Failed to initiate withdrawal" });
    }

    // Update the account balance
    account.balance -= amount;
    await account.save();

    // Store the transaction in the database
    const transaction = new Transaction({
      user_id: userId,
      type: "withdrawal",
      amount: parseFloat(amount),
      tx_ref: withdrawResponse.tx_ref,
      status: "completed", // Assuming the withdrawal was successful
      payment_provider: paymentGateway, // e.g., 'Chapa', 'PayPal'
      payment_url: withdrawResponse.payment_url, // Store the payment URL
    });

    await transaction.save();

    res.status(200).json({
      message: "Withdrawal request submitted",
      balance: account.balance,
      payment_url: withdrawResponse.payment_url,
    });
  } catch (error) {
    console.error("Withdrawal Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const initiateWithdrawal = async (
  paymentGateway,
  userId,
  amount,
  user,
  profile,
  account
) => {
  const tx_ref = uuidv4();

  const customerInfo = {
    amount: amount.toString(),
    currency: "ETB",
    email: user.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    account_no: account.account_no,
    tx_ref,
    callback_url: "https://www.google.com/callback",
    customization: {
      title: "Withdrawal",
      description: "Withdrawal from your account",
    },
  };

  const chapaResponse = await myChapa.initialize(customerInfo);

  if (chapaResponse.status === "success") {
    return {
      status: "success",
      payment_url: chapaResponse.data.checkout_url,
      tx_ref,
    };
  } else {
    return { status: "failure" };
  }
};

// Get balance
app.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the account for the user
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found for this user" });
    }

    res.status(200).json({ balance: account.balance });
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
app.put("/api/account/own-deposit/:userId", async (req, res) => {
  const { userId } = req.params;
  const { transferAmount } = req.body;

  try {
    // Fetch the user's account data
    const account = await Account.findOne({ user_id: userId });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Ensure the transferAmount is a valid number
    const transferAmountFloat = parseFloat(transferAmount);
    const currentAmountFloat = parseFloat(account.balance);

    if (isNaN(transferAmountFloat) || transferAmountFloat <= 0) {
      return res.status(400).json({ error: "Invalid transfer amount" });
    }

    if (currentAmountFloat < transferAmountFloat) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Calculate new balances
    const newAmount = currentAmountFloat - transferAmountFloat;
    const newDeposit = parseFloat(account.deposit) + transferAmountFloat;

    // Update the account data
    account.balance = newAmount;
    account.deposit = newDeposit;

    // Save the updated account data to the database
    await account.save();

    // Log the transaction in the Transaction schema
    const transaction = new Transaction({
      user_id: userId,
      type: "own-deposit",
      amount: transferAmountFloat,
      tx_ref: uuidv4(), // Generate a unique transaction reference
      status: "completed", // Assuming the transfer was successful
    });

    await transaction.save();

    // Send a success response
    res.status(200).json({
      message: "Transfer successful",
      newBalance: account.balance,
      newDeposit: account.deposit,
      transactionId: transaction._id, // Return the transaction ID for reference
    });
  } catch (error) {
    console.error("Error transferring funds:", error);
    res.status(500).json({ error: "Server error during transfer" });
  }
});
app.put("/api/account/deposit-to-balance/:userId", async (req, res) => {
  const { userId } = req.params;
  const { transferAmount } = req.body;

  try {
    // Fetch the user's account data
    const account = await Account.findOne({ user_id: userId });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Ensure the transferAmount is a valid number
    const transferAmountFloat = parseFloat(transferAmount);
    const currentDepositFloat = parseFloat(account.deposit);

    if (isNaN(transferAmountFloat) || transferAmountFloat <= 0) {
      return res.status(400).json({ error: "Invalid transfer amount" });
    }

    if (currentDepositFloat < transferAmountFloat) {
      return res.status(400).json({ error: "Insufficient funds in deposit" });
    }

    // Calculate new balances
    const newDeposit = currentDepositFloat - transferAmountFloat;
    const newBalance = parseFloat(account.balance) + transferAmountFloat;

    // Update the account data
    account.deposit = newDeposit;
    account.balance = newBalance;

    // Save the updated account data to the database
    await account.save();

    // Log the transaction in the Transaction schema
    const transaction = new Transaction({
      user_id: userId,
      type: "deposit-to-balance",
      amount: transferAmountFloat,
      tx_ref: uuidv4(), // Generate a unique transaction reference
      status: "completed", // Assuming the transfer was successful
    });

    await transaction.save();

    // Send a success response
    res.status(200).json({
      message: "Transfer successful",
      newBalance: account.balance,
      newDeposit: account.deposit,
      transactionId: transaction._id, // Return the transaction ID for reference
    });
  } catch (error) {
    console.error("Error transferring funds:", error);
    res.status(500).json({ error: "Server error during transfer" });
  }
});

// using Tenant_id
const generateUniqueAccountNo = async () => {
  let accountNo;
  let isUnique = false;

  while (!isUnique) {
    accountNo = (
      Math.floor(Math.random() * 9000000000) + 1000000000
    ).toString();
    const existing = await Account.findOne({ account_no: accountNo });

    if (!existing) {
      isUnique = true;
    }
  }

  return accountNo;
};
//favorite
app.post("/favorites", async (req, res) => {
  try {
    const { property_id, user_id } = req.body;

    // Check if the favorite record already exists
    let favorite = await Favorite.findOne({ property_id, user_id });

    if (favorite) {
      // Update the existing favorite record to set liked to true
      favorite.liked = true;
      await favorite.save();
    } else {
      // Create a new favorite record with liked set to true
      favorite = new Favorite({ property_id, user_id, liked: true });
      await favorite.save();
    }

    res.status(200).json(favorite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/favorites/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find all favorite records for the user
    const favorites = await Favorite.find({ user_id, liked: true });

    // Extract property details from favorites
    const favoriteProperties = await Promise.all(
      favorites.map(async (favorite) => {
        const property = await Property.findById(favorite.property_id);
        return {
          ...property.toObject(),
          liked: favorite.liked,
          favoriteId: favorite._id,
        }; // Include favoriteId
      })
    );

    res.status(200).json(favoriteProperties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/favorites/:userId/:propertyId", async (req, res) => {
  try {
    const { userId, propertyId } = req.params;

    // Find the favorite entry for the given user and property
    const favorite = await Favorite.findOne({
      user_id: userId,
      property_id: propertyId,
    });

    if (favorite) {
      return res.status(200).json({ liked: favorite.liked });
    } else {
      return res.status(404).json({ message: "Favorite not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.delete("/favorites/:userId/:propertyId", async (req, res) => {
  try {
    const { userId, propertyId } = req.params;

    // Delete the favorite entry
    const result = await Favorite.deleteOne({
      user_id: userId,
      property_id: propertyId,
    });

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .json({ status: "success", message: "Favorite removed successfully." });
    } else {
      return res.status(404).json({ message: "Favorite not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
app.delete("/favorites/:favoriteId", async (req, res) => {
  const { favoriteId } = req.params;

  try {
    // Find the favorite and update the liked status to false
    const favorite = await Favorite.findById(favoriteId);
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    // Update the liked status to false
    favorite.liked = false;
    await favorite.save();

    // Delete the favorite entry
    await Favorite.findByIdAndDelete(favoriteId);

    res
      .status(200)
      .json({ message: "Favorite removed and status updated to false" });
  } catch (error) {
    console.error("Error updating and deleting favorite:", error);
    res.status(500).json({ message: "Failed to update and delete favorite" });
  }
});
// Sign-Up Endpoint
// Sign-Up Endpoint
async function sendVerificationEmail(email, verificationCode) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("Email User:", process.env.EMAIL_USER);
  console.log("Email Pass:", process.env.EMAIL_PASS);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Account Verification",
    text: `Your verification code is: ${verificationCode}`, // Use backticks for template literals
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error.message); // Log detailed error message
    throw new Error("Failed to send verification email");
  }
}

app.post("/signUp", async (req, res) => {
  try {
    const { user_name, email, password, role } = req.body;

    // Check for required fields
    if (!role || !user_name) {
      return res
        .status(400)
        .json({ message: "Role and User Name are required" });
    }

    // Check for existing user by username or email
    const existingUser = await User.findOne({
      $or: [{ user_name }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate a verification code
    const verificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

    // Create new user with the verification code
    const newUser = new User({
      user_name,
      email,
      password,
      role,
      verificationCode,
    });
    await newUser.save();

    // Generate unique account number and create account
    const accountNo = await generateUniqueAccountNo();
    const newAccount = new Account({
      account_no: accountNo,
      user_id: newUser._id,
      balance: 0,
      deposit: 0,
      password: "changeme",
    });
    await newAccount.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message:
        "User registered successfully. A verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Error registering user:", error.message); // Log detailed error message
    res
      .status(500)
      .json({ message: "Failed to register user", error: error.message });
  }
});

// Verification Endpoint
app.post("/verifyAccount", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null; // Clear the verification code
    await user.save();

    res.status(200).json({ message: "Account successfully verified" });
  } catch (error) {
    console.error("Error verifying account", error);
    res
      .status(500)
      .json({ message: "Failed to verify account", error: error.message });
  }
});
// Account Verification Endpoint
app.post("/verifyAccount", async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true; // Assuming you have an isVerified field in your User model
    user.verificationCode = null; // Clear the verification code after successful verification
    await user.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error("Error verifying account", error);
    res
      .status(500)
      .json({ message: "Failed to verify account", error: error.message });
  }
});
// Sign-In Endpoint
// /signIn endpoint
// /signIn endpoint
app.post("/signIn", async (req, res) => {
  try {
    const { user_name, email, password } = req.body;

    // Find the user by username or email
    const user = await User.findOne({ $or: [{ user_name }, { email }] });

    // Check if the user exists
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    // Compare the provided password with the stored password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id.toString() }, // Ensure _id is a string
      "4dC1aYbZ9eKxR3uWvA8hP7tQwJ2nL5sFzM0oO1rT6pVbGxN", // Your JWT secret
      { expiresIn: "1h" }
    );

    // Respond with success message and user data including role
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id.toString(), // Ensure _id is a string
        role: user.role, // Include the role field
      },
    });
  } catch (error) {
    console.error("Error during sign-in", error);
    res.status(500).json({ message: "An unexpected error occurred", error });
  }
});
// Endpoint to add a booking
app.post("/addBooking", async (req, res) => {
  try {
    const {
      property_id,
      tenant_id,
      owner_id,
      start_date,
      end_date,
      message,
      total_price,
    } = req.body;

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." });
    }

    const newBooking = new Booking({
      property_id,
      tenant_id,
      owner_id,
      start_date: startDate,
      end_date: endDate,
      message,
      totalPrice: total_price, // Match the key with frontend
    });

    await newBooking.save();
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ message: "Failed to create booking", error: error.message });
  }
});

//Notification End point
app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Fetch notifications for the user
    const notifications = await Booking.find({
      owner_id: userId,
      approval: "Pending",
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to retrieve notifications" });
  }
});

app.post("/reviews", async (req, res) => {
  const { user_id, property_id, rating, review } = req.body;

  try {
    // Validate input
    if (
      !user_id ||
      !property_id ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({ message: "Invalid input." });
    }

    // Find the review by user_id and property_id and update it, or create a new one if it doesn't exist
    const updatedReview = await Review.findOneAndUpdate(
      { user_id, property_id }, // Query to find the review
      { rating, review }, // Data to update
      { new: true, upsert: true, setDefaultsOnInsert: true } // Options
    );

    // Calculate the new average rating
    const reviews = await Review.find({ property_id });
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Update the property with the new average rating
    await Property.findByIdAndUpdate(property_id, {
      average_rating: averageRating,
    });

    // Send the response with the updated or newly created review
    res.status(201).json(updatedReview);
  } catch (error) {
    console.error("Error saving review:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
});

app.get("/reviews/:property_id", async (req, res) => {
  const { property_id } = req.params;

  try {
    // Validate property_id
    if (!property_id) {
      return res.status(400).json({ message: "Property ID is required." });
    }

    // Calculate average rating and get all reviews for the property
    const reviews = await Review.find({ property_id });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this property." });
    }

    // Calculate average rating
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    res.status(200).json({ averageRating, reviews });
  } catch (error) {
    console.error("Error retrieving reviews:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});
app.get("/api/frequently-rented", async (req, res) => {
  try {
    // Aggregate bookings to count how many times each property was booked
    const frequentProperties = await Booking.aggregate([
      { $match: { status: "booked" } }, // Only include bookings with status "booked"
      { $group: { _id: "$property_id", count: { $sum: 1 } } }, // Group by property and count
      { $sort: { count: -1 } }, // Sort by the count in descending order
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "_id",
          as: "propertyDetails",
        },
      }, // Join with the Property collection
      { $unwind: "$propertyDetails" }, // Unwind the propertyDetails array
      { $project: { _id: 0, propertyDetails: 1, count: 1 } }, // Format the output
    ]);

    res.status(200).json(frequentProperties);
  } catch (error) {
    console.error("Error fetching frequently rented properties:", error);
    res
      .status(500)
      .json({ message: "Error fetching frequently rented properties" });
  }
});
app.put("/users/change-password-main", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // Fetch the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect old password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/profile/updateRole/:userId", async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body; // role should be 1, 2, or 3

  try {
    // Validate role
    if (![1, 2, 3].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Find user and update role
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

///forggot password

// Create the transporter instance
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false });
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP and expiration
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiration = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    // Update user with OTP and expiration (without modifying the 'role' field)
    user.resetPasswordOtp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address (from your .env file)
      to: user.email, // Recipient address
      subject: "Your Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending email. Please try again later." });
      } else {
        console.log("Email sent:", info.response);
        return res.json({ message: "OTP sent to your email." });
      }
    });
  } catch (error) {
    console.error("Forgot Password error:", error);

    if (error.name === "ValidationError") {
      if (error.errors.role) {
        res
          .status(400)
          .json({ message: "Invalid role. Please choose 'admin' or 'user'." });
      } else if (error.errors.email) {
        res
          .status(400)
          .json({ message: "Invalid email format. Please check your email." });
      } else {
        res.status(400).json({ message: "Invalid request. Please try again." }); // Generic fallback message
      }
    } else {
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  }
});
app.post("/reset-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and send OTP
    const otp = otpGenerator();
    user.resetPasswordOtp = otp;
    user.otpExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send OTP to user's email (pseudo code for sending email)
    await nodemailer(user.email, "Password Reset", "Your OTP is ${otp}");

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/reset-password/:otp", async (req, res) => {
  const { otp } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordOtp: otp,
      otpExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
    
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});
app.post("/verifyAccount", async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } // Compare the provided code with the stored verification code
    if (user.verificationCode !== code) {
      console.log(
        "Verification failed. Stored code: ${user.verificationCode}, Provided code: ${code}"
      );
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark the user as verified and clear the verification code
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Account successfully verified" });
  } catch (error) {
    console.error("Error verifying account", error);
    res
      .status(500)
      .json({ message: "Failed to verify account", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
