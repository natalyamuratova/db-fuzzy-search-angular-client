import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {
  DxButtonModule,
  DxDataGridModule,
  DxFormModule,
  DxTabPanelModule
} from 'devextreme-angular';
import {DbConnectionComponent} from './components/db-connection/db-connection.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {DuplicatesSearchComponent} from './components/duplicates-search/duplicates-search.component';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {StackPanelComponent} from './components/stack-panel/stack-panel.component';
import {AllDataGridComponent} from './components/all-data-grid/all-data-grid.component';
import {MatchedDataGridComponent} from './components/matched-data-grid/matched-data-grid.component';
import {SearchPanelComponent} from './components/search-panel/search-panel.component';
import {CommonDataService} from './services/common-data.service';
import {DatabaseService} from './services/database.service';

const appRoutes: Routes = [
  {path: '', redirectTo: 'connection', pathMatch: 'full'},
  {path: 'connection', component: DbConnectionComponent},
  {path: 'search', component: DuplicatesSearchComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    DbConnectionComponent,
    SidebarComponent,
    DuplicatesSearchComponent,
    StackPanelComponent,
    AllDataGridComponent,
    MatchedDataGridComponent,
    SearchPanelComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    DxDataGridModule,
    DxButtonModule,
    DxFormModule,
    DxTabPanelModule
  ],
  providers: [
    DatabaseService,
    CommonDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
