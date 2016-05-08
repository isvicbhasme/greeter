import {Page, Modal, NavController, Events} from 'ionic-angular';
import {LeaveFilterPage} from '../leave-filter/leave-filter';
import {FirebaseService} from '../../providers/firebase-service/firebase-service'
import {LeaveStruct} from '../../providers/leave-struct/leave-struct'

/*
  Generated class for the AdminPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/admin/admin.html',
})
export class AdminPage {
  leaves: Array<LeaveStruct>; 
  
  constructor(public nav: NavController,
              private firebaseService: FirebaseService,
              private events: Events) {
    this.leaves = [];
    this.subscribeToLeaveChanges();
    firebaseService.registerForCurrentUserLeaveEvents();
  }
  
  public showFilter() {
    let filterModal = Modal.create(LeaveFilterPage);
    this.nav.present(filterModal);
  }
  
  public logout() {
    this.firebaseService.getRefToBaseUrl().unauth();
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
  
  private subscribeToLeaveChanges(): void {
    // this.events.subscribe("user:leaveApplied", (data: LeaveStruct[]) => {
    //   let isSortingNeeded : boolean = false;
    //   data.forEach((leave) => {  // Do not add any async calls in this. Otherwise sorting gets affected.
    //     if(this.isTimestampInList(Number(leave.date)) == undefined) {
    //       this.leaves.push(leave);
    //       isSortingNeeded = true;
    //     }
    //   });
    //   if(isSortingNeeded) {
    //     this.sortLeavesList();
    //   }
    // });
    
    // this.events.subscribe("user:leaveDeleted", (data) => {
    //   data.forEach((timestamp) => {
    //     this.removeLeaveFromList(timestamp);
    //   });
    // });
    
    // // Changing 'date' does not invoke sort
    // this.events.subscribe("user:leaveModified", (data) => {
    //   data.forEach((changedData) => {
    //     if(changedData.date != null) {
    //       let leaveInfo = this.isTimestampInList(changedData.date);
    //       if(leaveInfo != undefined && leaveInfo != null && leaveInfo[changedData.key] != null) {
    //         leaveInfo[changedData.key] = changedData.value;
    //       }
    //     }
    //   });
    // });
  }
  
  private isTimestampInList(time: Number): LeaveStruct {
    return this.leaves.find((element) => element.date == time);
  }
  
  private sortLeavesList(): void {
    this.leaves.sort((a, b) => a.date - b.date); // Multiply by -1 for descending order. That simple... ;)
  }
}
