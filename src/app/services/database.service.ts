import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DbConnectionModel} from '../models/db-connection.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private dbConnectionUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
  }

  public testConnection(data: DbConnectionModel) {
    const url = `${this.dbConnectionUrl}/connection`;
    return this.http.post(url, data, this.getDefaultHttpOptions());
  }

  public useDatabase(dbName: string) {
    if (!dbName) {
      return;
    }
    const url = `${this.dbConnectionUrl}/connection/${dbName}`;
    return this.http.post(url, null, this.getDefaultHttpOptions());
  }

  public getDbNames() {
    const url = `${this.dbConnectionUrl}/databases`;
    return this.http.get(url, this.getDefaultHttpOptions());
  }

  public getTableNames() {
    const url = `${this.dbConnectionUrl}/tables`;
    return this.http.get(url, this.getDefaultHttpOptions());
  }

  public getTableColumns(tableName: string) {
    if (!tableName) {
      return;
    }
    const url = `${this.dbConnectionUrl}/tables/${tableName}/columns`;
    return this.http.get(url, this.getDefaultHttpOptions());
  }

  public getTableData(tableName: string, full?: boolean, columns?: string[]) {
    if (!tableName) {
      return;
    }
    const url = `${this.dbConnectionUrl}/tables/${tableName}/data`;
    return this.http.get(url, this.getDefaultHttpOptions());
  }

  private getDefaultHttpOptions() {
    return {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
  }
}
