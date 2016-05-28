import {Page, Modal, NavController, Events} from 'ionic-angular';
import {NgZone} from 'angular2/core';
import {LeaveFilterPage} from '../leave-filter/leave-filter';
import {FirebaseService} from '../../providers/firebase-service/firebase-service';
import {FirebaseServiceAdmin} from '../../providers/firebase-service-admin/firebase-service-admin';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct';
import {LeaveFilterResult} from '../../util/leave-filter-result/leave-filter-result';
import {EllipsisPipe} from '../../util/ellipsis-pipe/ellipsis-pipe';
import * as Constants from '../../util/constants/leave-filter-constants';

class Section {
  constructor(public key: string, public title: string, public leavesSublist: Array<LeaveStruct>) {
    
  }
}

interface Classifier {
  sectionTypes: Array<{key: string, title: string}>;
  classify(leave: LeaveStruct, container: Array<Section>): Section;
  createSections(container: Array<Section>): void;
}

class DateClassifier implements Classifier {
  
  sectionTypes: Array<{key: string, title: string}>;
  private future: number;
  private nextMonth: number;
  private currentMonth: number;
  private lastMonth: number;
  
  constructor() {
    this.sectionTypes = [ {key: "AfterNextMonth", title: "Way ahead in the future ..."},
                          {key: "nextMonth", title: "Next month ..."},
                          {key: "thisMonth", title: "This month ..."},
                          {key: "lastMonth", title: "Last month ..."},
                          {key: "longAgo",   title: "Long ago ..."  }];
    let todaysDate = new Date();
    this.currentMonth = todaysDate.getMonth();
    this.future = new Date(todaysDate.getFullYear(), todaysDate.getMonth() + 2, todaysDate.getDate()).getMonth();
    this.nextMonth = new Date(todaysDate.getFullYear(), todaysDate.getMonth() + 1, todaysDate.getDate()).getMonth();
    this.lastMonth = new Date(todaysDate.getFullYear(), todaysDate.getMonth() - 1, todaysDate.getDate()).getMonth();
  }
  
  public classify(leave: LeaveStruct, container: Array<Section>): Section {
    if(container.length != this.sectionTypes.length) {
      this.createSections(container);
    }
    else {
      for(let i=0; i<container.length; ++i) {
        let section: Section = container[i];
        let found = this.sectionTypes.find((validSection) => section.key === validSection.key);
        if(found === undefined) {
          this.createSections(container);
          break;
        }
      }
    }
    let section: Section = {key: undefined, title: undefined, leavesSublist: undefined};
    let monthOfLeave: number = new Date(leave.date).getMonth(); 
    if(monthOfLeave >= this.future) {
      section = container.find((arg) => arg.key === this.sectionTypes[0].key);
      section.leavesSublist.push(leave);
    }
    else if(monthOfLeave === this.nextMonth) {
      section = container.find((arg) => arg.key === this.sectionTypes[1].key);
      section.leavesSublist.push(leave);
    }
    else if(monthOfLeave === this.currentMonth) {
      section = container.find((arg) => arg.key === this.sectionTypes[2].key);
      section.leavesSublist.push(leave);
    }
    else if (monthOfLeave === this.lastMonth) {
      section = container.find((arg) => arg.key === this.sectionTypes[3].key);
      section.leavesSublist.push(leave);
    }
    else {
      section = container.find((arg) => arg.key === this.sectionTypes[4].key);
      section.leavesSublist.push(leave);
    }
    return section;
  }
  
  public createSections(container: Array<Section>) {
    while(container.pop() != undefined);
    this.sectionTypes.forEach((type) => {
      let section: Section = {key: type.key, title: type.title, leavesSublist: [] };
      container.push(section);
    });
  }
}

class StatusClassifier implements Classifier {
  sectionTypes: Array<{key: string, title: string}>;
  
  constructor() {
    this.sectionTypes = [ {key: "approved", title: "Approved ..."},
                          {key: "rejected", title: "Rejected ..."},
                          {key: "pending",  title: "Pending ..."},
                          {key: "revoked",  title: "Revoked ..."}];
  }
  
