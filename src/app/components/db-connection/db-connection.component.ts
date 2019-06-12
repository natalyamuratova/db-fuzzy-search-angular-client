import {Component} from '@angular/core';
import {DbConnectionModel} from '../../models/db-connection.model';
import {DatabaseService} from '../../services/database.service';
import {CommonDataService} from '../../services/common-data.service';

@Component({
  selector: 'app-db-connection',
  templateUrl: './db-connection.component.html',
  styleUrls: ['./db-connection.component.scss']
})
export class DbConnectionComponent {

  public connModel: DbConnectionModel;
  public formItems: any[];

  constructor(private databaseService: DatabaseService,
              private commonDataService: CommonDataService) {
    this.connModel = commonDataService.connection;
    if (!this.connModel) {
      this.connModel = new DbConnectionModel();
    }
    this.formItems = this.getFormItems();
  }

  public onConnectClicked(e) {
    this.databaseService.testConnection(this.connModel).subscribe(res => {
        this.commonDataService.connection = this.connModel;
      }
    );
  }

  private getFormItems(): any[] {
    const formItems = [];
    formItems.push(this.getHostFormItem());
    formItems.push(this.getPortFormItem());
    formItems.push(this.getUserFormItem());
    formItems.push(this.getPasswordFormItem());
    return formItems;
  }

  private getHostFormItem() {
    const item = {
      label: {text: 'Хост'},
      colSpan: 1,
      editorType: 'dxTextBox',
      dataField: 'host',
      editorOptions: {
        width: '100%'
      }
    };

    return item;
  }

  private getPortFormItem() {
    const item = {
      label: {text: 'Порт'},
      colSpan: 1,
      editorType: 'dxTextBox',
      dataField: 'port',
      editorOptions: {
        width: 200
      }
    };

    return item;
  }

  private getUserFormItem() {
    const item = {
      label: {text: 'Логин'},
      colSpan: 1,
      editorType: 'dxTextBox',
      dataField: 'user',
      editorOptions: {
        width: '100%'
      }
    };

    return item;
  }

  private getPasswordFormItem() {
    const item = {
      label: {text: 'Пароль'},
      colSpan: 1,
      editorType: 'dxTextBox',
      dataField: 'password',
      editorOptions: {
        width: '100%',
        mode: 'password'
      }
    };

    return item;
  }
}
