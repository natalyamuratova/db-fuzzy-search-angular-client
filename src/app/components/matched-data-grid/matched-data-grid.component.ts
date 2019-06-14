import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {combineLatest} from 'rxjs';
import {CombinedRowsDataModel, CombinedTableRowsDataModel} from '../../models/combined-table-rows-data.model';
import {DxDataGridComponent} from 'devextreme-angular';

@Component({
  selector: 'app-matched-data-grid',
  templateUrl: './matched-data-grid.component.html',
  styleUrls: ['./matched-data-grid.component.scss']
})
export class MatchedDataGridComponent {

  public columns: any[];
  public tableData: any;

  private currentTableName: string;
  private primaryKeyName: string[];
  private analyzedColumns: string[];

  private readonly GROUP_NAME_DATA_FIELD = 'groupIndex';
  private readonly IS_PRIMARY_DATA_FIELD = 'isPrimary';
  private readonly IS_UNION_ROW_DATA_FIELD = 'isUnionRow';
  private readonly MIN_CLUSTER_ROWS = 2;

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Output() rowsCombined: EventEmitter<string> = new EventEmitter();

  constructor(private databaseService: DatabaseService) {
    this.tableData = null;
    this.columns = [];
    this.currentTableName = null;
    this.primaryKeyName = [];
    this.analyzedColumns = [];
  }

  public onUnionBtnClicked() {
    if (!this.tableData || this.tableData.length === 0) {
      return;
    }
    const combinedData = this.getCombinedRows();
    this.databaseService.unionRows(this.currentTableName, combinedData).subscribe(res => {
      this.rowsCombined.emit(this.currentTableName);
      this.update(this.currentTableName, this.analyzedColumns);
    });
  }

  // обновление содержимного таблицы в соответствии с выбранными для анализа колонками
  public update(tableName: string, columns: string[]) {
    this.currentTableName = tableName;
    this.analyzedColumns = columns;
    this.tableData = null;
    this.columns = [];
    this.primaryKeyName = [];

    if (!tableName || !columns || columns.length === 0) {
      return;
    }
    combineLatest(
      this.databaseService.getTableData(tableName, false, columns),
      this.databaseService.getTableData(tableName, true, columns)
    ).subscribe(([dictionary, analyzedTableData]) => {
      this.getClusters(dictionary, analyzedTableData);
    });
    this.databaseService.getPrimaryKeyName(tableName).subscribe((res: string[]) => {
      this.primaryKeyName = res;
    });
  }

  // получение кластеров по анализируемому словарю
  private getClusters(dictionary: any, analyzedTableData: any) {
    if (!dictionary || dictionary.length === 0 || !analyzedTableData || analyzedTableData.length === 0) {
      return;
    }
    const newDictionary = this.getDictionaryOfStringArrays(dictionary);
    this.databaseService.getClusterLabels(newDictionary).subscribe((labels: number[]) => {
      this.tableData = [];
      if (!labels || labels.length === 0) {
        return;
      }
      // построение словаря (ключ - индекс кластера, значения - массив номеров анализируемых строк)
      const clusters = new Map<number, number[]>();
      labels.forEach((label, index) => {
        if (!clusters.has(label)) {
          clusters.set(label, [index]);
        } else {
          clusters.get(label).push(index);
        }
      });

      // преобразование данных по построенному словарю
      let grIndex = 1;
      clusters.forEach(((value, key) => {
        if (value.length < this.MIN_CLUSTER_ROWS) {
          return;
        }
        value.forEach(rowIndex => {
          const row = analyzedTableData[rowIndex];
          const groupedItem = {...row};
          groupedItem[this.GROUP_NAME_DATA_FIELD] = grIndex;
          groupedItem[this.IS_PRIMARY_DATA_FIELD] = false;
          groupedItem[this.IS_UNION_ROW_DATA_FIELD] = false;
          this.tableData.push(groupedItem);
        });
        grIndex++;
      }));

      this.buildTableColumns(analyzedTableData);
    });
  }

  // динамическое построение колонок таблицы
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

  // преобразование массива объектов в массив массивов
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

  // процедура получения основной и объединяемых строк по каждой группе
  private getCombinedRows(): CombinedTableRowsDataModel {
    const combinedTableRowsModel = new CombinedTableRowsDataModel();
    combinedTableRowsModel.groupedRows = [];

    const groupedItems = this.dataGrid.instance.getDataSource().items();
    if (groupedItems && groupedItems.length > 0) {
      groupedItems.forEach(group => {
        const items = group.items;
        if (!items || items.length === 0) {
          return;
        }
        const combinedRows = new CombinedRowsDataModel();
        combinedRows.combined = [];
        items.forEach(item => {
          if (item[this.IS_PRIMARY_DATA_FIELD]) {
            combinedRows.primary = this.getObjectByPrimaryKey(item);
          }
          if (item[this.IS_UNION_ROW_DATA_FIELD]) {
            combinedRows.combined.push(this.getObjectByPrimaryKey(item));
          }
        });
        if (combinedRows.primary && combinedRows.combined && combinedRows.combined.length > 0) {
          combinedTableRowsModel.groupedRows.push(combinedRows);
        }
      });
    }

    return combinedTableRowsModel;
  }

  // процедура получения объекта с полями первичного ключа
  private getObjectByPrimaryKey(item: any): any {
    if (!item || !this.primaryKeyName || this.primaryKeyName.length === 0) {
      return;
    }
    const result = {};
    this.primaryKeyName.forEach((key: string) => {
      result[key] = item[key];
    });
    return result;
  }
}
