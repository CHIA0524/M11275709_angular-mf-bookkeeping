import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TransactionService, Transaction } from '../../core/services/transaction.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-quick-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './quick-add.component.html',
  styleUrls: ['./quick-add.component.scss']
})
export class QuickAddComponent implements OnInit {
  isEditMode = false;
  transactionId: string | null = null;
  settingsService = inject(SettingsService);

  incomeCategories = ['薪資', '獎金', '投資收益', '其他'];
  expenseCategories = ['飲食', '交通', '娛樂', '購物', '醫療', '教育', '其他'];

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const defaultCurrency = this.settingsService.settings().defaultCurrency;

    this.firstFormGroup = this._formBuilder.group({
      type: ['expense', Validators.required],
      category: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: [defaultCurrency, Validators.required], // 預設使用 Settings 中的設定
      date: [new Date(), Validators.required],
    });
    this.thirdFormGroup = this._formBuilder.group({
      notes: [''],
    });

    this.transactionId = this.route.snapshot.paramMap.get('id');
    if (this.transactionId) {
      this.isEditMode = true;
      this.transactionService.getTransactionById(this.transactionId).subscribe(transaction => {
        if (transaction) {
          this.firstFormGroup.patchValue({
            type: transaction.type,
            category: transaction.category,
          });
          this.secondFormGroup.patchValue({
            amount: transaction.amount,
            currency: transaction.currency || defaultCurrency,
            date: new Date(transaction.date),
          });
          this.thirdFormGroup.patchValue({
            notes: transaction.notes,
          });
        }
      });
    }
  }

  get currentCategories(): string[] {
    return this.firstFormGroup.value.type === 'income' ? this.incomeCategories : this.expenseCategories;
  }

  onSubmit(): void {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid) {
      return;
    }

    const transactionData = {
      type: this.firstFormGroup.value.type,
      category: this.firstFormGroup.value.category,
      amount: Number(this.secondFormGroup.value.amount),
      currency: this.secondFormGroup.value.currency,
      date: new Date(this.secondFormGroup.value.date!).toISOString().split('T')[0], // Format to YYYY-MM-DD
      notes: this.thirdFormGroup.value.notes,
    } as Omit<Transaction, 'id'>;

    if (this.isEditMode && this.transactionId) {
      this.transactionService.updateTransaction({ ...transactionData, id: this.transactionId });
    } else {
      this.transactionService.addTransaction(transactionData);
    }

    this.router.navigate(['/bookkeeping']);
  }
}

