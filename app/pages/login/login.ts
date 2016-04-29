import {Page, NavController, Toast} from 'ionic-angular';
import {ApplyLeavePage} from '../apply-leave/apply-leave';
import {FORM_DIRECTIVES, AbstractControl, ControlGroup, FormBuilder, Validators} from 'angular2/common';
import {FirebaseService} from '../../providers/firebase-service/firebase-service'


@Page({
  templateUrl: 'build/pages/login/login.html',
  directives: [FORM_DIRECTIVES] 
})

export class LoginPage  {
  minEmailLen: number;
  maxEmailLen: number;
  minPasswordLen: number;
  maxPasswordLen: number;
  submitButtonText: string;
  isAuthOngoing: boolean;
  email: AbstractControl;
  password: AbstractControl;
  authForm: ControlGroup;
  
  constructor(private nav: NavController, private firebaseService: FirebaseService, fb: FormBuilder) {
    this.minEmailLen = 4;
    this.maxEmailLen = 30;
    this.minPasswordLen = 6;
    this.maxPasswordLen = 20;
    this.submitButtonText = "Login";
    this.isAuthOngoing = false;
    this.authForm = fb.group({
      'email' : ['', Validators.compose([Validators.required, Validators.minLength(this.minEmailLen), Validators.maxLength(this.maxEmailLen)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(this.minPasswordLen), Validators.maxLength(this.maxPasswordLen)])]
    });
    this.email = this.authForm.controls['email'];
    this.password = this.authForm.controls['password'];
  }
  
  public login(): void {
    this.submitButtonText = "Please wait..."
    this.isAuthOngoing = true;
    if(this.authForm.valid) {
      let ref = this.firebaseService.getRefToBaseUrl();
      ref.authWithPassword({
        email: this.email.value,
        password: this.password.value
      }, (error, data) => this.authHandler(error, data)
      );
    }
  }
  
  public authHandler(error, authData) {
    this.submitButtonText = "Login";
    this.isAuthOngoing = false;
    if(error) {
      switch(error.code) {
        case "INVALID_EMAIL": this.showToast("Incorrect email. Please try again."); break;
        case "INVALID_PASSWORD": this.showToast("Incorrect password. Please try again"); break;
        case "INVALID_CREDENTIALS": this.showToast("Please enter valid credentials"); break;
      }
      console.log("Authentication failed: "+JSON.stringify(error));
    }
  }
  
  private showToast(msg: string) {
    let toast = Toast.create({
      message: msg
    });
    this.nav.present(toast);
  }
}