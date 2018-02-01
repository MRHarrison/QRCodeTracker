import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import Web3 = require('web3');
import * as Web3 from 'web3/src';

declare var window: any;
declare var navigator: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  dappUrl: string = 'http://barcode.felix.exchange';
  web3: any;
  contractHash: string = '0x5fa486bc31e7a6493661e6eeafbcf201b25298db';
  MyContract: any;
  contract: any;
  ABI: any = [{ 'constant': false, 'inputs': [{ 'name': 'idx', 'type': 'uint256' }], 'name': 'getLocationHistory', 'outputs': [{ 'name': 'delegate', 'type': 'address' }, { 'name': 'longitude', 'type': 'uint128' }, { 'name': 'latitude', 'type': 'uint128' }, { 'name': 'name', 'type': 'bytes32' }], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'recentLocation', 'outputs': [{ 'name': 'delegate', 'type': 'address' }, { 'name': 'longitude', 'type': 'uint128' }, { 'name': 'latitude', 'type': 'uint128' }, { 'name': 'name', 'type': 'bytes32' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [{ 'name': 'longitude', 'type': 'uint128' }, { 'name': 'latitude', 'type': 'uint128' }, { 'name': 'name', 'type': 'bytes32' }], 'name': 'saveLocation', 'outputs': [], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': false, 'inputs': [], 'name': 'getLastLocation', 'outputs': [{ 'components': [{ 'name': 'delegate', 'type': 'address' }, { 'name': 'longitude', 'type': 'uint128' }, { 'name': 'latitude', 'type': 'uint128' }, { 'name': 'name', 'type': 'bytes32' }], 'name': 'recentLocation', 'type': 'tuple' }], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': true, 'inputs': [{ 'name': '', 'type': 'uint256' }], 'name': 'locations', 'outputs': [{ 'name': 'delegate', 'type': 'address' }, { 'name': 'longitude', 'type': 'uint128' }, { 'name': 'latitude', 'type': 'uint128' }, { 'name': 'name', 'type': 'bytes32' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'item', 'outputs': [{ 'name': 'id', 'type': 'bytes32' }, { 'name': 'name', 'type': 'bytes32' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [{ 'name': 'id', 'type': 'bytes32' }, { 'name': 'name', 'type': 'bytes32' }], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor' }];;

  constructor(private route: ActivatedRoute) { }
  @HostListener('window:load')
  windowLoaded() {
  console.log('Web3')
  console.log(Web3)
    this.checkAndInstantiateWeb3();
    this.getLocation();
  }

  getLocationHistory() {
    this.MyContract.methods
      .getLocationHistory(0).call().then((result) => {
      console.log('result');
      console.log(result);
    });
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

    if (query.action && query.action === 'setLocation') {
      this.setLocation();
    }

  }

  private setLocation(): void {
    navigator.geolocation.getCurrentPosition((position) => {

      this.MyContract.methods.saveLocation(
        position.coords.longitude, position.coords.latitude, 'test'
      );

      this.getLocationHistory();

    });
  }

}
