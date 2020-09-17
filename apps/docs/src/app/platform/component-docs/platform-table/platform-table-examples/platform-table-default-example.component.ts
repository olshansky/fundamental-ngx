import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'fdp-table-default-example',
    templateUrl: './platform-table-default-example.component.html'
})
export class PlatformTableDefaultExampleComponent implements OnInit {
    source: any[] = [];

    constructor() {}

    ngOnInit(): void {}

    onRowSelectionChange(event): void {
        window.alert(event);
    }
}