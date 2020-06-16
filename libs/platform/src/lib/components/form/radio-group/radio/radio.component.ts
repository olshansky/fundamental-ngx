import { Component, ChangeDetectorRef, EventEmitter, Input, Output } from '@angular/core';
import { Optional, Self, ViewChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { RadioButtonComponent as CoreRadioButtonComponent, stateType } from '@fundamental-ngx/core';
import { NgControl, NgForm } from '@angular/forms';
import { BaseInput } from '../../base.input';
import { Status } from '../../form-control';

/** Change event object emitted by Radio. */
export class PlatformRadioChange {
    public radio: RadioButtonComponent;
    public event: KeyboardEvent | MouseEvent | TouchEvent;

    constructor(radio: RadioButtonComponent, event: KeyboardEvent | MouseEvent | TouchEvent) {
        this.radio = radio;
        this.event = event;
    }
}

@Component({
    selector: 'fdp-radio-button',
    templateUrl: './radio.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioButtonComponent extends BaseInput {
    /** value for Radio button */
    @Input()
    get value(): any {
        return super.getValue();
    }
    set value(newValue: any) {
        if (super.getValue() !== newValue) {
            super.setValue(newValue);
        }
    }

    /** set status value */
    set status(newStatus: Status) {
        this._status = newStatus;
        this.state = newStatus;
        if (newStatus !== 'error' && newStatus !== 'warning') {
            this.state = 'default';
        }
        this._cd.markForCheck();
    }

    /** @hidden
     * used for radio button creation if list value present
     */
    @Input()
    forceRender: boolean = false;

    /** click event to emit */
    @Output()
    readonly click: EventEmitter<PlatformRadioChange> = new EventEmitter();

    /** emit keyboard event*/
    @Output()
    readonly keydown: EventEmitter<PlatformRadioChange> = new EventEmitter();

    /** Access radio button child elemen passed as content of radio button group*/
    @ViewChild(CoreRadioButtonComponent, { static: false })
    private coreRadioButton: CoreRadioButtonComponent;

    /** reference of template */
    @ViewChild('renderer')
    renderer: TemplateRef<any>;

    state: Status | stateType = 'default';

    constructor(
        protected _cd: ChangeDetectorRef,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() @Self() public ngForm: NgForm
    ) {
        super(_cd, ngControl, ngForm);
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
        // @hidden have to set default initial values as base class has check and throws error
        this.id = this.defaultId;
        this.name = this.defaultId;
    }

    /** @hidden change formcontrol value, emits the event*/
    public onClick(event: KeyboardEvent | MouseEvent): void {
        if (!this.disabled) {
            if (super.getValue() !== undefined) {
                this.onChange(super.getValue());
                this.click.emit(new PlatformRadioChange(this, event));
            }
        }
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * handles accessibility from keyboard arrow keys
     */
    public onKeyDown(event: KeyboardEvent): void {
        this.keydown.emit(new PlatformRadioChange(this, event));
    }

    /**
     * checked status of radio button
     */
    public ischecked(): boolean {
        if (this.coreRadioButton && this.coreRadioButton.elementRef()) {
            return this.coreRadioButton.elementRef().nativeElement.checked;
        }
        return false;
    }

    /** @hidden method to select radio button */
    public select(): void {
        if (this.coreRadioButton && this.coreRadioButton.inputElement) {
            this.coreRadioButton.elementRef().nativeElement.checked = true;
            this.coreRadioButton.elementRef().nativeElement.ariaChecked = true;
            this.coreRadioButton.elementRef().nativeElement.tabindex = '-1';
            this._cd.detectChanges();
        }
    }

    /** @hidden method to uncheck radio button */
    public unselect(): void {
        if (this.coreRadioButton && this.coreRadioButton.inputElement) {
            this.coreRadioButton.elementRef().nativeElement.checked = false;
            this.coreRadioButton.elementRef().nativeElement.ariaChecked = false;
            this.coreRadioButton.elementRef().nativeElement.tabindex = '0';
            this._cd.detectChanges();
        }
    }

    /**
     * sets focus, used while selection of radio on keyboard event.
     */
    public focus(): void {
        this.coreRadioButton.elementRef().nativeElement.focus();
    }
}
