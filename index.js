const bodyParser = require('body-parser');
const Passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const express = require('express');
const passportFb = require('passport-facebook').Strategy
const db = require('./db.js')
const app = express()
const fs = require('fs');
const passport = require('passport');

app.set('views', './views');
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: "mysecret",
    cookie: {
        maxAge: 1000 * 60 * 5
    }
}))
app.use(Passport.initialize())
app.use(Passport.session())

app.get('/', (req, res) => res.render('index'))

app.route('/login')
    .get((req, res) => res.render('login'))
    .post(Passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/loginOK'
    }))

app.get('/private', (req, res) => {
    if (req.isAuthenticated()) {
        res.send("private")
    } else {
        res.send('ban chua login')
    }
})

app.get('/loginOK', (req, res) => res.send('ban da dang nhap thanh cong'))

//passportFB
app.get('/auth/fb', passport.authenticate('facebook'))
app.get('/auth/fb/cb', passport.authenticate('facebook',
    { failureRedirect: '/', successRedirect: '/loginOK' }
))

passport.use(new passportFb(
    {
        clientID: "704877580102851",
        clientSecret: "be54ce3bd657ed84acfa2d5d3bfaaf84",
        callbackURL: "http://localhost:3000/auth/fb/cb"
    },
    (accessToken, refreshToken, profile, done) => {
        console.log('profile' + profile);
    }
))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    db.findOne({ id }, (err, user) => {
        done(null, user)
    })
})


Passport.use(new LocalStrategy(
    (username, password, done) => {
        fs.readFile('./userDB.json', (err, data) => {
            const db = JSON.parse(data)
            const userRecord = db.find(user => user.usr == username)
            if (userRecord && userRecord.pwd == password) {
                return done(null, userRecord)
            } else {
                return done(null, false)
            }
        })
    }
))

Passport.serializeUser((user, done) => {
    done(null, user.usr)
})

Passport.deserializeUser((name, done) => {
    fs.readFile('./userDB.json', (err, data) => {
        const db = JSON.parse(data)
        const userRecord = db.find(user => user.usr == name)
        if (userRecord) {
            return done(null, userRecord)
        } else {
            return done(null, false)
        }
    })
})

const port = 3000
app.listen(port, () => console.log(`Server is running port ${port}`))