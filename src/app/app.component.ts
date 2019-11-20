import { Observable } from 'rxjs';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';

import { Product } from './model';
import { EditService } from './edit.service';

import { map } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // 畫面顯示的資料
  public view: Observable<GridDataResult>;

  // grid的狀態(排序、分頁、筆數)
  public gridState: State = {
    sort: [],
    skip: 0,
    take: 10
  };
  public formGroup: FormGroup;

  private editService: EditService;

  // 當前，編輯列的index
  private editedRowIndex: number;

  constructor(@Inject(EditService) editServiceFactory: any) {
    // 將service注入
    this.editService = editServiceFactory();
  }

  public ngOnInit(): void {
    this.view = this.editService.pipe(map(data => process(data, this.gridState)));

    this.editService.read();
  }

  public onStateChange(state: State) {
    this.gridState = state;

    this.editService.read();
  }

  public addHandler({ sender }) {
    this.closeEditor(sender);

    this.formGroup = new FormGroup({
      'ProductID': new FormControl(),
      'ProductName': new FormControl('', Validators.required),
      'UnitPrice': new FormControl(0),
      'UnitsInStock': new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,3}')])),
      'Discontinued': new FormControl(false)
    });

    sender.addRow(this.formGroup);
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);

    this.formGroup = new FormGroup({
      'ProductID': new FormControl(dataItem.ProductID),
      'ProductName': new FormControl(dataItem.ProductName, Validators.required),
      'UnitPrice': new FormControl(dataItem.UnitPrice),
      'UnitsInStock': new FormControl(
        dataItem.UnitsInStock,
        Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,3}')])),
      'Discontinued': new FormControl(dataItem.Discontinued)
    });

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }) {
    const product: Product = formGroup.value;

    this.editService.save(product, isNew);

    sender.closeRow(rowIndex);
  }

  public removeHandler({ dataItem }) {
    this.editService.remove(dataItem);
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }
}