  public classify(leave: LeaveStruct, container: Array<Section>): Section {
    if(container.length != this.sectionTypes.length) {
      this.createSections(container);
    }
    else {
      for(let i=0; i<container.length; ++i) {
        let section: Section = container[i];
        let found = this.sectionTypes.find((validSection) => section.key === validSection.key);
        if(found === undefined) {
          this.createSections(container);
          break;
        }
      }
    }
    let section: Section = {key: undefined, title: undefined, leavesSublist: undefined};
    if(leave.revoked) {
      section = container.find((arg) => arg.key === this.sectionTypes[3].key);
      section.leavesSublist.push(leave);
    }
    else if(leave.approved) {
      section = container.find((arg) => arg.key === this.sectionTypes[0].key);
      section.leavesSublist.push(leave);
    }
    else if(leave.rejected) {
      section = container.find((arg) => arg.key === this.sectionTypes[1].key);
      section.leavesSublist.push(leave);
    }
    else {
      section = container.find((arg) => arg.key === this.sectionTypes[2].key);
      section.leavesSublist.push(leave);
    }
    return section;
  }
  
  public createSections(container: Array<Section>) {
    while(container.pop() != undefined);
    this.sectionTypes.forEach((type) => {
      let section: Section = {key: type.key, title: type.title, leavesSublist: [] };
      container.push(section);
    });
  }
}

class NameClassifier implements Classifier {
  sectionTypes: Array<{key: string, title: string}>;
  
  constructor(private userList: Array<{uid: string, name: string, username: string}>) {
    this.sectionTypes = [];
  }
  
  public addToUserList(user: {uid: string, name: string, username: string}) {
    this.sectionTypes.push({key: user.uid, title: user.name + " ("+user.username+")"});
  }
  
  public updateUser(user: {uid: string, name: string, username: string}) {
    let sectionType = this.sectionTypes.find((section) => section.key === user.uid);
    sectionType.title = user.name + " ("+user.username+")";
  }
  
  public classify(leave: LeaveStruct, container: Array<Section>): Section {
    if(container.length != this.sectionTypes.length) {
      this.createSections(container);
    }
    else {
      for(let i=0; i<container.length; ++i) {
        let section: Section = container[i];
        let found = this.sectionTypes.find((validSection) => section.key === validSection.key);
        if(found === undefined) {
          this.createSections(container);
          break;
        }
      }
    }
    let section: Section = {key: undefined, title: undefined, leavesSublist: undefined};
    section = container.find((section) => section.key === leave.uid);
    section.leavesSublist.push(leave);
    return section;
  }
  
  public createSections(container: Array<Section>) {
    while(container.pop() != undefined);
    this.sectionTypes.forEach((type) => {
      let section: Section = {key: type.key, title: type.title, leavesSublist: [] };
      container.push(section);
    });
  }
}

@Page({
  templateUrl: 'build/pages/admin/admin.html',
  pipes: [EllipsisPipe]
})
export class AdminPage {
  leaves: Array<Section>; 
  nameList: Array<{uid: string, name: string, username: string}>;
  selectedFilters: LeaveFilterResult;
  private dateClassifier: DateClassifier;
  private statusClassifier: StatusClassifier;
  private nameClassifier: NameClassifier;
  
  
  constructor(public nav: NavController,
              public firebaseAdmin: FirebaseServiceAdmin,
              private firebaseService: FirebaseService,
              private events: Events,
              private zone: NgZone) {
    this.leaves = [];
    this.nameList = [];
    this.dateClassifier = new DateClassifier();
    this.statusClassifier = new StatusClassifier();
    this.nameClassifier = new NameClassifier(this.nameList);
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
    this.firebaseService.logout();
  }
  
  public approveLeave(leave: LeaveStruct) {
    leave.approved = true;
    leave.rejected = false;
    this.firebaseAdmin.approveLeave(leave);
  }
  
