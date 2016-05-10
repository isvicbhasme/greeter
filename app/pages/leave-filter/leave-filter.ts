import {Page, NavController} from 'ionic-angular';
import {FORM_DIRECTIVES, Control, ControlGroup, FormBuilder, Validators} from 'angular2/common';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct'
import * as Constants from './leave-filter-constants'

/*
  Generated class for the LeaveFilterPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/leave-filter/leave-filter.html',
  directives: [FORM_DIRECTIVES]
})
export class LeaveFilterPage {
  private customizeForm: ControlGroup;
  public group: Control;
  public sort: Control;
  public fromDateFilter: number;
  public toDateFilter: number;
  public ctrlValues;
  
  constructor(public nav: NavController) {
    this.ctrlValues =  Constants.CTRL_VALUES;
    this.group = new Control(Constants.CTRL_VALUES.dateGroup);
    this.sort = new Control(Constants.CTRL_VALUES.dateFilter);
    this.setDefaultDates();
    this.customizeForm = new ControlGroup({
      "group": this.group,
      "sort": this.sort
    });
  }
  
  public cancelFilter(): void {
    this.nav.pop();
  }
  
  public applyFilter(): void {
    console.log(this.customizeForm.value)
  }
  
  public clicked(): void {
    console.log("Clicked!");
  }
  
  private setDefaultDates() {
    let todaysDate = new Date();
    let beginingOfMonth = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1);
    this.fromDateFilter = beginingOfMonth.getTime();
    this.toDateFilter = new Date(beginingOfMonth.getFullYear(), beginingOfMonth.getMonth()+1, beginingOfMonth.getDate()-1).getTime();
  }
}
