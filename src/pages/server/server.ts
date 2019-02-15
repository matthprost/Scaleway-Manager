import {Component} from '@angular/core';
import {ItemSliding, LoadingController, NavController, NavParams} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {AuthTokenDto} from "../../providers/auth/auth-tokens.dto";
import {ServersProvider} from "../../providers/servers/servers";
import {ServerDto} from "../../providers/servers/server.dto";
import {ShowServerPage} from "./show-server/show-server";

@Component({
  selector: 'page-server',
  templateUrl: 'server.html',
})
export class ServerPage {

  public serverNetherlands: { servers: Array<ServerDto>, country: 'Netherlands' };
  public serverParis: { servers: Array<ServerDto>, country: 'Paris' };

  public loader = this.loadingCtrl.create({
    content: "Please wait...",
  });

  public isLoading: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController,
              private storage: Storage, private serversProvider: ServersProvider) {
  }

  ionViewDidEnter() {
    this.refreshAllServers()
      .then(() => {
      this.isLoading = false;
    })
      .catch(error => {
      console.log(error);
    });
  }

  private refreshAllServers(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.storage.get('token').then((token: AuthTokenDto) => {
        this.serversProvider.getAllServer(token.token.id).then(result => {
          this.serverParis = { 'servers': result.paris.servers, 'country': 'Paris' };
          this.serverNetherlands = { 'servers': result.netherlands.servers, 'country': 'Netherlands' };
          resolve('ok');
        });
      })
        .catch(error => {
          console.log(error);
        });
    });
  }

  public doRefresh(refresher) {
    this.refreshAllServers().then(() => {
      refresher.complete();
    }).catch(error => {
      console.log(error);
      refresher.complete();
    });
  }

  public showServer(server: any, country: string) {
    this.navCtrl.push(ShowServerPage, {server: server, serverCountry: country});
  }

  // This function is for fast action on servers like start/stop
  public serverAction(server, action, slidingItem: ItemSliding, country: string) {
    slidingItem.close();
    this.storage.get('token').then(token => {
      this.serversProvider.sendServerAction(country, server.id, token.token.id, action)
        .then(() => {
          this.refreshAllServers();
        })
        .catch(error => {
        console.log(error);
      })
    });
  }

  public setState(server: ServerDto): string {
    switch (server.state) {
      case 'stopped':
        return 'red';
      case 'running':
        return '#27c295';
      case 'stopping':
        return 'orange';
      case 'starting':
        return 'orange';
      default:
        return 'gray';
    }
  }

  // It counts how many server in a state (ex: 2 servers are running)
/*  public countServersByState(servers: Array<ServerDto>, state: string): number {
    let i: number = -1;
    let counter: number = 0;

    while (servers[++i]) {
      if (servers[i].state === state) {
        counter++;
      }
    }

    return (counter);
  }*/

  // It get all servers by a specific state (ex: all servers that are running)
 /* public getServerByState(state: Array<string>): ServerDto[] {
    let newServers: ServerDto[] = [];

    this.allServers.forEach(server => {
      state.forEach(result => {
        if (result === server.state) {
          newServers.push(server);
        }
      });
    });

    return (newServers);
  }*/

}
