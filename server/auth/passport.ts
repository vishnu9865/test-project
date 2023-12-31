import * as usersController from "../controllers/user.controller"
import * as skillsController from "../controllers/skills.controller"
import * as ratingsController from "../controllers/ratings.controller"

const router = require("express").Router()
const googleStrategy  = require("passport-google-oauth20").Strategy
const passport = require("passport")
const jwt = require("jsonwebtoken")

require("dotenv").config()

passport.serializeUser((user:any, done:any) => {
    done(null, user);
})

passport.deserializeUser((user:any, done:any) => {
    done(null, user);
})

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken:any, refreshToken:any, profile:any, cb:any) => { 
      usersController.getUserByGoogleId(profile.id)
      .then((user: any) => {
        if (user) {
          console.log('Message From 49 Line Passport.ts');
          return cb(null, user);
        } else {
          usersController.createUser(profile.displayName, profile.id, profile.photos[0].value, profile.emails[0].value)
          .then((user: any) => {
            console.log(`${user.userName} User Created Successfully`);
            skillsController.createSkill([],user.id)
            .then(() => {
              console.log(`Skills For ${user.userName} Created Successfully`);
              ratingsController.bulkCreateRating(0,0,0,0,0,user.id)
              .then(() => {
                  console.log(`Ratings For ${user.userName} Created Successfully For Next 6 Weeks`);
                  return cb(null, user);
              })
              .catch((err: any) => {
                return cb(err, false);
              });
            })
            .catch((err: any) => {
              return cb(err, false);
            });
        })
        .catch((err: any) => {
          console.log('There\'s A Problem In Creating User');
          return cb(err, false);
        });
    }
    });
  }
));

router.get('/google', passport.authenticate('google', {
  scope: ['profile', "email"]
}));

router.get("/google/callback", passport.authenticate("google",), (req:any, res:any) => {
  if(req.user){
    const googleAuthToken = jwt.sign({googleAuthToken: req.user.googleId}, process.env.JWT_SECRET, {expiresIn:86400000})
    res.cookie("googleAuthToken", googleAuthToken, {expires: new Date(Date.now() + 86400 * 1000), httpOnly: true})
    res.redirect("http://localhost:5173")
  }
});

router.get("/login/success", async (req:any, res:any) => {
  if (req.user) {
    console.log(req.user);
    res.status(200).json({
      success: true,
      message: "successful",
      user: req.user.length ? [req.user[0].userName, req.user[0].userEmail, req.user[0].userImg] : [req.user.userName, req.user.userEmail, req.user.userImg]
    });
  }
});

router.get("/logout", (req:any, res:any) => {
  req.logout();
  res.clearCookie("authSession")
  res.clearCookie("googleAuthToken")
  res.json({
    logout: req.user
  })
});

module.exports = router;