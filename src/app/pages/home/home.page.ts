import {Component, OnInit} from '@angular/core';
import {MenuController, NavController} from '@ionic/angular';
import {ServerDto} from '../../services/servers/server.dto';
import {ServersService} from '../../services/servers/servers.service';
import {BillingService} from '../../services/billing/billing.service';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {BillingDto} from '../../services/billing/billing.dto';
import {Storage} from '@ionic/storage';
import {AccountService} from '../../services/user/account/account.service';
import {Plugins, StatusBarStyle} from '@capacitor/core';

const {StatusBar} = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public classAppear = 'card-cont';
  public serversInstances: Array<ServerDto> = [];
  public isLoading = true;

  faRight = faChevronRight;

  private interval;
  private intervalSet = false;

  public billings: BillingDto = null;

  public billingError = false;
  public serverError = false;

  public currentOrganization = '';

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 2.15,
    slidesOffsetBefore: 15,
    slidesOffsetAfter: 15
  };

  // STORAGE SETTINGS
  public instancesToDisplay = 6;

  constructor(public navCtrl: NavController, private srvService: ServersService,
              private billingService: BillingService, private menuCtrl: MenuController,
              private storage: Storage, private accountProvider: AccountService) {
  }

  ngOnInit() {
  }

  ionViewDidLeave() {
    clearInterval(this.interval);
  }

  ionViewDidEnter() {
    this.isLoading = true;
    StatusBar.setStyle({ style: StatusBarStyle.Dark });
    this.menuCtrl.enable(true);
    this.billingService.getXMonthsLastBilling(6).then(value => {
      this.billings = value.invoices;
    }).catch(() => {
      this.billingError = true;
    });
    this.refresh().then(() => {
      this.autoRefresh();
      this.classAppear = 'card-appear';
      this.isLoading = false;
    });
  }

  private async refresh(): Promise<any> {
    const userData = await this.accountProvider.getUserData();
    const currentOrganization = await this.storage.get('currentOrganization');
    this.currentOrganization = userData.organizations.find(organization => organization.id === currentOrganization);
    return new Promise((resolve, reject) => {
      this.storage.get('settings').then(result => {
        if (result) {
          result.instancesToDisplay ? this.instancesToDisplay = result.instancesToDisplay : this.instancesToDisplay = 6;
        }
        this.srvService.getAllServer(this.instancesToDisplay).then(value => {
          this.serversInstances = value;

          resolve('ok');
        })
          .catch(error => {
            this.isLoading = false;
            this.serverError = true;
            reject(error);
          });
      });
    });
  }

  private async autoRefresh() {
    console.log('[AUTO REFRESH]: Entering function');
    let counter = 0;

    this.serversInstances.forEach(server => {
      if (server.state === 'starting' || server.state === 'stopping') {
        counter++;
      }
    });

    if (counter > 0 && !this.intervalSet) {
      this.intervalSet = true;

      this.interval = setInterval(() => {
        console.log('[AUTO REFRESH]: Entering interval');

        let newCounter = 0;

        this.serversInstances.forEach(server => {
          if (server.state === 'starting' || server.state === 'stopping') {
            newCounter++;
          }
        });
        if (newCounter > 0) {
          this.refresh();
        } else {
          console.log('[AUTO REFRESH]: Interval cleared!');
          clearInterval(this.interval);
          this.intervalSet = false;
        }
      }, 15000);
    } else {
      console.log('[AUTO REFRESH]: No interval needed');
    }
  }

  public startAndStopServers(event: any, server: ServerDto) {

    console.log(event.detail.checked);

    if (event.detail.checked === true) {
      this.srvService.sendServerAction(server.country, server.id, 'poweron').then(() => {
        this.refresh().then(() => {
          this.autoRefresh();
        });
        return;
      });
    } else if (event.detail.checked === false) {
      this.srvService.sendServerAction(server.country, server.id, 'poweroff').then(() => {
        this.refresh().then(() => {
          this.autoRefresh();
        });
        return;
      });
    }
  }

  public setState(server: ServerDto): string {
    switch (server.state) {
      case 'stopped':
        return '#B2B6C3';
      case 'running':
        return '#30D1AD';
      case 'stopping':
        return '#3F6ED8';
      case 'starting':
        return '#3F6ED8';
      case 'stopped in place':
        return '#FF8C69';
      default:
        return '#B2B6C3';
    }
  }

  public setToggle(server: ServerDto): boolean {
    switch (server.state) {
      case 'stopped':
        return false;
      case 'running':
        return true;
      case 'stopping':
        return false;
      case 'starting':
        return true;
      case 'stopped in place':
        return true;
      default:
        return false;
    }
  }

  public setDisabled(server: ServerDto): boolean {
    switch (server.state) {
      case 'stopped':
        return false;
      case 'running':
        return false;
      case 'stopping':
        return true;
      case 'starting':
        return true;
      case 'stopped in place':
        return false;
      default:
        return false;
    }
  }

  public setClass(server: ServerDto): string {
    switch (server.state) {
      case 'stopped':
        return 'state';
      case 'running':
        return 'state';
      case 'stopping':
        return 'blinker';
      case 'starting':
        return 'blinker';
      default:
        return 'state';
    }
  }

  public async navigate(location: string, country?: string, serverId?: string) {
    switch (location) {
      case 'account' :
        await this.navCtrl.navigateForward(['/home/account']);
        break;
      case 'instances' :
        await this.navCtrl.navigateForward(['/instances']);
        break;
      case 'instancesDetails' :
        await this.navCtrl.navigateForward(['/instances/' + country + '/' + serverId]);
      case 'os' :
        await this.navCtrl.navigateForward(['/buckets/']);
      /*case 'contact' :
        fab.close();
        this.navCtrl.push(ContactPage);
        break;
      case 'bug' :
        fab.close();
        this.navCtrl.push(BugReportPage);
        break;
      case 'billing' :
        this.navCtrl.push(BillingPage);
        break;
      case 'about' :
        this.navCtrl.push(AboutPage);
        break;*/
    }
  }

  /*public navigateServ(serverInfo: { server: ServerDto, country: string }) {
    this.navCtrl.push(ShowServerPage, {server: serverInfo.server, serverCountry: serverInfo.country});
  }*/

  /*public openWebSite(fab: FabContainer) {

    const options: InAppBrowserOptions = {
      zoom: 'no',
      location: 'no',
      toolbarposition: 'top'
    };

    this.iab.create('https://matthias-prost.com',
      '_blank', options);
  }*/

}
