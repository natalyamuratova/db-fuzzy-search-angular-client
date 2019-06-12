import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DbConnectionModel} from '../models/db-connection.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private dbConnectionUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
  }

  public testConnection(data: DbConnectionModel) {
    const url = `${this.dbConnectionUrl}/connection`;
    return this.http.post(url, data, this.getDefaultHttpOptions());
  }

  public getDbNames() {
    const url = `${this.dbConnectionUrl}/databases`;
    return this.http.get(url, this.getDefaultHttpOptions());
  }

  public getTableNames(dbName: string) {
    const url = `${this.dbConnectionUrl}/databases/${dbName}/tables`;
    return this.http.get(url, this.getDefaultHttpOptions());
  }

  public getTableColumns(tableName: string) {
    const url = `${this.dbConnectionUrl}/tables/${tableName}/columns`;
    return this.http.get(url, this.getDefaultHttpOptions());
  }

  private getDefaultHttpOptions() {
    return {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };
  }
}
