import {Component, EventEmitter, Output} from '@angular/core';
import {SearchModel} from '../../models/search.model';
import {DatabaseService} from '../../services/database.service';
import {CommonDataService} from '../../services/common-data.service';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent {

  public searchModel: SearchModel;

  private dbNames: string[];
  private dbTableNames: string[];
  private tableColumns: string[];

  @Output() searchClick: EventEmitter<SearchModel> = new EventEmitter();
  @Output() tableSelected: EventEmitter<string> = new EventEmitter();

  constructor(private databaseService: DatabaseService,
              commonDataService: CommonDataService) {
    this.searchModel = commonDataService.searchModel;
    if (!this.searchModel) {
      this.searchModel = new SearchModel();
    }
    this.getDbNames();
    this.dbTableNames = [];
    this.tableColumns = [];
  }

  public onSearchBtnClicked(e) {
    this.searchClick.emit(this.searchModel);
  }

  public onDbSelectionChanged = (e) => {
    this.dbTableNames = [];
    this.tableColumns = [];
    const value = e.selectedItem;
    if (!value) {
      return;
    }
    this.databaseService.useDatabase(value).subscribe(res => {
      this.getTableNames();
    });
  }

  public onTableNameSelectionChanged = (e) => {
    this.tableColumns = [];
    const value = e.selectedItem;
    this.tableSelected.emit(value);
    if (!value) {
      return;
    }
    this.getTableColumns(value);
  }

  private getDbNames() {
    this.databaseService.getDbNames().subscribe((res: string[]) => {
      this.dbNames = res;
    }, err => {
      this.dbNames = [];
    });
  }

  private getTableNames() {
    this.databaseService.getTableNames().subscribe((res: string[]) => {
      this.dbTableNames = res;
    }, err => {
      this.dbTableNames = [];
    });
  }

  private getTableColumns(tableName: string) {
    this.databaseService.getTableColumns(tableName).subscribe((res: string[]) => {
      this.tableColumns = res;
    }, err => {
      this.tableColumns = [];
    });
  }

}
