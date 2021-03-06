import {Component, OnInit} from '@angular/core';
import {ModalController, Platform} from '@ionic/angular';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {Plugins, StatusBarStyle} from '@capacitor/core';

const {StatusBar} = Plugins;

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  constructor(private modalCtrl: ModalController, private platform: Platform, private emailComposer: EmailComposer) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    StatusBar.setStyle({style: StatusBarStyle.Light});
  }

  public async close() {
    await this.modalCtrl.dismiss({
      dismissed: true,
      close: true,
    });
  }

  public async sendEmail() {
    if (this.platform.is('cordova')) {
      this.emailComposer.isAvailable().then((available: boolean) => {
        if (available) {
        }
      });

      const email = {
        to: 'contact@matthias-prost.com',
        subject: '[Scaleway Manager]',
        isHtml: true
      };

      await this.emailComposer.open(email);
    } else {
      console.warn('Cordova not available');
    }
  }

}
