import { AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentChildren, EventEmitter, Input, Output, Optional } from '@angular/core';
import { QueryList, Self, ViewChildren, ViewEncapsulation } from '@angular/core';
import { NgControl, NgForm } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RadioButtonComponent, PlatformRadioChange } from './radio/radio.component';
import { CollectionBaseInput } from '../collection-base.input';
import { FormFieldControl } from '../form-control';

const keyCode = Object.freeze({
    RETURN: 13,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
});

@Component({
    selector: 'fdp-radio-group',
    templateUrl: './radio-group.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: FormFieldControl, useExisting: RadioGroupComponent, multi: true }]
})
export class RadioGroupComponent extends CollectionBaseInput implements AfterViewInit {
    /** value of selected radio button */
    @Input()
    get value(): any {
        return super.getValue();
    }
    set value(newValue: any) {
        super.setValue(newValue);
    }

    /**
     * To Dispaly Radio buttons in a line
     */
    @Input()
    isInline: boolean = false;

    /**
     * None value radio button created
     */
    @Input()
    hasNoValue: boolean = false;

    /**
     * Label for None value radio button
     */
    @Input()
    noValueLabel: string = 'None';

    /** Children radio buttons part of Group radio button, passed as content */
    @ContentChildren(RadioButtonComponent)
    contentRadioButtons: QueryList<RadioButtonComponent>;

    /** Children radio buttons part of Group radio button, created from list of values */
    @ViewChildren(RadioButtonComponent)
    private viewRadioButtons: QueryList<RadioButtonComponent>;

    /** selected radio button change event raised */
    @Output()
    change: EventEmitter<RadioButtonComponent> = new EventEmitter<RadioButtonComponent>();

    /** The currently selected radio button. Should match value. */
    private _selected: RadioButtonComponent | null = null;

    private destroy$ = new Subject<boolean>();

    constructor(
        protected _changeDetector: ChangeDetectorRef,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() @Self() public ngForm: NgForm
    ) {
        super(_changeDetector, ngControl, ngForm);
    }

    /**
     * controlvalue accessor
     */
    writeValue(value: any): void {
        if (value) {
            this._value = value;
            this.onChange(value);
        }
    }

    /**
     * @hidden selecting default button as provided as input
     */
    ngAfterContentChecked(): void {
        if (!this._validateRadioButtons()) {
            throw new Error('fdp-radio-button-group must contain a fdp-radio-button');
        }

        if (this.contentRadioButtons && this.contentRadioButtons.length > 0) {
            this.contentRadioButtons.forEach((button) => {
                this._selectUnselect(button);
                this._changeDetector.detectChanges();
            });
        }
    }

    /**
     * Initialize properties once fd-radio-buttons are available.
     * This allows us to propagate relevant attributes to associated buttons.
     */
    ngAfterViewInit(): void {
        setTimeout(() => {
            this._initContentRadioButtons();
            this._initViewRadioButtons();
        });
    }

    /**
     * called on button click for view radio button, created from list of values
     * @param radio
     */
    public selected(radioChange: PlatformRadioChange): void {
        this._selectedValueChanged(radioChange.radio);
    }

