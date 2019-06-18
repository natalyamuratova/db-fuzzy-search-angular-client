import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {SearchModel} from '../../models/search.model';
import {DatabaseService} from '../../services/database.service';
import {CommonDataService} from '../../services/common-data.service';
import {DxFormComponent} from 'devextreme-angular';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent {

  public searchModel: SearchModel;

  public dbNames: string[];
  public dbTableNames: string[];
  public tableColumns: string[];

  @Output() searchClick: EventEmitter<SearchModel> = new EventEmitter();
  @Output() tableSelected: EventEmitter<string> = new EventEmitter();

  @ViewChild(DxFormComponent) form: DxFormComponent;

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
    if (!this.searchModelFilled) {
      return;
    }
    this.searchClick.emit(this.searchModel);
  }

  public get searchModelFilled(): boolean {
    return (this.searchModel && this.searchModel.database && this.searchModel.tableName &&
      this.searchModel.columns && this.searchModel.columns.length > 0);
  }

  public onDbSelectionChanged = (e) => {
    this.dbTableNames = [];
    this.tableColumns = [];
    this.form.instance.getEditor('columns').reset();
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
    this.form.instance.getEditor('columns').reset();
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
