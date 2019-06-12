import { Injectable } from '@angular/core';
import {DbConnectionModel} from '../models/db-connection.model';
import {SearchModel} from '../models/search.model';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  public connection: DbConnectionModel;
  public searchModel: SearchModel;

  constructor() { }
}
