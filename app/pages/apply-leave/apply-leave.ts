import {Page, Alert, NavController, Events} from 'ionic-angular';
import {DatePicker} from 'ionic-native';
import {NgZone} from 'angular2/core';
import {FirebaseService} from '../../providers/firebase-service/firebase-service'
import {LeaveStruct} from '../../providers/leave-struct/leave-struct'


@Page({
  templateUrl: 'build/pages/apply-leave/apply-leave.html'
})

export class ApplyLeavePage  {
  leaves: Array<LeaveStruct>; 
  takeOff: {reason: string, date: number};
  
  constructor(private nav: NavController,
              private zone: NgZone,
              private firebaseService: FirebaseService,
              private events: Events) {
    this.leaves = [];
    this.takeOff = {reason: "", date: this.getTodaysDateAsMilliSec()};
    this.subscribeToLeaveChanges()
    firebaseService.registerForCurrentUserLeaveEvents();
  }
  
  public revokeLeave(leave: LeaveStruct) {
    let deletedLeaves: LeaveStruct[] = this.removeLeaveFromList(leave.date);
    deletedLeaves.forEach((deletedLeave) => {
      this.firebaseService.revokeLeave(deletedLeave.date);
    });
  }
  
  private removeLeaveFromList(date: number): LeaveStruct[] {
    let leaveToDelete = this.isTimestampInList(date);
    let deletedLeaves: LeaveStruct[] = [];
    if(leaveToDelete != undefined && leaveToDelete != null) {
      deletedLeaves = this.leaves.splice(this.leaves.indexOf(leaveToDelete), 1);
      console.log("Notification: Deleted "+deletedLeaves[0].date+" leave.");
    }
    return deletedLeaves;
  }
  
  public showPopup() {
    // DatePicker.show({
    //   date: this.getNextSundayAsDate(),
    //   mode: 'date',
    //   titleText: 'Take-off on...',
    //   todayText: 'Today',
    //   androidTheme: 3 // THEME_HOLO_LIGHT
    // }).then(
    //   date => {
    //     console.log(date);
    //     if(date != null) {
    //       this.takeOff.date = date.getTime();
    //       console.log("Adding new leave "+ JSON.stringify(this.takeOff));
    //       this.zone.run(() => this.addNewLeaveToList());
    //       this.firebaseService.addNewLeave(this.takeOff);
    //       this.takeOff = {reason: "", date: this.getTodaysDateAsMilliSec()};
    //     }
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // )
    let prompt = Alert.create({
      title: 'Take-off on...',
      inputs: [
        {
          name: 'value', // this is passed in handler
          type: 'date',
          value: this.getNextSundayAsDateStr()
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
              this.takeOff.date = date.getTime();
              this.addNewLeaveToList();
              this.firebaseService.addNewLeave(this.takeOff);
              this.takeOff = {reason: "", date: this.getTodaysDateAsMilliSec()};
            }
          }
        }
      ]
    });
    this.nav.present(prompt);
  }
  
  public logout() {
    this.firebaseService.getRefToBaseUrl().unauth();
  }
  
  private addNewLeaveToList() {
    if(this.takeOff.reason != null && this.takeOff.reason.length > 0 && this.takeOff.date > 0) {
      let leave = new LeaveStruct();
      leave.reason = this.takeOff.reason;
      leave.date = this.takeOff.date;
      this.leaves.push(leave);
      this.sortLeavesList();
      console.log("Pushed successfully");
    }
  }
  
  private getTodaysDateAsMilliSec() {
    let date:Date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }
  
  private getNextSundayAsDateStr() {
    let date: Date = new Date();
    if(date.getDay() > 0) {
      date.setDate(date.getDate() + (7 - date.getDay())); // Find coming Sunday
    }
    return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0"+date.getDate()).slice(-2);
  }
  
  private getNextSundayAsDate(): Date {
    let date: Date = new Date();
    if(date.getDay() > 0) {
      date.setDate(date.getDate() + (7 - date.getDay())); // Find coming Sunday
    }
    return date;
  }
  
  private subscribeToLeaveChanges(): void {
    this.events.subscribe("user:leaveApplied", (data: LeaveStruct[]) => {
      let isSortingNeeded : boolean = false;
      data.forEach((leave) => {  // Do not add any async calls in this. Otherwise sorting gets affected.
        if(this.isTimestampInList(Number(leave.date)) == undefined && leave.revoked == false) {
          this.leaves.push(leave);
          isSortingNeeded = true;
        }
      });
      if(isSortingNeeded) {
        this.sortLeavesList();
      }
    });
    
    this.events.subscribe("user:leaveDeleted", (data) => {
      let isArrayToBeUpdated = false;
      let updatedArray = [];
      data.forEach((timestamp) => {
        if(this.isTimestampInList(timestamp)) {
          updatedArray = this.leaves.filter((element) => element.date != Number(timestamp))
          isArrayToBeUpdated = true;
        }
      });
      if(isArrayToBeUpdated) {
        this.leaves = updatedArray;
      }
    });
    
    // Changing 'revoked' from false to true is not handled
    // Changing 'date' does not invoke sort
    this.events.subscribe("user:leaveModified", (data) => {
      data.forEach((changedData) => {
        if(changedData.date != null) {
          let leaveInfo = this.isTimestampInList(changedData.date);
          if(leaveInfo != undefined && leaveInfo != null && leaveInfo[changedData.key] != null) {
            if(changedData.key == "revoked" && changedData.value == "true") {
              this.removeLeaveFromList(changedData.date);
            }
            else {
              leaveInfo[changedData.key] = changedData.value;
            }
          }
        }
      });
    });
  }
  
  private isTimestampInList(time: Number): LeaveStruct {
    return this.leaves.find((element) => element.date == time);
  }
  
  private sortLeavesList(): void {
    this.leaves.sort((a, b) => a.date - b.date); // Multiply by -1 for descending order. That simple... ;)
  }
}
