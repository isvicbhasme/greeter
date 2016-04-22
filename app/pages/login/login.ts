import {Page, NavController} from 'ionic-angular';
import {ApplyLeavePage} from '../apply-leave/apply-leave';

@Page({
  templateUrl: 'build/pages/login/login.html'
})

export class LoginPage  {
  isLoggedIn: any;
  constructor(private nav: NavController) {
    this.isLoggedIn = false;
  }
  
  login(username: String, password: String) {
    this.isLoggedIn = true;
    this.nav.setRoot(ApplyLeavePage);
  }
}