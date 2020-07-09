import { Component, DoCheck } from '@angular/core';
import { FormGroup, FormControl, Validator, Validators } from '@angular/forms';

@Component({
    selector: 'fdp-platform-radio-group-content-example',
    templateUrl: './platform-radio-group-content-example.component.html'
})
export class PlatformRadioGroupContentExampleComponent implements DoCheck {
    favoriteSeason: string = '';
    favoriteSeason2: string = 'spring';
    favoriteMonth: string = '';
    seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];

    form1 = new FormGroup({});

    form2 = new FormGroup({});

    form3 = new FormGroup({});
    form3Data = { radio3: 'winter' };

    form4 = new FormGroup({});

    ngDoCheck() {
        if (this.form4.controls.radio4) {
            this.form4.controls.radio4.setErrors({ invalid: true });
            this.form4.controls.radio4.markAsTouched();
        }
    }
}
