import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges, OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { TimeObject } from './time-object';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TimeI18nLabels } from './i18n/time-i18n-labels';
import { TimeI18n } from './i18n/time-i18n';

export type FdTimeActiveView = 'hour' | 'minute' | 'second' | 'meridian';

@Component({
    selector: 'fd-time',
    templateUrl: './time.component.html',
    styleUrls: ['./time.component.scss'],
    host: {
        '(blur)': 'onTouched()',
        class: ''
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimeComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TimeComponent implements OnInit, OnChanges, ControlValueAccessor {

    public hours: number[];
    public minutes: number[];
    public seconds: number[];
    public periods: string[];

    /**
     * @Input When set to false, uses the 24 hour clock (hours ranging from 0 to 23)
     * and does not display a period control.
     */
    @Input() meridian: boolean = false;

    /**
     *  @Input When set to false, does not set the input field to invalid state on invalid entry.
     */
    @Input() validate: boolean = true;

    /**
     * @Input when set to true, time inputs won't allow to have 1 digit
     * for example 9 will become 09
     * but 12 will be kept as 12.
     */
    @Input() keepTwoDigits: boolean = false;

    /**
     * @Input Disables the component.
     */
    @Input() disabled: boolean;

    /**
     * @Input When set to false, hides the buttons that increment and decrement the corresponding input.
     */
    @Input() spinners: boolean = true;

    /**
     * @Input When set to false, hides the input for seconds.
     */
    @Input() displaySeconds: boolean = true;

    /** @Input When set to false, hides the input for minutes. */
    @Input()
    displayMinutes: boolean = true;

    /**
     * When set to false, hides the input for hours
     */
    @Input()
    displayHours: boolean = true;

    @Input()
    compact: boolean = false;

    /**
     * @Input An object that contains three integer properties: 'hour' (ranging from 0 to 23),
     * 'minute' (ranging from 0 to 59), and 'second' (ranging from 0 to 59). This is the model the component consumes. Example:
     *
     * ```json
     * { hour: 12, minute: 0, second: 0 }
     * ```
     */
    @Input()
    time: TimeObject = { hour: 0, minute: 0, second: 0 };

    /** @hidden */
    @Output()
    readonly focusArrowLeft: EventEmitter<void> = new EventEmitter<void>();

    /** @hidden
     * Used only in meridian mode. Stores information the current am/pm state.
     */
    period: string;

    activeView: FdTimeActiveView = 'hour';

    /** @hidden
     * Variable that is displayed as an hour.
     * For meridian mode ranging from 0 to 12,
     * For non-meridian mode ranging from 0 to 23, and reflects the hour value
     */
    displayedHour: number = 0;

    /** @hidden */
    onChange = (time: TimeObject) => {};

    /** @hidden */
    onTouched = () => {};

    /** @hidden */
    registerOnChange(fn: (time: TimeObject) => void): void {
        this.onChange = fn;
    }

    /** @hidden */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /** @hidden */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.changeDetRef.detectChanges();
    }

    constructor(
        public timeI18nLabels: TimeI18nLabels,
        public timeI18n: TimeI18n,
        private changeDetRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.hours = [];

        this.period = this.timeI18n.meridianAm;

        const hoursAmount = this.meridian ? 12 : 24;
        for (let i = 0; i < hoursAmount; i ++) {
            this.hours.push(i);

        }

        const minutesAmount = 60;
        this.minutes = [];
        for (let i = 0; i < minutesAmount; i ++) {
            this.minutes.push(i);

        }

        this.periods = [this.timeI18n.meridianAm, this.timeI18n.meridianPm];
    }

    handleMinuteChange(minute: number): void {
        this.time.minute = minute;
        this.onChange(this.time);
    }

    handleHourChange(hour: number): void {
        this.time.hour = hour;
        this.onChange(this.time);
    }

    handleNextColumnFocus(column: FdTimeActiveView): void {
        if (column === 'hour' && this.displayMinutes) {
            this.changeActive('minute');
        } else if (column === 'hour' && this.meridian) {
            this.changeActive('meridian');
        } else if (column === 'minute' && this.displaySeconds) {
            this.changeActive('second');
        } else if (column === 'minute' && this.meridian) {
            this.changeActive('meridian');
        } else if (column === 'second' && this.meridian) {
            this.changeActive('meridian');
        } else if (column === 'second') {
            this.changeActive('hour');
        } else if (column === 'meridian') {
            this.changeActive('hour');
        }
    }

    handlePreviousColumnFocus(column: FdTimeActiveView): void {
        if (column === 'hour' && this.meridian) {
            this.changeActive('meridian');
        } else if (column === 'hour' && this.displaySeconds) {
            this.changeActive('second');
        } else if (column === 'minute') {
            this.changeActive('hour');
        } else if (column === 'second') {
            this.changeActive('minute');
        } else if (column === 'meridian') {
            if (this.displaySeconds) {
                this.changeActive('second')
            } else if (this.displayMinutes) {
                this.changeActive('minute')
            } else {
                this.changeActive('hour')
            }
        }
    }

    handleSecondChange(second: number): void {
        this.time.second = second;
        this.onChange(this.time);
    }

    /** @hidden */
    writeValue(time: TimeObject): void {
        if (!time) {
            return;
        }
        this.time = Object.assign({}, time);
        this.setDisplayedHour();
        this.changeDetRef.detectChanges();
    }

    /** @hidden
     * Reacts only when there is meridian or time input change
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.meridian || changes.time) {
            this.setDisplayedHour();
        }
    }

    /** @hidden
     * Changes displayed hour value, used mostly when the model hour is changed
     */
    setDisplayedHour(): void {
        if (!this.meridian) {
            this.displayedHour = this.time.hour;
        } else if (this.time.hour === 0) {
            this.displayedHour = 12;
            this.period = this.timeI18n.meridianAm;
        } else if (this.time.hour > 12) {
            this.displayedHour = this.time.hour - 12;
            this.period = this.timeI18n.meridianPm;
        } else if (this.time.hour === 12) {
            this.displayedHour = 12;
            this.period = this.timeI18n.meridianPm;
        } else {
            this.displayedHour = this.time.hour;
            this.period = this.timeI18n.meridianAm;
        }

        if (this.time) {
            this.time = {...this.time};
        }
    }

    /** @hidden
     * Handles changes of displayed hour value from template.
     */
    displayedHourChanged(changedHour: number): void {
        this.displayedHour = changedHour;
        if (!this.meridian) {
            this.time.hour = this.displayedHour;
        } else {
            if (this.period === this.timeI18n.meridianAm) {
                if (this.displayedHour === 12) {
                    this.time.hour = 0;
                } else {
                    this.time.hour = this.displayedHour;
                }
            } else if (this.period === this.timeI18n.meridianPm) {
                if (this.displayedHour === 12) {
                    this.time.hour = this.displayedHour;
                } else {
                    this.time.hour = this.displayedHour + 12;
                }
            }
        }
        this.onChange(this.time);
    }

    changeActive(view: FdTimeActiveView): void {
        this.activeView = view;
        this.changeDetRef.detectChanges()
    }

    isActive(view: FdTimeActiveView): boolean {
        return this.activeView === view;
    }

    /** @hidden
     * Handles period model change. depending on current hour and new period changes hours by +/- 12
     */
    periodModelChange(): void {
        if (this.time && !this.time.hour) {
            this.time.hour = 0;
        }
        if (this.time.hour < 24 && this.time.hour >= 0) {
            if (this.isPm(this.period) && this.time.hour < 12) {
                this.time.hour = this.time.hour + 12;
            } else if (this.time.hour >= 12 && this.isAm(this.period)) {
                this.time.hour = this.time.hour - 12;
            }
            this.onChange(this.time);
        }
    }

    /** @hidden
     * Handles last button keyboard events
     */
    lastButtonKeydown(event: KeyboardEvent): void {
        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            this.focusArrowLeft.emit();
        }
    }

    /**
     * @hidden
     * Defines if period is PM, Considers the fact that period should be case sensitive
     */
    private isPm(period: string): boolean {
        const pmMeridian = this.timeI18n.meridianCaseSensitive
            ? this.timeI18n.meridianPm
            : this.timeI18n.meridianPm.toLocaleUpperCase();
        period = this.timeI18n.meridianCaseSensitive ? period : period.toLocaleUpperCase();
        return period === pmMeridian;
    }

    /**
     * @hidden
     * Defines if period is AM, Considers the fact that period should be case sensitive
     */
    private isAm(period: string): boolean {
        const amMeridian = this.timeI18n.meridianCaseSensitive
            ? this.timeI18n.meridianAm
            : this.timeI18n.meridianAm.toLocaleUpperCase();
        period = this.timeI18n.meridianCaseSensitive ? period : period.toLocaleUpperCase();
        return period === amMeridian;
    }
}
