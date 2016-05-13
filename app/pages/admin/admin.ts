import {Page, Modal, NavController, Events} from 'ionic-angular';
import {LeaveFilterPage} from '../leave-filter/leave-filter';
import {FirebaseService} from '../../providers/firebase-service/firebase-service';
import {FirebaseServiceAdmin} from '../../providers/firebase-service-admin/firebase-service-admin';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct';

/*
  Generated class for the AdminPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/admin/admin.html'
})
export class AdminPage {
  leaves: Array<LeaveStruct>; 
  nameList: Array<{uid: string, name: string, username: string}>;
  
  constructor(public nav: NavController,
              public firebaseAdmin: FirebaseServiceAdmin,
              private firebaseService: FirebaseService,
              private events: Events) {
    this.leaves = [];
    this.nameList = [];
    this.initializeFirebaseEvents();
  }
  
  public showFilter() {
    let filterModal = Modal.create(LeaveFilterPage, {names: this.nameList});
    filterModal.onDismiss((data: {groupBy: string, filterBy: string, filterInfo: Array<string>}) => {
      console.log(JSON.stringify(data));
      this.leaves = [];
      this.firebaseAdmin.registerAdminForLeaveListing({by: data.filterBy, info: data.filterInfo});
    });
    this.nav.present(filterModal);
  }
  
  public logout() {
    this.firebaseService.getRefToBaseUrl().unauth();
  }
  
  private initializeFirebaseEvents(): void {
    this.subscribeToLeaveChanges();
    this.subscribeToNameListChanges();
    this.firebaseService.registerForCurrentUserLeaveEvents();
    this.firebaseAdmin.registerForNamelistEvents();
    let todaysDate = new Date();
    let beginingOfMonth = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1);
    let fromDateFilter = beginingOfMonth.getTime();
    let toDateFilter = new Date(beginingOfMonth.getFullYear(), beginingOfMonth.getMonth()+1, beginingOfMonth.getDate()-1).getTime();
    this.firebaseAdmin.registerAdminForLeaveListing({by: "dateFilter", info: [fromDateFilter.toString(), toDateFilter.toString()]});
  }
  
  // private removeLeaveFromList(date: number): LeaveStruct[] {
  //   let leaveToDelete = this.isLeaveInList(date);
  //   let deletedLeaves: LeaveStruct[] = [];
  //   if(leaveToDelete != undefined && leaveToDelete != null) {
  //     deletedLeaves = this.leaves.splice(this.leaves.indexOf(leaveToDelete), 1);
  //     console.log("Notification: Deleted "+deletedLeaves[0].date+" leave.");
  //   }
  //   return deletedLeaves;
  // }
  
  private subscribeToLeaveChanges(): void {
    this.events.subscribe("admin:leave:added", (data: LeaveStruct[]) => {
      this.addOrUpdateLeave(data);
    });
    
    this.events.subscribe("admin:leave:changed", (data: LeaveStruct[]) => {
      this.addOrUpdateLeave(data);
    });
    
    // this.events.subscribe("user:leaveDeleted", (data) => {
    //   data.forEach((timestamp) => {
    //     this.removeLeaveFromList(timestamp);
    //   });
    // });
    
    // // Changing 'date' does not invoke filter
    // this.events.subscribe("user:leaveModified", (data) => {
    //   data.forEach((changedData) => {
    //     if(changedData.date != null) {
    //       let leaveInfo = this.isLeaveInList(changedData.date);
    //       if(leaveInfo != undefined && leaveInfo != null && leaveInfo[changedData.key] != null) {
    //         leaveInfo[changedData.key] = changedData.value;
    //       }
    //     }
    //   });
    // });
  }
  
  private addOrUpdateLeave(leaveArray: Array<LeaveStruct>) {
    let isSortingNeeded : boolean = false;
      leaveArray.forEach((leave) => {  // Do not add any async calls in this. Otherwise sorting gets affected.
        let existingLeave: LeaveStruct = this.isLeaveInList(Number(leave.date), leave.uid);
        if(existingLeave == undefined) {
          this.leaves.push(leave);
          isSortingNeeded = true;
        }
        else {
          existingLeave.date     = leave.date;
          existingLeave.approved = leave.approved;
          existingLeave.rejected = leave.rejected;
          existingLeave.revoked  = leave.revoked;
          existingLeave.reason   = leave.reason;
          existingLeave.uid      = leave.uid;
          isSortingNeeded = true;
        }
      });
      if(isSortingNeeded) {
        this.sortLeavesList();
      }
  }
  
  private subscribeToNameListChanges() {
    this.events.subscribe("admin:name:added", (data: Array<{uid: string, name: string, username: string}>) => {
      let isSortingNeeded = false;
      data.forEach((user) => {
        if(user.uid !== this.firebaseService.getMyUid()) {
          console.log("Adding:"+JSON.stringify(user));
          this.nameList.push(user);
          isSortingNeeded = true;
        }
      });
      if(isSortingNeeded) {
        this.sortNameList();
      }
    });
    
    this.events.subscribe("admin:name:changed", (data: Array<{uid: string, name: string, username: string}>) => {
      let isSortingNeeded = false;
      data.forEach((user) => {
        let changedUser = this.nameList.find((iter)=> iter.uid === user.uid);
        if(changedUser != null) {
          changedUser.name = user.name;
          changedUser.username = user.username;
          isSortingNeeded = true;
        }
      });
      if(isSortingNeeded) {
        this.sortNameList();
      }
    });
  }
  
  private sortNameList() {
    this.nameList.sort((a, b) => {
      if(a.name < b.name)
        return -1;
      else if(a.name > b.name)
        return 1;
      else
        return 0;
    });
  }
  
  private isLeaveInList(time: Number, uid: string): LeaveStruct {
    return this.leaves.find((element) => element.date == time && element.uid == uid);
  }
  
  private sortLeavesList(): void {
    this.leaves.sort((a, b) => a.date - b.date); // Multiply by -1 for descending order. That simple... ;)
  }
}
