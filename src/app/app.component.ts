import { Component, HostListener, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Web3 from 'web3/src';
import * as Instascan from 'instascan';


declare var window: any;
declare var navigator: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Dapp Urls
  dappUrl: string = 'http://www.qrcodechain.com';
  itemId: string = 'trackMeOnBlockchain';
  trackableItem: string = `${this.dappUrl}/?action=${this.itemId}`;
  saveLocationItem: string = `${this.dappUrl}/?action=saveLocation`;


  web3: any;
  options: any = {
        'from': '0x902D578B7E7866FaE71b3AB0354C9606631bCe03',
        'gas': '44000'
      };
  contractHash: string = '0x09d10c8e1a92a5adeb91dd432a5ab17319b4acde';
  MyContract: any;
  contract: any;
  ABI: any = [{"constant":true,"inputs":[{"name":"idx","type":"uint256"}],"name":"getLocationHistory","outputs":[{"name":"delegate","type":"address"},{"name":"longitude","type":"bytes32"},{"name":"latitude","type":"bytes32"},{"name":"timestamp","type":"uint256"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getLocationLength","outputs":[{"name":"count","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"longitude","type":"bytes32"},{"name":"latitude","type":"bytes32"},{"name":"name","type":"bytes32"}],"name":"saveLocation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"locations","outputs":[{"name":"delegate","type":"address"},{"name":"longitude","type":"bytes32"},{"name":"latitude","type":"bytes32"},{"name":"timestamp","type":"uint256"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"item","outputs":[{"name":"id","type":"bytes32"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"id","type":"bytes32"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

  scanner: Instascan.Scanner;
  camera: Instascan.Camera;
  showScanner: boolean = false;
  demoMessage: string = '';

  showLocations: boolean = false;
  gettingLocations: boolean = false;
  history: Array<any> = [];

  name: string = 'Apple';
  showApple: boolean = false;

  constructor(private route: ActivatedRoute, private zone: NgZone) {

    this.route.queryParams.subscribe(params => {

      if (params && params.action === this.itemId) {
        this.loadApple();
      }

    });

  }

  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();

    // Scroll to fragments
    this.route.fragment.subscribe(fragment => {

      if (fragment) {
        // Scroll to fragment
        const el = document.querySelector('#' + fragment);
        if (el) {
          el.scrollIntoView();
        }
      } else {
        // Scroll to top if no fragment
        window.scrollTo(0, 0);
      }
    });

  }

  getLocationHistory() {
    this.showLocations = true;
    document.querySelector('#results').scrollIntoView();
    this.demoMessage = 'Getting previous locations...';
    this.gettingLocations = true;

    this.MyContract.methods.getLocationLength().call().then(length => {
      length = Number(length);
      console.log('Location length: ', length);
      let last = false;

      for (let index = 0; index < length; index++) {
        if ((index + 1) === length) {
          last = true;
        }

        this.MyContract.methods.getLocationHistory(index).call()
          .then(history => this.handleHistory(history, last));
      }
      return length;
    });
  }

  scanPhone(): void {
    // Open Scanner
    this.toggleScanner();
    // Init Scanner
    this.scanner = new Instascan.Scanner({
      video: document.getElementById('preview'),
      mirror: true
    });
    // Turn on Camera
    Instascan.Camera.getCameras().then(cameras => {
      if (cameras.length > 0) {
        this.camera = cameras[0];
        this.scanner.start(this.camera);
      } else {
        console.error('No cameras found.');
      }
      //
      // Wait for successful scan
      this.scanner.addListener('scan', content => {
        console.log('content')
        console.log(content)
        if (content === this.saveLocationItem) {
          this.scanner.stop(this.camera);
          //
          // Get and save locations
          this.zone.run(() => {
            this.toggleScanner();
            this.getLocationHistory();
          });
        }
      });

    }).catch(function (e) {
      this.close();
      console.error(e);
    });
  }


  simulate(): void {
    this.close();
    this.getLocationHistory();
  }

  close(): void {
    this.scanner.stop(this.camera);
    this.toggleScanner();
  }

  closeApple() {
    this.showApple = false;
  }

  private checkAndInstantiateWeb3 = () => {
    if (typeof window.web3 !== 'undefined') {
      console.warn('Using web3 detected from external source.');
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(`No web3 detected. Falling back to http://localhost:8545.`);
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
      );
    }
    this.MyContract = new this.web3.eth.Contract(this.ABI, this.contractHash);
  }

  private getAndSaveLocation() {

    //
    // Get current location
    navigator.geolocation.getCurrentPosition((position) => {
      console.log('Location:', position);
      // this.demoMessage = 'Saving Item Location...';
      let locData = (window.web3.fromAscii(position.coords.longitude.toString()),
              window.web3.fromAscii(position.coords.latitude.toString()),
              window.web3.fromAscii(this.name));
      //
      // Save to blockchain
      // this.MyContract.methods
      //   .saveLocation(locData)
      //   .send(this.options)
      //   .then(location => this.handleLocationSave(location, locData));

    });
  }

  private handleLocationSave(location: any, data: any): void {
     console.log('Saved Location Receipt: ', location);

     this.history.push({
       name: this.name,
       latitude: data[1],
       longitude: data[0],
       delegate: this.options['from'],
       timestamp: Date()
     });
  }

  private handleHistory(historyItem: any, last: boolean): void {
    console.log('last')
    console.log(last)
    if (last) {
      this.gettingLocations = false;
    }
    historyItem.name = window.web3.toAscii(historyItem.name);
    historyItem.latitude = window.web3.toAscii(historyItem.latitude);
    historyItem.longitude = window.web3.toAscii(historyItem.longitude);
    this.zone.run(() => {
      this.history.push(historyItem);
    })
    console.log(this.history)
  }

  private toggleScanner(): void {
    this.showScanner = !this.showScanner;
  }

  private loadApple() {
    this.showApple = true;
  }

}
