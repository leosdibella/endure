import { General } from './general';
import { Maybe } from './maybe';

export namespace PersistentStorage {
    function isLocalStorageSupported(): boolean {
        return typeof(Storage) !== 'undefined' && General.isDefined(window.localStorage);
    }

    export function persistData(key: string, value: any): boolean {
        if (isLocalStorageSupported()) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (exception) {
                return false;
            }
        }

        return false;
    }

    export function fetchData(key: string): Maybe<any> {
        return isLocalStorageSupported() ? new Maybe(window.localStorage.getItem(key)).bind(s => JSON.parse(s)) : new Maybe();
    }

    export function fetchEnumValue<T>(key: string, collection: any, defaultValue: T): T {
        return fetchData(key).caseOf(t => General.isString(t) || General.isInteger(t) ? Maybe.mapThrough(collection[t], defaultValue) : defaultValue, () => defaultValue);
    }
}