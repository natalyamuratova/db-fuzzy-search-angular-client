import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'app-matched-data-grid',
  templateUrl: './matched-data-grid.component.html',
  styleUrls: ['./matched-data-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchedDataGridComponent {

  private tableData: any;

  constructor(private databaseService: DatabaseService) {
    this.tableData = [];
  }

  public update(tableName: string, columns: string[]) {
    this.tableData = [];
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
    const newDictionary = [];
    dictionary.forEach(item => {
      if (item instanceof Object) {
        const strings = [];
        Object.keys(item).forEach(key => {
          strings.push(item[key]);
        });
        newDictionary.push(strings);
      } else {
        newDictionary.push(item);
      }
    });
    this.databaseService.getClusterLabels(newDictionary).subscribe(labels => {
      console.log();
    });
  }

}
