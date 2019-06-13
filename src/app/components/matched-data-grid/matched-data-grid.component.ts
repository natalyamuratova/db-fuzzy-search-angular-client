import {Component} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'app-matched-data-grid',
  templateUrl: './matched-data-grid.component.html',
  styleUrls: ['./matched-data-grid.component.scss']
})
export class MatchedDataGridComponent {

  public columns: any[];
  public tableData: any;

  private readonly GROUP_NAME_DATA_FIELD = 'groupIndex';
  private readonly IS_PRIMARY_DATA_FIELD = 'isPrimary';
  private readonly IS_UNION_ROW_DATA_FIELD = 'isUnionRow';

  constructor(private databaseService: DatabaseService) {
    this.tableData = null;
    this.columns = [];
  }

  public onUnionBtnClicked() {

  }

  public update(tableName: string, columns: string[]) {
    this.tableData = null;
    this.columns = [];
    if (!tableName || !columns || columns.length === 0) {
      return;
    }
    combineLatest(
      this.databaseService.getTableData(tableName, false, columns),
      this.databaseService.getTableData(tableName, true, columns)
    ).subscribe(([dictionary, analyzedTableData]) => {
      this.getClusters(dictionary, analyzedTableData, columns);
    });
  }

  private getClusters(dictionary: any, analyzedTableData: any, columns: string[]) {
    if (!dictionary || dictionary.length === 0 ||
      !analyzedTableData || analyzedTableData.length === 0 ||
      !columns || columns.length === 0) {
      return;
    }
    const newDictionary = this.getDictionaryOfStringArrays(dictionary);
    this.databaseService.getClusterLabels(newDictionary).subscribe(labels => {
      this.tableData = [];
      analyzedTableData.forEach((item, index) => {
        const groupedItem = {...item};
        groupedItem[this.GROUP_NAME_DATA_FIELD] = labels[index] + 1;
        groupedItem[this.IS_PRIMARY_DATA_FIELD] = false;
        groupedItem[this.IS_UNION_ROW_DATA_FIELD] = false;
          this.tableData.push(groupedItem);
      });
      this.buildTableColumns(analyzedTableData);
    });
  }

  private buildTableColumns(data: any[]) {
    if (!data || data.length === 0) {
      return;
    }
    this.columns = [];
    this.columns.push(this.getGroupedByClusterColumn());
    this.columns.push(this.getPrimaryRowColumn());
    this.columns.push(this.getUnionRowColumn());
    Object.keys(data[0]).forEach((key) => {
      const column: any = {};
      column.dataField = key;
      column.allowSorting = true;
      column.allowResizing = true;
      column.allowEditing = false;
      this.columns.push(column);
    });
  }

  private getPrimaryRowColumn() {
    const column: any = {};
    column.dataField = this.IS_PRIMARY_DATA_FIELD;
    column.caption = 'Основная';
    column.dataType = 'boolean';
    column.width = 90;
    return column;
  }

  private getUnionRowColumn() {
    const column: any = {};
    column.dataField = this.IS_UNION_ROW_DATA_FIELD;
    column.caption = 'Объединяемая';
    column.dataType = 'boolean';
    column.width = 120;
    return column;
  }

  private getGroupedByClusterColumn() {
    const column: any = {};
    column.dataField = this.GROUP_NAME_DATA_FIELD;
    column.caption = 'Группа';
    column.allowSorting = true;
    column.allowResizing = true;
    column.allowEditing = false;
    column.groupIndex = 0;
    return column;
  }

  private getDictionaryOfStringArrays(dictionary: any[]) {
    const array = [];
    dictionary.forEach(item => {
      if (item instanceof Object) {
        const strings = [];
        Object.keys(item).forEach(key => {
          strings.push(item[key]);
        });
        array.push(strings);
      } else {
        array.push(item);
      }
    });
    return array;
  }
}
