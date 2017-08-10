//Same setup for all auth0's
const express = require('express');
const Auth0Strategy = require('passport-auth0')
const passport = require('passport')
const session = require('express-session')
const config = require('./config')
const {json} = require('body-parser')

app = express();
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.secret
}));

app.use(json())
app.use(passport.initialize())
app.use(passport.session())
//Auth0Strategy from 1
passport.use(new Auth0Strategy({
  domain: config.domain,
  clientID: config.clientID,
  clientSecret: config.clientSecret,
  callbackURL: config.callbackURL
}, function(accessToken, refreshToken, extraParams, profile, done) {
  return done(null, profile);
}));

//2.captures from Auth0Strategy data (hashes it)
passport.serializeUser(function(user, done) {
  done(null, user);
});
//3.eserialize user so the data can be used (unhash it and attaches it to req.user)
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//1. Auth0 references Auth0Strategy & executes it
app.get("/auth", passport.authenticate('auth0'))
app.get('/auth/callback',
  passport.authenticate('auth0', {successRedirect: '/me'}), (req, res) => {
    res.status(200).send(req.user);
});
app.get('/me', (req,res,next) => {
    if(req.user) {
        res.json(req.user)
    }
    else {
        res.json({message: "Failure"})
    }
})

app.listen(3000, ()=> {console.log("Listening on PORT: 3000")})