import {Component} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-duplicates-search',
  templateUrl: './duplicates-search.component.html',
  styleUrls: ['./duplicates-search.component.scss'],
  providers: [DataService]
})
export class DuplicatesSearchComponent {

  public tabs = [
    {id: 0, name: 'Все данные'},
    {id: 1, name: 'Группы'}
  ];


  constructor(private dataService: DataService) {

  }


}
