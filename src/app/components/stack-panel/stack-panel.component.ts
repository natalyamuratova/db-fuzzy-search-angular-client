import {Component, Input, TemplateRef} from '@angular/core';

@Component({
  selector: 'app-stack-panel',
  templateUrl: './stack-panel.component.html',
  styleUrls: ['./stack-panel.component.scss']
})
export class StackPanelComponent {

  private _selectedIndex = 0;

  @Input()
  contentList: TemplateRef<any>[];

  get selectedIndex(): number {
    return this._selectedIndex;
  }

  @Input()
  set selectedIndex(value: number) {
    this._selectedIndex = value;
  }

}
