import {Page, NavController, Alert} from 'ionic-angular';
import {DatePicker} from 'ionic-native';
import {FORM_DIRECTIVES, Control, ControlGroup, FormBuilder, Validators} from 'angular2/common';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct';
import {NgZone} from 'angular2/core';
import * as Constants from './leave-filter-constants';

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
  
  constructor(public nav: NavController, private zone: NgZone) {
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
  
  public showFromDatePicker() {
    // DatePicker.show({
    //   date: new Date(this.fromDateFilter),
    //   mode: 'date',
    //   titleText: 'Start from...',
    //   todayText: 'Today',
    //   androidTheme: 3 // THEME_HOLO_LIGHT
    // }).then(
    //   date => {
    //     console.log(date);
    //     if(date != null) {
    //       this.zone.run(() => this.fromDateFilter = date.getTime());
    //       this.showToDatePicker();
    //     }
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
    // Below is hybrid
    let prompt = Alert.create({
      title: 'Start from...',
      inputs: [
        {
          name: 'value', // this is passed in handler
          type: 'date',
          value: this.getDateAsString(this.fromDateFilter)
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: (data) => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: (data) => {
            let dateString: string[] = data.value.split("-");
            if(dateString != null && dateString.length == 3) {
              let date: Date = new Date(Number(dateString[0]), Number(dateString[1]) - 1, Number(dateString[2]));
              this.fromDateFilter = date.getTime();
              console.log(date);
              this.showToDatePicker();
            }
          }
        }
      ]
    });
    this.nav.present(prompt);
  }
  
  public showToDatePicker() {
    // DatePicker.show({
    //   date: new Date(this.toDateFilter),
    //   mode: 'date',
    //   titleText: 'Upto...',
    //   todayText: 'Today',
    //   androidTheme: 3 // THEME_HOLO_LIGHT
    // }).then(
    //   date => {
    //     console.log(date);
    //     if(date != null) {
    //       this.zone.run(() => this.toDateFilter = date.getTime());
    //     }
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
    // Below is hybrid
    let prompt = Alert.create({
      title: 'Upto...',
      inputs: [
        {
          name: 'value', // this is passed in handler
          type: 'date',
          value: this.getDateAsString(this.toDateFilter)
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: (data) => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: (data) => {
            let dateString: string[] = data.value.split("-");
            if(dateString != null && dateString.length == 3) {
              let date: Date = new Date(Number(dateString[0]), Number(dateString[1]) - 1, Number(dateString[2]));
              this.toDateFilter = date.getTime();
              console.log(date);
            }
          }
        }
      ]
    });
    this.nav.present(prompt);
  }
  
  private setDefaultDates() {
    let todaysDate = new Date();
    let beginingOfMonth = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1);
    this.fromDateFilter = beginingOfMonth.getTime();
    this.toDateFilter = new Date(beginingOfMonth.getFullYear(), beginingOfMonth.getMonth()+1, beginingOfMonth.getDate()-1).getTime();
  }
  
  private getDateAsString(date: number): string {
    let convertedDate: Date = new Date(date)
    return convertedDate.getFullYear() + "-" + ("0" + (convertedDate.getMonth() + 1)).slice(-2) + "-" + ("0"+convertedDate.getDate()).slice(-2)
  }
}
