import {Component} from '@angular/core';
import {DatabaseService} from '../../services/database.service';

@Component({
  selector: 'app-all-data-grid',
  templateUrl: './all-data-grid.component.html',
  styleUrls: ['./all-data-grid.component.scss']
})
export class AllDataGridComponent {

  private _tableData: any[];

  get tableData(): any[] {
    return this._tableData;
  }

  set tableData(value: any[]) {
    this._tableData = value;
    this.buildTableColumns(value);
  }

  public columns: any[];

  constructor(private dataService: DatabaseService) {
    this.tableData = null;
    this.columns = [];
  }

  public update(tableName: string) {
    if (!tableName) {
      this.tableData = null;
      return;
    }
    this.dataService.getTableData(tableName).subscribe((res: any[]) => {
      this.tableData = res;
    }, err => {
      this.tableData = null;
    });
  }

  private buildTableColumns(data: any[]) {
    this.columns = [];
    if (!data || data.length === 0) {
      return;
    }
    Object.keys(data[0]).forEach((key) => {
      const column: any = {};
      column.dataField = key;
      column.allowSorting = true;
      column.allowResizing = true;
      this.columns.push(column);
    });
  }

}
