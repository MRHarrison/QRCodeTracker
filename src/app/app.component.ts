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
  title = 'app';
  dappUrl: string = 'https://barcode.felix.exchange';
  itemId: string = 'trackMeOnBlockchain';
  trackableItem: string = `https://barcode.felix.exchange?action=${this.itemId}`;
  saveLocationItem: string = `https://barcode.felix.exchange?action=saveLocation`;
  web3: any;
  contractHash: string = '0x3b8a60616bde6f6d251e807695900f31ab12ce1a';
  MyContract: any;
  contract: any;
  ABI: any = [{"constant":true,"inputs":[{"name":"idx","type":"uint256"}],"name":"getLocationHistory","outputs":[{"name":"delegate","type":"address"},{"name":"longitude","type":"uint128"},{"name":"latitude","type":"uint128"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"recentLocation","outputs":[{"name":"delegate","type":"address"},{"name":"longitude","type":"uint128"},{"name":"latitude","type":"uint128"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"longitude","type":"uint128"},{"name":"latitude","type":"uint128"},{"name":"name","type":"bytes32"}],"name":"saveLocation","outputs":[],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"getLastLocation","outputs":[{"components":[{"name":"delegate","type":"address"},{"name":"longitude","type":"uint128"},{"name":"latitude","type":"uint128"},{"name":"name","type":"bytes32"}],"name":"recentLocation","type":"tuple"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"locations","outputs":[{"name":"delegate","type":"address"},{"name":"longitude","type":"uint128"},{"name":"latitude","type":"uint128"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"item","outputs":[{"name":"id","type":"bytes32"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"id","type":"bytes32"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

  scanner: Instascan.Scanner;
  camera: Instascan.Camera;
  showScanner: boolean = false;

  showLocations: boolean = false;
  gettingLocations: boolean = false;

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
      const element = document.querySelector("#" + fragment);

      if (element) {
        element.scrollIntoView(element);
      }
    });

  }

  getLocationHistory() {
    this.MyContract.methods
      .getLocationHistory(0).send({
      'from': '0x902D578B7E7866FaE71b3AB0354C9606631bCe03',
      'gas': '44000'
    }).then((result) => {
      this.MyContract.methods.getLocationHistory(0).call()
        .then(hello => {console.log('hello', hello)});
    });
  }

  scanPhone(): void {
    // Open Scanner
    this.toggleScanner();
    // Init Scanner
    this.scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
    // Turn on Camera
    Instascan.Camera.getCameras().then(cameras => {
      if (cameras.length > 0) {
        this.camera = cameras[0];
        this.scanner.start(this.camera);
      } else {
        console.error('No cameras found.');
      }
      // Wait for successful scan
      this.scanner.addListener('scan', content => {
        if (content === this.trackableItem) {
          this.scanner.stop(this.camera);

          this.zone.run(() => {
            this.toggleScanner();
            this.getLocation();
          });
        }
      });

    }).catch(function (e) {
      console.error(e);
    });
  }


  simulate(): void {
    this.close();
    this.handleLocations();
  }

  close(): void {
    this.scanner.stop(this.camera);
    this.toggleScanner();
  }

  closeApple() {
    this.showApple = false;
  }

  handleQrCodeResult(event): void {
    console.log('event');
    console.log(event);
  }


  private handleLocations(): void {
    this.showLocations = true;
    this.gettingLocations = true;
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

  private getLocation(): void {
    let query = this.route.snapshot.queryParams;

    if (query.action && query.action === 'saveLocation') {
      this.saveLocation();
    }

  }

  private saveLocation(): void {
    navigator.geolocation.getCurrentPosition((position) => {

      this.MyContract.methods.saveLocation(
        position.coords.longitude, position.coords.latitude, window.web3.fromAscii("test")
      ).send({'from': '0x902D578B7E7866FaE71b3AB0354C9606631bCe03'}
      ).then((result) => {
        console.log('saveLocation')
        console.log(result)
      });

      this.getLocationHistory();

    });
  }

  private toggleScanner() {
    this.showScanner = !this.showScanner;
  }

  private loadApple() {
    this.showApple = true;
  }

}
