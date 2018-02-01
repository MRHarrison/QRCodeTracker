import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { NgQRCodeReaderModule } from 'ng2-qrcode-reader';
import '@webcomponents/custom-elements';
import '@clr/icons';

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
    RouterModule.forRoot(
      routes,
      // { enableTracing: true },
    ),
    ClarityModule.forRoot(),
    NgxQRCodeModule,
    NgQRCodeReaderModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
