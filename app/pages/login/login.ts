import {Page, NavController, Toast} from 'ionic-angular';
import {ApplyLeavePage} from '../apply-leave/apply-leave';
import {FORM_DIRECTIVES, AbstractControl, ControlGroup, FormBuilder, Validators} from 'angular2/common';

@Page({
  templateUrl: 'build/pages/login/login.html',
  directives: [FORM_DIRECTIVES] 
})

export class LoginPage  {
  minEmailLen: number;
  maxEmailLen: number;
  minPasswordLen: number;
  maxPasswordLen: number;
  firebaseUrl: string;
  email: AbstractControl;
  password: AbstractControl;
  authForm: ControlGroup;
  
  constructor(private nav: NavController, fb: FormBuilder) {
    this.minEmailLen = 4;
    this.maxEmailLen = 30;
    this.minPasswordLen = 6;
    this.maxPasswordLen = 20;
    this.firebaseUrl = "https://greeter.firebaseio.com/";
    this.authForm = fb.group({
      'email' : ['', Validators.compose([Validators.required, Validators.minLength(this.minEmailLen), Validators.maxLength(this.maxEmailLen)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(this.minPasswordLen), Validators.maxLength(this.maxPasswordLen)])]
    });
    this.email = this.authForm.controls['email'];
    this.password = this.authForm.controls['password'];
  }
  
  public login(): void {
    if(this.authForm.valid) {
      let ref = new Firebase(this.firebaseUrl);
      ref.authWithPassword({
        email: this.email.value,
        password: this.password.value
      }, (error, data) => this.authHandler(error, data)
      );
    }
  }
  
  public authHandler(error, authData) {
    if(error) {
      switch(error.code) {
        case "INVALID_EMAIL": this.showToast("Invalid credentials."); break;
        case "INVALID_PASSWORD": this.showToast("Invalid password."); break;
        case "INVALID_CREDENTIALS": this.showToast("Invalid credentials"); break;
      }
      console.log("Authentication failed: "+JSON.stringify(error));
    } else {
      this.nav.setRoot(ApplyLeavePage);
    }
  }
  
  private showToast(msg: string) {
    let toast = Toast.create({
      message: msg
    });
    this.nav.present(toast);
  }
}