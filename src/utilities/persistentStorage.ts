import { General } from './general';
import { Maybe } from './maybe';

export namespace PersistentStorage {
    function isLocalStorageSupported() : boolean {
        return typeof(Storage) !== 'undefined' && General.isWellDefinedValue(window.localStorage);
    };

    export function persist(key: string, value: any) : boolean {
        if (isLocalStorageSupported()) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (exception) {
                return false;
            }
        }

        return false;
    };

    export function fetch(key: string) : Maybe<any> {
        if (isLocalStorageSupported()) {
            return Maybe.maybe(window.localStorage.getItem(key)).bind(s => JSON.parse(s));
        }

        return Maybe.nothing();
    };
};