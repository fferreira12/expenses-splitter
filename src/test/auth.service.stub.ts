import { AuthService } from 'src/app/services/auth.service';

let mockAuthService = {//: AuthService = {
  localStorage: null,
  token: "",
  userId: "",
  userIdObservable: null,
  getUserId: function(){
    return "";
  },
  subscribeToUserId: function(subs) {
    return null;
  },
  init: function(){},
  signupUser: function(email: string, pass: string) {
    return Promise.resolve(null);
  },
  signinUser: function(email: string, pass: string) {
    return Promise.resolve(null);
  },
  logout: function(){},
  getToken: function(){return ""},
  isAuthenticated: function(){return true}
}

export { mockAuthService }