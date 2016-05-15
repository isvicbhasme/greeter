import {Page, Modal, NavController, Events} from 'ionic-angular';
import {NgZone} from 'angular2/core';
import {LeaveFilterPage} from '../leave-filter/leave-filter';
import {FirebaseService} from '../../providers/firebase-service/firebase-service';
import {FirebaseServiceAdmin} from '../../providers/firebase-service-admin/firebase-service-admin';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct';
import {LeaveFilterResult} from '../../util/leave-filter-result/leave-filter-result';
import * as Constants from '../../util/constants/leave-filter-constants';

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
  selectedFilters: LeaveFilterResult;
  
  constructor(public nav: NavController,
              public firebaseAdmin: FirebaseServiceAdmin,
              private firebaseService: FirebaseService,
              private events: Events,
              private zone: NgZone) {
    this.leaves = [];
    this.nameList = [];
    this.initializeSelectedFilters();
    this.initializeFirebaseEvents();
  }
  
  public showFilter() {
    let defaultFilterSelection = this.selectedFilters;
    if(defaultFilterSelection.filterBy != Constants.FILTER_TYPES.dateFilter && defaultFilterSelection.filterBy != Constants.FILTER_TYPES.nameFilter) {
      defaultFilterSelection.filterInfo = []; // Filter modal does not need filterInfo params for date and name filter
    }
    let filterModal = Modal.create(LeaveFilterPage, {names: this.nameList, defaultFilters: defaultFilterSelection});
    filterModal.onDismiss((data: LeaveFilterResult) => {
      console.log(JSON.stringify(data));
      this.leaves = [];
      this.selectedFilters = data;
      this.firebaseAdmin.unregisterLeaveEvents();
      this.firebaseAdmin.registerForLeaveListing({by: data.filterBy, info: data.filterInfo});
    });
    this.nav.present(filterModal);
  }
  
  public logout() {
    this.firebaseService.getRefToBaseUrl().unauth();
  }
  
  private initializeSelectedFilters(): void {
    let todaysDate = new Date();
    let beginingOfMonth = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1);
    let fromDateFilter = beginingOfMonth.getTime();
    let toDateFilter = new Date(beginingOfMonth.getFullYear(), beginingOfMonth.getMonth()+1, beginingOfMonth.getDate()-1).getTime();
    this.selectedFilters = {groupBy: Constants.FILTER_TYPES.dateGroup, filterBy: Constants.FILTER_TYPES.dateFilter, filterInfo: [fromDateFilter.toString(), toDateFilter.toString()]};
  }
  
  private initializeFirebaseEvents(): void {
    this.subscribeToLeaveChanges();
    this.subscribeToNameListChanges();
    this.firebaseService.registerForCurrentUserLeaveEvents();
    this.firebaseAdmin.registerForNamelistEvents();
    
    this.firebaseAdmin.unregisterLeaveEvents();
    this.firebaseAdmin.registerForLeaveListing({by: this.selectedFilters.filterBy, info: this.selectedFilters.filterInfo});
  }
  
  private subscribeToLeaveChanges(): void {
    this.events.subscribe("admin:leave:added", (data: LeaveStruct[]) => {
      this.zone.run(() => this.addOrUpdateLeave(data));
    });
    
    this.events.subscribe("admin:leave:changed", (data: LeaveStruct[]) => {
      this.zone.run(()=> this.addOrUpdateLeave(data));
    });
    
    this.events.subscribe("admin:leave:removed", (data: LeaveStruct[]) => {
      this.zone.run(() => this.removeLeave(data));
    });
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
  
  private removeLeave(leaveArray: Array<LeaveStruct>) {
    leaveArray.forEach((leave) => {
      let leaveToDelete: LeaveStruct = this.isLeaveInList(Number(leave.date), leave.uid);
      if(leaveToDelete != undefined && leaveToDelete != null) {
        this.leaves.splice(this.leaves.indexOf(leaveToDelete), 1);
        console.log("Notification: Deleted "+JSON.stringify(leaveToDelete)+" leave.");
      }
    });
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
