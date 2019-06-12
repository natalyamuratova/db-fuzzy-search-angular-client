import {Component} from '@angular/core';
import {SearchModel} from '../../models/search.model';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss'],
  providers: [DataService]
})
export class SearchPanelComponent {

  public searchModel: SearchModel;

  private dbNames: string[];
  private dbTableNames: string[];
  private tableColumns: string[];

  constructor(private dataService: DataService) {
    this.getDbNames();
    this.dbTableNames = [];
    this.tableColumns = [];
    this.searchModel = new SearchModel();
  }

  public onSearchBtnClicked(e) {

  }


  public onDbSelectionChanged = (e) => {
    const value = e.selectedItem;
    if (value) {
      this.getTableNames(value);
    } else {
      this.dbTableNames = [];
    }
  }

  public onTableNameSelectionChanged = (e) => {
    const value = e.selectedItem;
    if (value) {
      this.getTableColumns(value);
    } else {
      this.tableColumns = [];
    }
  }

  private getDbNames() {
    this.dataService.getDbNames().subscribe((res: string[]) => {
      this.dbNames = res;
    }, err => {
      this.dbNames = [];
    });
  }

  private getTableNames(dbName: string) {
    this.dataService.getTableNames(dbName).subscribe((res: string[]) => {
      this.dbTableNames = res;
    }, err => {
      this.dbTableNames = [];
    });
  }

  private getTableColumns(tableName: string) {
    this.dataService.getTableColumns(tableName).subscribe((res: string[]) => {
      this.tableColumns = res;
    }, err => {
      this.tableColumns = [];
    });
  }

}
