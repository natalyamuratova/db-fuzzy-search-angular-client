import { Component } from '@angular/core';
import {CommonDataService} from '../../services/common-data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  constructor(commonDataService: CommonDataService) {
  }
}
