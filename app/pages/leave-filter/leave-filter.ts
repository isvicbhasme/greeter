import {Page, NavController} from 'ionic-angular';
import {FORM_DIRECTIVES, AbstractControl, ControlGroup, FormBuilder, Validators} from 'angular2/common';

/*
  Generated class for the LeaveFilterPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/leave-filter/leave-filter.html',
})
export class LeaveFilterPage {
  customizeForm: ControlGroup;
  
  constructor(public nav: NavController, FilePropertyBag: FormBuilder) {
    this.customizeForm = FilePropertyBag.group({});
  }
  
  public cancelFilter(): void {
    this.nav.pop();
  }
  
  public applyFilter(): void {
    
  }
  
  public clicked(): void {
    console.log("Clicked!");
  }
}
