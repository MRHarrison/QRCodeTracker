import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClarityModule } from '@clr/angular';
import { QRCodeModule } from 'angularx-qrcode';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';

const routes: Routes = [
{ path: '',  component: AppComponent },
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(
      routes,
      // { enableTracing: true },
    ),
    ClarityModule.forRoot(),
    QRCodeModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDqkbAu6_egvxShUXBAKYyMFtfSiawgZ8g'
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
