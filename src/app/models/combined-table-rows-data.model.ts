export class CombinedTableRowsDataModel {
  public groupedRows: CombinedRowsDataModel[];
}

export class CombinedRowsDataModel {
  public primary: any;  // any - объект, содержащий данные по первичному ключу
  public combined: any[];
}
