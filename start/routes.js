'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.post('register', 'UserController.store')
  Route.post('login', 'UserController.login')
  Route.post('forgotPassword', 'UserController.pw_recovery')
  Route.put('forgotPassword/:token/:email', 'UserController.update_pw')
  Route.get('me', 'UserController.me').middleware(['auth'])
}).prefix('api')

Route.group(() => {
  // updating username and password
  Route.put('users/:id', 'UserController.update')
}).middleware(['auth']).prefix("api")



Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
}).prefix("api")

// dont use edge to render any route anymore. the frontend will be managed fully by nuxt
