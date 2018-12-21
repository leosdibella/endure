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
                                                        ? new Maybe(collection[t as number]).mapTo(t, defaultValue)
                                                        : defaultValue,
                                                    () => defaultValue);
}

function mapHHighScores(highScores: Shared.HighScore[]): Shared.HighScore[] {
    const highScoreArray: Shared.HighScore[] = [];

    if (Array.isArray(highScores)) {
        highScores.forEach(hs => {
            if (Shared.isObject(hs)
                    && Shared.isString(hs.name)
                    && Shared.isString(hs.dateStamp)
                    && Shared.isInteger(hs.value)
                    && Shared.isInteger(hs.difficulty)) {
                new Maybe(Shared.Difficulty[hs.difficulty]).justDo(() => {
                    highScoreArray.push(new Shared.HighScore(hs.name, hs.value, hs.dateStamp, hs.difficulty));
                });
            }
        });
    }

    return highScoreArray;
}

function fetchHighScores(key: string): Shared.HighScore[] {
    return fetchData<Storable>(key).caseOf(t => mapHHighScores(t as Shared.HighScore[]), () => []);
}

export {
    persistData,
    fetchString,
    fetchStorableEnumValue,
    fetchHighScores
};