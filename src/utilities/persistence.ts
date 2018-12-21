import { Maybe } from './maybe';
import * as Shared from './shared';

type Storable = string | number | Shared.Difficulty | Shared.Theme | Shared.HighScore[];
type StorableEnumValue = Shared.Difficulty | Shared.Theme;

function isLocalStorageSupported(): boolean {
    return typeof(Storage) !== 'undefined' && Shared.isDefined(window.localStorage) && Shared.isNotNull(window.localStorage);
}

function persistData(key: string, value: Storable): boolean {
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

function fetchData<T>(key: string): Maybe<T> {
    return isLocalStorageSupported() ? new Maybe(window.localStorage.getItem(key)).bind(s => new Maybe(JSON.parse(s) as T)) : new Maybe();
}

function fetchString(key: string): Maybe<string> {
    const data: string = fetchData<string>(key).getOrDefault('');

    if (Shared.isString(data) && data.length > 0) {
        return new Maybe(data);
    }

    return new Maybe();
}

function fetchStorableEnumValue(key: string, collection: Shared.IEnum, defaultValue: StorableEnumValue): StorableEnumValue {
    return fetchData<StorableEnumValue>(key).caseOf(t => Shared.isInteger(t)
                                                        ? new Maybe(collection[t as number]).caseOf(() => t, () => defaultValue)
                                                        : defaultValue,
                                                    () => defaultValue);
}

export {
    persistData,
    fetchData,
    fetchString,
    fetchStorableEnumValue
};