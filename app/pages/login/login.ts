import {Page, NavController} from 'ionic-angular';
import {ApplyLeavePage} from '../apply-leave/apply-leave';
import {FORM_DIRECTIVES, AbstractControl, ControlGroup, FormBuilder, Validators} from 'angular2/common';

@Page({
  templateUrl: 'build/pages/login/login.html',
  directives: [FORM_DIRECTIVES] 
})

export class LoginPage  {
  minUsernameLen: number;
  maxUsernameLen: number;
  minPasswordLen: number;
  maxPasswordLen: number;
  isLoggedIn: any;
  username: AbstractControl;
  password: AbstractControl;
  authForm: ControlGroup;
  
  constructor(private nav: NavController, fb: FormBuilder) {
    this.isLoggedIn = false;
    this.minUsernameLen = 4;
    this.maxUsernameLen = 16;
    this.minPasswordLen = 6;
    this.maxPasswordLen = 16;
    this.authForm = fb.group({
      'username' : ['', Validators.compose([Validators.required, Validators.minLength(this.minUsernameLen), Validators.maxLength(this.maxUsernameLen)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(this.minPasswordLen), Validators.maxLength(this.maxPasswordLen)])]
    });
    this.username = this.authForm.controls['username'];
    this.password = this.authForm.controls['password'];
  }
  
  public login(value: string): void {
    if(this.authForm.valid) {
      this.isLoggedIn = true;
      console.log("Submitted value:"+value);
      this.nav.setRoot(ApplyLeavePage);
    }
  }
}