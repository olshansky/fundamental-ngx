import { Component, OnInit, Input } from '@angular/core';
import { ObjectStatus } from '@fundamental-ngx/core';

@Component({
  selector: 'fdp-object-status',
  templateUrl: './object-status.component.html'
})
export class ObjectStatusComponent {


    /**
     * The status represented by the Object Status.
     * Can be one of the following: 'negative' | 'critical' | 'positive' | 'informative'
     * For default Object Status omit this property
     */
    @Input()
    status: ObjectStatus;

    /**
     * Glyph (icon) of the Object Status.
     */
    @Input()
    glyph: string;

    /**
     * A number representing the indication color.
     * Option includes numbers from 1 to 8
     */
    @Input()
    indicationColor: number = null;

    /** Whether the Object Status is clickable. */
    @Input()
    clickable: boolean = false;

    /** Whether the Object Status is inverted. */
    @Input()
    inverted: boolean = false;

    /** Whether the Object Status is in Large Design. */
    @Input()
    large: boolean = false;

}
