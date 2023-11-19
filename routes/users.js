var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const { dbUrl } = require('../Common/dbConfig')
const { hashPassword, hashCompare, createToken } = require('../Common/auth')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { userModel } = require('../Schemas/userSchemas');
const { detailsModel } = require('../Schemas/DetailsSchemas');



mongoose.connect(dbUrl)
  .then(() => console.log('Connected!'));


router.post('/signup', async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.email })
    console.log(user)

    if (!user) {
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword
      let newuser = await userModel.create({
        name:req.body.name,
        email: req.body.email,
        password: req.body.password,

      })
      console.log(newuser)
      res.status(200).send({
        message: "Users Created Successfully!",
        newuser,
      })
    }
    else {
      res.status(400).send({
        message: 'Users Already Exists!'
      })
    }

  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    })
  }
})



router.post('/login', async (req, res) => {
  try {

    let user = await userModel.findOne({ email: req.body.email })
    console.log(user)
    if (user) {

      // verify the password
      if (await hashCompare(req.body.password, user.password)) {
        // create the Token
        let token = await createToken({
          name: user.name,
          email: user.email,
          id: user._id,
        })
        const { password, ...others } = user._doc;
        res.status(200).send({
          message: "User Login Successfully!",
          token,
          user: others,
        })
      }
      else {
        res.status(402).send({
          message: "Invalid Credentials"
        })
      }

    }
    else {
      res.status(400).send({
        message: 'Users Does Not Exists!'
      })
    }

  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    })
  }
})




router.post("/reset", async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.values.email })
    console.log(user)
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.email }, process.env.secretkey, { expiresIn: '1h' });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD

      },
    });
    const queryParams = new URLSearchParams();
    queryParams.set('token', token);
    const queryString = queryParams.toString();
    let details = {
      from: "greenpalace1712@gmail.com",
      to: user.email,
      subject: "Hello ✔",
      html: `
        <p>Hello,</p>
        <p>Please click on the following link to reset your password:</p>
  
      <a href="${process.env.CLIENT_URL}/password?${queryString}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    await transporter.sendMail(details)
    res.status(200).send({ message: 'Password reset email sent' })
    console.log(details)


  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
});


router.post('/password', async (req, res) => {


  try {
    const users = await userModel.findOne({ email: req.body.email });
    console.log(users)
    console.log("reset : " + req.body.password);
    const token = req.body.token;
    console.log(token)
    let hashedPassword = await hashPassword(req.body.password)
    console.log(hashedPassword);

    let decodedToken = jwt.verify(token, process.env.secretkey)

    console.log("decoded : " + decodedToken)
    const userId = decodedToken.userId;
    console.log(userId)
    const filter = { email: userId };
    const update = { password: hashedPassword };

    const doc = await userModel.findOneAndUpdate(filter, update);
    console.log("test");
    console.log(doc);


    res.status(200).send({
      message: "Password Reset successfully",
    })

  } catch (error) {
    res.status(400).send({
      message: "Some Error Occured",
    })
  }
})



router.post("/notes", async (req, res) => {
  console.log('tet')
  try {
      const newNotesData = req.body;
      console.log(newNotesData)
      const newNotes = await detailsModel.create(newNotesData);

      res.status(201).json(newNotes);
  } catch (error) {
      console.log(error)
      res.status(500).json({
          error,
          message: "Error adding new teacher",
          statusCode: 500,
      });
  }
});


router.put("/notes/:notesId", async (req, res) => {
  console.log("wef")
  try {
      const notesId = req.params.notesId;
      console.log(notesId)
      const updatedData = req.body;

      const updatedNotes = await detailsModel.findOneAndUpdate(
          { _id: notesId },
          updatedData,
          { new: true }
      );

      if (updatedNotes) {
          res.status(200).json(updatedNotes);
      } else {
          res.status(404).json({
              message: "Notes not found",
              statusCode: 404,
          });
      }
  } catch (error) {
      res.status(500).json({
          error,
          message: "Error updating Notes details",
          statusCode: 500,
      });
  }
});



router.delete("/users/:userId", async (req, res) => {
  console.log("jj")
  try {
      const userId = req.params.userId;
      console.log(userId);

      const deletedUser = await detailsModel.findByIdAndDelete(userId);

      if (deletedUser) {
          res.status(200).json({
              message: "User deleted successfully",
              statusCode: 200,
          });
      } else {
          res.status(404).json({
              message: "User not found",
              statusCode: 404,
          });
      }
  } catch (error) {
      res.status(500).json({
          error,
          message: "Error deleting user",
          statusCode: 500,
      });
  }
});




router.get("/getallnotes", async (req, res) => {
  console.log('getallnotes')
  try {
      const teacher = await detailsModel.find();
      console.log(teacher)
      res.status(200).json({
          teacher,
          message: "Notes fetched successfully",
          statusCode: 200,
      });

  } catch (error) {
      res.status(500).json({
          error,
          message: "Error fetching User details",
          statusCode: 500,
      });
  }
});



router.get("/teacher/:teacherId", async (req, res) => {
  console.log("uhuh")
  try {
      const teacherId = req.params.teacherId;
    console.log(teacherId)
      const teacher = await detailsModel.findById(teacherId);
    console.log(teacher)
      if (teacher) {
          res.status(200).json(teacher);
      } else {
          res.status(404).json({
              message: "Notes not found",
              statusCode: 404,
          });
      }
  } catch (error) {
      res.status(500).json({
          error,
          message: "Error fetching Notes details",
          statusCode: 500,
      });
  }
});







module.exports = router;
