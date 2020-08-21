'use strict'
const User = use('App/Models/User')
const Hash = use('Hash')

const Mail = use('Mail') // Adonis' mail

const moment = require('moment') // moment (RUN NPM INSTALL MOMENT)
const crypto = require('crypto') // crypto

class UserController {
    async store({request, response}){
        try{
            // request data coming from the request
            const data = request.only(['username', 'email', 'password'])

            // looking for user in database
            const userExists = await User.findBy('email', data.email)

            // if user exists don't save
            if (userExists) {
                return response
                .status(400)
                .send({ message: { error: 'User already registered' } })
            }

            // if user doesn't exist, proceeds with saving him in DB
            const user = await User.create(data)

            return user

        }catch (err) {
            return response
              .status(err.status)
              .send(err)
        }
    }

    async login({request, auth, response}) {

        let {email, password} = request.all();

        try {
          if (await auth.attempt(email, password)) {
            let user = await User.findBy('email', email)
            let token = await auth.generate(user)

            Object.assign(user, token)
            return response.json(user)
          }


        }
        catch (e) {
          console.log(e)
          return response.json({message: 'You are not registered!'})
        }
    }

    async update ({ request, response, params }) {
        const id = params.id
        const { username, password, newPassword } = request
          .only(['username', 'password', 'newPassword'])
    
        // looking for user in DB
        const user = await User.findByOrFail('id', id)
    
        // checking if old password informed is correct
        const passwordCheck = await Hash.verify(password, user.password)
    
        if (!passwordCheck) {
          return response
            .status(400)
            .send({ message: { error: 'Incorrect password provided' } })
        }
    
        // updating user data
        user.username = username
        user.password = newPassword
    
        // persisting new data (saving)
        await user.save()
    }

    async pw_recovery ({ request }) {
        try {
          // account request password recovery
          const { email } = request.only(['email'])
    
          // checking if email is registered
          const user = await User.findByOrFail('email', email)
    
          // generating token
          const token = await crypto.randomBytes(10).toString('hex')
    
          // registering when token was created and saving token
          user.token_created_at = new Date()
          user.token = token
    
          // persisting data (saving)
          await user.save()
    
          await Mail.send('emails.password_recovery', { user, token }, (message) => {
            message
              .from('support@bergeymanual.com')
              .to(email)
          })
    
          return user
        } catch (err) {
          console.log(err)
        }
    }

    async update_pw ({ request, response, params }) {
        const tokenProvided = params.token // retrieving token in URL
        const emailRequesting = params.email // email requesting recovery
    
        const { newPassword } = request.only(['newPassword'])
    
        // looking for user with the registered email
        const user = await User.findByOrFail('email', emailRequesting)
    
        // checking if token is still the same
        // just to make sure that the user is not using an old link
        // after requesting the password recovery again
        const sameToken = tokenProvided === user.token
    
        if (!sameToken) {
          return response
            .status(401)
            .send({ message: {
              error: 'Old token provided or token already used'
            } })
        }
    
        // checking if token is still valid (48 hour period)
        const tokenExpired = moment()
          .subtract(2, 'days')
          .isAfter(user.token_created_at)
    
        if (tokenExpired) {
          return response.status(401).send({ message: { error: 'Token expired' } })
        }
    
        // saving new password
        user.password = newPassword
    
        // deleting current token
        user.token = null
        user.token_created_at = 0
    
        // persisting data (saving)
        await user.save()
    }
}

module.exports = UserController
