import {Page, NavController, Alert, NavParams, ViewController} from 'ionic-angular';
import {DatePicker} from 'ionic-native';
import {FORM_DIRECTIVES, Control, ControlGroup, FormBuilder, Validators} from 'angular2/common';
import {NgZone} from 'angular2/core';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct';
import {FirebaseService} from '../../providers/firebase-service/firebase-service';
import * as Constants from '../../util/constants/leave-filter-constants';
import {LeaveFilterResult} from '../../util/leave-filter-result/leave-filter-result';

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
  public filter: Control;
  public fromDateFilter: number;
  public toDateFilter: number;
  public nameList: Array<{uid: string, name: string, username: string}>;
  public uidFilter: Array<string>;
  public anyFilteredNameForDisplay: string;
  public ctrlValues;
  public defaultFilters: LeaveFilterResult;
  
  constructor(public nav: NavController,
              private zone: NgZone,
              private firebaseService: FirebaseService,
              private viewCtrl: ViewController,
              params: NavParams) {
    this.anyFilteredNameForDisplay = "";
    this.uidFilter = [];
    this.ctrlValues =  Constants.FILTER_TYPES;
    this.nameList = params.get('names');
    this.setDefaultFilters(params.get('defaultFilters'));
    this.group = new Control(this.defaultFilters.groupBy);
    this.filter = new Control(this.defaultFilters.filterBy);
    this.setDefaultDates();
    console.log("Filters:"+JSON.stringify(this.defaultFilters));
    this.customizeForm = new ControlGroup({
      "group": this.group,
      "filter": this.filter
    });
  }
  
  public cancelFilter(): void {
    this.nav.pop();
  }
  
  public applyFilter(): void {
    console.log(this.customizeForm.value)
    let result: LeaveFilterResult = {groupBy: "", filterBy: "", filterInfo: []};
    result.groupBy = this.customizeForm.value.group;
    result.filterBy = this.customizeForm.value.filter;
    if(this.customizeForm.value.filter === this.ctrlValues.dateFilter) {
      result.filterInfo = [this.fromDateFilter.toString(), this.toDateFilter.toString()];
    }
    else if(this.customizeForm.value.filter === this.ctrlValues.nameFilter) {
      result.filterInfo = this.uidFilter;
    }
    else {
      let uidList: Array<string> = [];
      this.nameList.forEach((data) => {
        uidList.push(data.uid);
      });
      result.filterInfo = uidList;
    }
    this.viewCtrl.dismiss(result);
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
  
  public showNames() {
    console.log(JSON.stringify(this.nameList));
    let alert = Alert.create({
      title: "Greeters",
      subTitle: "Choose names to filter...",
      buttons: [
        {
          text: "Select",
          handler: data => {
            let tempName = this.nameList.find((element) => element.uid === data[0]);
            if(tempName) {
              this.uidFilter = data;
              this.anyFilteredNameForDisplay = this.nameList.find((element) => element.uid === data[0]).name;
            }
          }
        }]
    });
    
    this.nameList.forEach((value:{uid: string, name: string, username: string}) => {
      alert.addInput({
        type: 'checkbox',
        label: value.name + " (" + value.username + ")",
        value: value.uid,
        checked: this.uidFilter.find((element) => element === value.uid) != undefined
      });
    });
    this.nav.present(alert);
  }
  
  private setDefaultDates() {
    if(this.defaultFilters.filterBy === Constants.FILTER_TYPES.dateFilter && this.defaultFilters.filterInfo.length === 2) {
      this.fromDateFilter = Number(this.defaultFilters.filterInfo[0]);
      this.toDateFilter = Number(this.defaultFilters.filterInfo[1]);
    }
    else {
      let todaysDate = new Date();
      let beginingOfMonth = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1);
      this.fromDateFilter = beginingOfMonth.getTime();
      this.toDateFilter = new Date(beginingOfMonth.getFullYear(), beginingOfMonth.getMonth()+1, beginingOfMonth.getDate()-1).getTime();
    }
  }
  
  private getDateAsString(date: number): string {
    let convertedDate: Date = new Date(date)
    return convertedDate.getFullYear() + "-" + ("0" + (convertedDate.getMonth() + 1)).slice(-2) + "-" + ("0"+convertedDate.getDate()).slice(-2)
  }
  
  private setDefaultFilters(param: LeaveFilterResult): void{
    this.defaultFilters = param;
    if(param.filterBy === Constants.FILTER_TYPES.nameFilter) {
      this.uidFilter = param.filterInfo;
      this.anyFilteredNameForDisplay = (this.nameList.find((element) => this.uidFilter[0] === element.uid)).name;
    }
  }
}
