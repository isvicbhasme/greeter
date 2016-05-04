import 'es6-shim';
import {App, IonicApp, Platform, Events, Toast} from 'ionic-angular';
import {StatusBar, DatePicker} from 'ionic-native';
import {AdminPage} from './pages/admin/admin';
import {LoginPage} from './pages/login/login';
import {ApplyLeavePage} from './pages/apply-leave/apply-leave';
import {FirebaseService} from './providers/firebase-service/firebase-service'


@App({
  templateUrl: 'build/app.html',
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers: [FirebaseService] 
})
class MyApp {
  rootPage: any = LoginPage;
  pages: Array<{title: string, component: any}>

  constructor(private app: IonicApp, private platform: Platform, private events: Events) {
    this.initializeApp();
    this.subscribeToAuthChanges();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
  
  private subscribeToAuthChanges() {
    this.events.subscribe("user:loggedout", () => {
      let toast = Toast.create({
        message: "Please login to proceed.",
        duration: 3000
      });
      this.app.getComponent('nav').present(toast);
      if(this.app.getComponent('nav').getActiveChildNav() != LoginPage) {
        this.app.getComponent('nav').setRoot(LoginPage);
      }
    });
    
    this.events.subscribe("user:loggedin", (isAdmin: boolean) => {
      if(this.app.getComponent('nav').getActiveChildNav() == null ||
          this.app.getComponent('nav').getActiveChildNav() == LoginPage) {
        let toast = Toast.create({
          message: "You have logged in.",
          duration: 3000
        });
        this.app.getComponent('nav').present(toast);
        if(isAdmin) {
          this.app.getComponent('nav').setRoot(AdminPage, {animate: true});
        } else {
          this.app.getComponent('nav').setRoot(ApplyLeavePage, {animate: true});
        }
      }
    });
  }
}
