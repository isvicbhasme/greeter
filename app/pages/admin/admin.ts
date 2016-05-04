import {Page, Modal, NavController} from 'ionic-angular';
import {LeaveFilterPage} from '../leave-filter/leave-filter';

/*
  Generated class for the AdminPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/admin/admin.html',
})
export class AdminPage {
  constructor(public nav: NavController) {}
  
  public showFilter() {
    let filterModal = Modal.create(LeaveFilterPage);
    this.nav.present(filterModal);
  }
}
