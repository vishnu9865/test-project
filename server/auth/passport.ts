import userController from "../controllers/user.controller"
import skillController from "../controllers/skills.controller"
import ratingController from "../controllers/ratings.controller"

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
      userController.findUser(profile.id)
      .then((user: any) => {
        if (user.length !== 0) {
          console.log('Message From 49 Line Passport.ts');
          return cb(null, user);
        } else {
          userController.createUser(profile.displayName, profile.id, profile.photos[0].value, profile.emails[0].value).then((user: any) => {
              skillController.createSkill([], "", user.id).then(() => {
                  ratingController.createRating(0, 0, 0, 0, 0, 0, "", user.id).then(() => {
                    console.log(`${user.userName} created successfully!\nSkills and Ratings created successfully!`);
                    return cb(null, user);
                  })
                  .catch((err: any) => {
                    return cb(err, false);
                  });
                })
            })
            .catch((err: any) => {
              return cb(err, false);
            });
        }
      })
      .catch((err: any) => {
        console.log('Message From 72 Line Passport.ts');
        cb(err, false);
      });
    }
  )
);


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

router.get("/login/success", (req:any, res:any) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successful",
      user: [req.user[0].userName, req.user[0].userEmail, req.user[0].userImg]
    });
  }
});

// router.get("/logout", (req:any, res:any) => {
//   req.logout();
//   res.json({
//     logout: req.user
//   })
// });

router.get('/logout', function(req:any,res:any){
  req.logOut();
  res.clearCookie('googleAuthToken');
  req.session.destroy(function (err:any) {
         res.redirect('/');
  });
 });

module.exports = router;