    /**
     * handling onkeydown event
     * @param PlatformRadioChange contains radio and event
     */
    public onKeydownEvent(radioChange: PlatformRadioChange): void {
        let flag = false;
        let targetRadioButton: RadioButtonComponent;
        const event: KeyboardEvent = <KeyboardEvent>radioChange.event;
        if (!event) {
            return;
        }
        switch (event.keyCode) {
            case keyCode.SPACE:
            case keyCode.RETURN:
                this._selectedValueChanged(radioChange.radio);
                flag = true;
                break;

            case keyCode.UP:
                targetRadioButton = this._getRequiredRadioButton(-1);
                this._selectedValueChanged(targetRadioButton);
                flag = true;
                break;

            case keyCode.DOWN:
                targetRadioButton = this._getRequiredRadioButton(1);
                this._selectedValueChanged(targetRadioButton);
                flag = true;
                break;

            case keyCode.LEFT:
                targetRadioButton = this._getRequiredRadioButton(-1);
                this._selectedValueChanged(targetRadioButton);
                flag = true;
                break;

            case keyCode.RIGHT:
                targetRadioButton = this._getRequiredRadioButton(1);
                this._selectedValueChanged(targetRadioButton);
                flag = true;
                break;

            default:
                break;
        }

        if (flag) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    /**
     * unsubscribe events.
     * @hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * Make sure we have expected childs.
     */
    private _validateRadioButtons(): boolean {
        return (
            this.contentRadioButtons.filter((item) => !(item instanceof RadioButtonComponent || item['renderer']))
                .length === 0
        );
    }

    /**
     * selects radio button with provided value
     */
    private _initViewRadioButtons(): void {
        if (this.viewRadioButtons && this.viewRadioButtons.length > 0) {
            this.viewRadioButtons.forEach((button) => {
                button.status = this.status;
                this._selectUnselect(button);
                this.onChange(this._value);
            });
        }
    }

    /**
     * Initializing all content radio buttons with given properties and
     * subscribing to radio button radiobuttonclicked event
     */
    private _initContentRadioButtons(): void {
        if (this.contentRadioButtons && this.contentRadioButtons.length > 0) {
            this.contentRadioButtons.forEach((button) => {
                this._setProperties(button);
                this._selectUnselect(button);
                this.onChange(this._value);
                button.keydown.pipe(takeUntil(this.destroy$)).subscribe((value) => this.onKeydownEvent(value));
                button.click.pipe(takeUntil(this.destroy$)).subscribe((ev) => this.selected(ev));
            });
        }
    }

    /**
     * selects given radio button, if value matches
     * @param Radio button
     */
    private _selectUnselect(button: RadioButtonComponent): void {
        if (!this._value) {
            button.unselect();
        } else {
            if (button.value === this._value) {
                // selected button
                if (this._selected !== button) {
                    this._selected = button;
                }
                if (!button.ischecked()) {
                    button.select();
                }
            }
        }
    }

    /**
     * set inital values, used while content children creation
     * @param button
     */
    private _setProperties(button: RadioButtonComponent): void {
        if (button) {
            button.name = this.name;
            button.contentDensity = this.contentDensity;
            button.status = this.status;
            button.disabled = button.disabled ? button.disabled : this._disabled;
        }
    }

    /** Called everytime a radio button is clicked, In content child as well as viewchild */
    private _selectedValueChanged(button: RadioButtonComponent): void {
        if (button) {
            if (this._selected !== button) {
                if (this._selected) {
                    this._selected.unselect();
                }
                this._selected = button;
                this._selected.select();
            }
            this._value = button.value;
            // used while selection of radio on keyboard event
            button.focus();
            this.change.emit(button);
            this.onChange(this._value);
        }
    }

    /**
     * Returns next radio button to be selected on keyboard event.
     * @param nextPosition, position of next radio button from current position.
     * + 1 for -> key right and key down. - 1 for -> key left and key up.
     */
    private _getRequiredRadioButton(nextPosition: number): RadioButtonComponent {
        let calculatedPosition: number;
        const radioButtons: RadioButtonComponent[] = this._displayedRadios();
        calculatedPosition = this._calculateNextPosition(nextPosition);
        return radioButtons[calculatedPosition];
    }

    /**
     * returns available radio buttons in group.
     */
    private _displayedRadios(): RadioButtonComponent[] {
        let radioButtons: RadioButtonComponent[];
        if (this.contentRadioButtons && this.contentRadioButtons.length > 0) {
            radioButtons = this.contentRadioButtons.toArray();
        } else {
            radioButtons = this.viewRadioButtons.toArray();
        }
        return radioButtons;
    }

    /**
     * returns next available radio buttons.
     * Need to skip disabled radio buttons.
     * @param delta -1 | 1
     */
    private _calculateNextPosition(delta: number): number {
        const radioButtons = this._displayedRadios();
        const activeItemIndex = radioButtons.indexOf(this._selected);
        let index: number = -1;
        for (let i = 1; i <= radioButtons.length; i++) {
            index = (activeItemIndex + delta * i + radioButtons.length) % radioButtons.length;
            // skip disabled radios in position calculation.
            if (!radioButtons[index].disabled) {
                break;
            }
        }
        return index;
    }
}
