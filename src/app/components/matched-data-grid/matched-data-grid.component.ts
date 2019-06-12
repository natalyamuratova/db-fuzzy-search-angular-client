import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DatabaseService} from '../../services/database.service';

@Component({
  selector: 'app-matched-data-grid',
  templateUrl: './matched-data-grid.component.html',
  styleUrls: ['./matched-data-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchedDataGridComponent {

  private dictionary: any[];
  private analyzedTableData: any[];

  constructor(private databaseService: DatabaseService) {
  }

  public update(tableName: string, columns: string[]) {
    this.databaseService.getTableData(tableName, false, columns).subscribe((res: any[]) => {
      this.dictionary = res;
    }, err => {
      this.dictionary = null;
    });
    this.databaseService.getTableData(tableName, true, columns).subscribe((res: any[]) => {
      this.analyzedTableData = res;
    }, err => {
      this.analyzedTableData = null;
    });
  }

}
