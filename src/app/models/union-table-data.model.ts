export class UnionTableDataModel {
  public groups: UnionGroupModel[];
}

class UnionGroupModel {
  public primary: string;
  public combined: string[];
}
