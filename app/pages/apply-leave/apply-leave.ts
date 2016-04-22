import {Page, Alert, NavController} from 'ionic-angular';
import {DatePicker} from 'ionic-native';

@Page({
  templateUrl: 'build/pages/apply-leave/apply-leave.html'
})

export class ApplyLeavePage  {
  leaves: Array<{reason: string, date: number}>; 
  takeOff: {reason: string, date: number};
  
  constructor(private nav: NavController) {
    this.leaves = [];
    this.takeOff = {reason: "", date: this.getTodaysDateInMilliSec()};
  }
  
  public revokeLeave(leave: {reason: string, date: number}) {
    let leaveToDelete: number = this.leaves.indexOf(leave);
    if(leaveToDelete > -1) {
      let deletedLeaves: any[] = this.leaves.splice(leaveToDelete, 1);
      console.log("Notification: Deleted "+deletedLeaves.length+" leave(s).");
    } else {
      console.log("Error: Tried to delete leave at index:"+leaveToDelete+" data:"+JSON.stringify(leave));
    }
  }
  
  public showPopup() {
    // DatePicker.show({
    //   date: this.getNextSundayAsDate(),
    //   mode: 'date',
    //   titleText: 'Take-off on...',
    //   todayText: 'Today'
    // }).then(
    //   date => {
    //     console.log(date);
    //     if(date != null) {
    //       this.takeOff.date = date.getTime();
    //       console.log("Calling addLeaveToList() "+ JSON.stringify(this.takeOff));
    //       this.addLeaveToList();
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
          value: this.getNextSundayAsMilliSec()
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
              this.addLeaveToList();
            }
          }
        }
      ]
    });
    this.nav.present(prompt);
  }
  
  private addLeaveToList() {
    if(this.takeOff.reason != null && this.takeOff.reason.length > 0 && this.takeOff.date > 0) {
      this.leaves.push({reason: this.takeOff.reason, date: this.takeOff.date});
      console.log("Pushed successfully");
    }
    this.takeOff = {reason: "", date: this.getTodaysDateInMilliSec()};
  }
  
  private getTodaysDateInMilliSec() {
    let date:Date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }
  
  private getNextSundayAsMilliSec() {
    let date: Date = new Date();
    if(date.getDay() > 0) {
      date.setDate(date.getDate() + (7 - date.getDay())); // Find coming Sunday
    }
    return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + date.getDate();
  }
  
  private getNextSundayAsDate() {
    let date: Date = new Date();
    if(date.getDay() > 0) {
      date.setDate(date.getDate() + (7 - date.getDay())); // Find coming Sunday
    }
    return date;
  }
}