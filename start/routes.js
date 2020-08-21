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

Route.post('users/register', 'UserController.store')
Route.post('users/login', 'UserController.login')

Route.group(() => {
  // updating username and password
  Route.put('users/:id', 'UserController.update')
}).middleware(['auth'])

Route.post('users/forgotPassword', 'UserController.pw_recovery')
Route.put('users/forgotPassword/:token/:email', 'UserController.update_pw')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})
