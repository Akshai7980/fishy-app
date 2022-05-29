import { AjxService } from './../ajx.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    public ajx: AjxService
  ) { }

  ngOnInit() {
  }

  login() {
    this.ajx.router.navigate(['/tabs/tab1']);
  }

}