  public rejectLeave(leave: LeaveStruct) {
    leave.approved = false;
    leave.rejected = true;
    this.firebaseAdmin.rejectLeave(leave);
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
    let searchResult: {section: Section, leave: LeaveStruct} = {section: undefined, leave: undefined};
    console.log("leaveArray:"+JSON.stringify(leaveArray));
      leaveArray.forEach((leave) => {  // Do not add any async calls in this. Otherwise sorting gets affected.
        searchResult = this.searchLeave(Number(leave.date), leave.uid);
        if(searchResult.leave == undefined) {
          this.addLeaveToASection(leave);
          console.log("Leaves object:"+JSON.stringify(this.leaves));
        }
        else {
          searchResult.leave.date     = leave.date;
          searchResult.leave.approved = leave.approved;
          searchResult.leave.rejected = leave.rejected;
          searchResult.leave.revoked  = leave.revoked;
          searchResult.leave.reason   = leave.reason;
          searchResult.leave.uid      = leave.uid;
          isSortingNeeded = true;
        }
      });
      if(isSortingNeeded) {
        this.sortLeavesSection(searchResult.section);
      }
  }
  
  private removeLeave(leaveArray: Array<LeaveStruct>) {
    this.leaves.forEach((section) => {
      leaveArray.forEach((leave) => {
        let leaveToDelete: LeaveStruct = this.isLeaveInSection(Number(leave.date), leave.uid, section);
        if(leaveToDelete != undefined && leaveToDelete != null) {
          this.leaves.splice(section.leavesSublist.indexOf(leaveToDelete), 1);
          console.log("Notification: Deleted "+JSON.stringify(leaveToDelete)+" leave.");
        }
      });
    });
  }
  
  private subscribeToNameListChanges() {
    this.events.subscribe("admin:name:added", (data: Array<{uid: string, name: string, username: string}>) => {
      let isSortingNeeded = false;
      data.forEach((user) => {
        if(user.uid !== this.firebaseService.getMyUid()) {
          console.log("Adding:"+JSON.stringify(user));
          this.nameList.push(user);
          this.zone.run(() => this.nameClassifier.addToUserList(user));
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
          console.log("updating user list");
          this.zone.run(() => this.nameClassifier.updateUser(user));
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
  
  private isLeaveInSection(time: number, uid: string, section: Section) {
    return section.leavesSublist.find((element) => element.date == time && element.uid == uid);
  }
    
  private sortLeavesSection(section: Section): void {
      section.leavesSublist.sort((a, b) => a.date - b.date); // Multiply by -1 for descending order. That simple... ;)
  }
  
  private searchLeave(time: number, uid: string): {section: Section, leave: LeaveStruct} {
    let foundElement: {section: Section, leave: LeaveStruct} = {section: undefined, leave: undefined};
    for(let index: number = 0; index < this.leaves.length; ++index) {
      let section: Section = this.leaves[index];
      console.log("Searching in section "+JSON.stringify(section));
      let leaveReference = this.isLeaveInSection(time, uid, section);
      if(leaveReference != undefined) {
        foundElement.section = section;
        foundElement.leave = leaveReference;
        break;
      }
    }
    return foundElement;
  }
  
  private addLeaveToASection(leave: LeaveStruct): void {
    let updatedSection: Section = undefined;
    let user = this.nameList.find((user) => user.uid === leave.uid);
    leave.displayName = user.name + " (" + user.username + ")";
    switch(this.selectedFilters.groupBy) {
      case Constants.FILTER_TYPES.dateGroup:
        updatedSection = this.dateClassifier.classify(leave, this.leaves);
      break;
      
      case Constants.FILTER_TYPES.statusGroup:
        updatedSection = this.statusClassifier.classify(leave, this.leaves);
      break;
      
      case Constants.FILTER_TYPES.nameGroup:
      updatedSection = this.nameClassifier.classify(leave, this.leaves);
      break;
    }
    if(updatedSection != undefined) {
      this.sortLeavesSection(updatedSection);
    }
  }
}
