import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { AppComponent } from './app.component';
import { AgmCoreModule } from '@agm/core';

const routes: Routes = [
{ path: '',  component: AppComponent },
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
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
