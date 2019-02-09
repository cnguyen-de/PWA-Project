import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';

import {FirstRunPage, Tab1Root} from '../pages';
import { Settings } from '../providers';

import { Api } from '../providers/api/api';

@Component({
  template: `<ion-menu [content]="content">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{'MENU'|translate}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <button menuClose ion-item *ngFor="let p of pages" (click)="openPage(p)">
          {{p.title}}
        </button>
      </ion-list>
    </ion-content>

  </ion-menu>
  <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class AppComponent {

  rootPage = this.showHomePage();
  
  swRegistration = null;
  isSubscribed = false;
  readonly applicationServerPublicKey = 'BAQrd8Zlbiw-GwnoZON03SKCTbM7S4MsopPDDJyr7c3_-PLAzZl1OQ4iMhTsqzqwwxPKuXohHBZiWvy6Tl35Qpk';

  showHomePage() {
    if (sessionStorage.getItem("username")) {
      return Tab1Root
    } else {
      return FirstRunPage
    }
  }

  populateMenu() {
    let array =  [
      { title: 'Home', component: 'WelcomePage'},
      { title: 'Login', component: 'LoginPage' },
      { title: 'Signup', component: 'SignupPage' },
      { title: 'About Us', component: 'AboutPage'},
      { title: 'Contact', component: 'ContactPage'},
    ];
    if (sessionStorage.getItem("username")) {
      array.push({title: 'Overview', component: 'TabsPage'});
      array.push({title: 'New Transaction', component: 'NewTransactionPage'});
    }
    return array
  }
  @ViewChild(Nav) nav: Nav;
  pages: any[] = this.populateMenu();


  constructor(private translate: TranslateService, private api : Api, platform: Platform, settings: Settings, private config: Config, private statusBar: StatusBar, private splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.initTranslate();
    this.initPush();
  }

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();

    if (browserLang) {
      if (browserLang === 'zh') {
        const browserCultureLang = this.translate.getBrowserCultureLang();

        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translate.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translate.use('zh-cmn-Hant');
        }
      } else {
        this.translate.use(this.translate.getBrowserLang());
      }
    } else {
      this.translate.use('en'); // Set your language here
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }

  initPush() {
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Service Worker and Push is supported');
    
      navigator.serviceWorker.register('service-worker.js')
        .then((swReg) => {
          console.log('Service Worker is registered', swReg);
    
          this.swRegistration = swReg;

          setInterval(() => {
            //what happens
              var username = sessionStorage.getItem("username");
            
              console.log("Interval invoked for main.js:", username);
            
              if(!username){
            
                if (this.isSubscribed == false) {
                  this.subscribeUser();
                  this.sendSubscribeInfoToBackend(username, this.swRegistration.pushManager.getSubscription());
                  return; //or break or something that takes you out
            
                } else {
            
                }
              }
            
            
            }, 5000);
          
        })
        .catch(function(error) {
          console.error('Service Worker Error', error);
        });
    } else {
      console.warn('Push messaging is not supported');
    }
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  subscribeUser() {
    const applicationServerKey = this.urlB64ToUint8Array(this.applicationServerPublicKey);
    this.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
      .then(function(subscription) {
        console.log('User is subscribed.');
  
        this.updateSubscriptionOnServer(subscription);
  
        this.isSubscribed = true;
  
        // updateBtn();
      })
      .catch(function(err) {
        console.log('Failed to subscribe the user: ', err);
        // updateBtn();
      });
  }

  sendSubscribeInfoToBackend(username, subInfo) {
    let postInfo = {username: username, subscription_info: subInfo }
    let seq = this.api.post('subscription', postInfo).share()
    seq.subscribe((res) => {
      console.log("Subscription result", res)
    }, err => {
      console.error("ERROR in subscription", err)
    })
  }

  updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
  }  

  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
