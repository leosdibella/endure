import * as GeneralUtilities from './general';
import { Maybe } from './maybe';

function isLocalStorageSupported(): boolean {
    return typeof(Storage) !== 'undefined' && GeneralUtilities.isDefined(window.localStorage) && GeneralUtilities.isNotNull(window.localStorage);
}

function persistData(key: string, value: any): boolean {
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

function fetchData(key: string): Maybe<any> {
    return isLocalStorageSupported() ? new Maybe(window.localStorage.getItem(key)).bind(s => new Maybe(JSON.parse(s))) : new Maybe();
}

function fetchEnumValue<T>(key: string, collection: any, defaultValue: T): T {
    return fetchData(key).caseOf(t => GeneralUtilities.isString(t) || GeneralUtilities.isInteger(t) ? Maybe.mapThrough(collection[t], defaultValue) : defaultValue, () => defaultValue);
}

export {
    persistData,
    fetchData,
    fetchEnumValue
};