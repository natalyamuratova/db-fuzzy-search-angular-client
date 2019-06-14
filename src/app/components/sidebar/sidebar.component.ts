import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonDataService} from '../../services/common-data.service';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  private routerSubs: Subscription;

  public menuItems = [
    {
      text: 'Настройка подключения',
      link: 'connection',
      selected: false
    },
    {
      text: 'Поиск дубликатов',
      link: 'search',
      selected: false
    }
  ];

  constructor(commonDataService: CommonDataService,
              private router: Router) {
  }

  ngOnInit() {
    this.routerSubs = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(
      (event: NavigationEnd) => {
        const route = event.urlAfterRedirects;
        this.menuItems.forEach(menuItem => {
          menuItem.selected = '/' + menuItem.link === route;
        });
      }
    );
  }

  ngOnDestroy() {
    if (this.routerSubs) {
      this.routerSubs.unsubscribe();
    }
  }

}
