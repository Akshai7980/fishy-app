import { AjxService } from './../ajx.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(
    private ajx: AjxService
  ) { }

  ngOnInit() {
  }

  GetStart() {
    console.log('Entered into Register page');
    this.ajx.router.navigate(['/register']);
  }
}
