/**
 * Default implementation for Arrays.
 */
import { ComboBoxDataSource, ListDataSource, TableDataSource } from './data-source';
import { BaseDataProvider } from './base-data-provider';

export class ArrayComboBoxDataSource<T> extends ComboBoxDataSource<T> {
    constructor(private data: T[]) {
        super(new BaseDataProvider(data));
    }
}

export class ArrayTableDataSource<T> extends TableDataSource<T> {
    constructor(private data: T[]) {
        super(new BaseDataProvider(data));
    }
}

export class ArrayListDataSource<T> extends ListDataSource<T> {
    constructor(private data: T[]) {
        super(new BaseDataProvider(data));
    }
}
