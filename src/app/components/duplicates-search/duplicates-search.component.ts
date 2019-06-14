import {Component, ViewChild} from '@angular/core';
import {SearchModel} from '../../models/search.model';
import {AllDataGridComponent} from '../all-data-grid/all-data-grid.component';
import {MatchedDataGridComponent} from '../matched-data-grid/matched-data-grid.component';

@Component({
  selector: 'app-duplicates-search',
  templateUrl: './duplicates-search.component.html',
  styleUrls: ['./duplicates-search.component.scss']
})
export class DuplicatesSearchComponent {

  public selectedIndex = 0;
  public tabs = [
    {id: 0, text: 'Все данные'},
    {id: 1, text: 'Группы'}
  ];

  @ViewChild(AllDataGridComponent) allDataGridComponent: AllDataGridComponent;
  @ViewChild(MatchedDataGridComponent) matchedDataGridComponent: MatchedDataGridComponent;

  public onTableSelected(tableName: string) {
    this.allDataGridComponent.update(tableName);
    this.matchedDataGridComponent.update(tableName, []);
  }

  public onSearchClicked(searchModel: SearchModel) {
    if (!searchModel) {
      return;
    }
    this.selectedIndex = 1;
    this.matchedDataGridComponent.update(searchModel.tableName, searchModel.columns);
  }

  public onRowsCombined(tableName: string) {
    this.allDataGridComponent.update(tableName);
  }

}
