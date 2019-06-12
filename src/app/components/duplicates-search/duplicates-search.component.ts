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

  public tabs = [
    {id: 0, name: 'Все данные'},
    {id: 1, name: 'Группы'}
  ];

  @ViewChild(AllDataGridComponent) allDataGridComponent: AllDataGridComponent;
  @ViewChild(MatchedDataGridComponent) matchedDataGridComponent: MatchedDataGridComponent;

  public onTableSelected(tableName: string) {
    this.allDataGridComponent.update(tableName);
  }

  public onSearchClicked(searchModel: SearchModel) {
    if (!searchModel) {
      return;
    }
    this.matchedDataGridComponent.update(searchModel.tableName, searchModel.columns);
  }

}
