import { IEnum } from '../interfaces/iEnum';
import { IHighScore } from '../interfaces/iHighScore';
import { Difficulty, Theme } from './enum';
import * as Shared from './shared';

type Storable = string | number | Difficulty | Theme | IHighScore[][];
type StorableEnumValue = Difficulty | Theme;

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

function fetchData<T>(key: string): T | undefined {
    if (isLocalStorageSupported()) {
        const data: string | null = window.localStorage.getItem(key);

        if (Shared.isNotNull(data)) {
            return JSON.parse(data as string) as T;
        }

        return undefined;
    }
}

function fetchString(key: string): string | undefined {
    const data: string | undefined = fetchData<string>(key);

    if (Shared.isString(data)) {
        return (data as string).length > 0 ? data as string : undefined;
    }

    return undefined;
}

function fetchStorableEnumValue(key: string, collection: IEnum, defaultValue: StorableEnumValue): StorableEnumValue {
    const data: StorableEnumValue | undefined = fetchData<StorableEnumValue>(key);

    if (Shared.isInteger(data) && Shared.isDefined(collection[data as number])) {
        return data as StorableEnumValue;
    }

    return defaultValue;
}

function mapHHighScores(highScores: IHighScore[][]): IHighScore[][] {
    const highScoreArray: IHighScore[][] = Shared.fillArray(Shared.getNumericEnumKeys(Difficulty).length, () => []);

    if (Array.isArray(highScores)) {
        highScores.forEach((hsd, difficulty) => {
            if (Array.isArray(hsd) && Shared.isDefined(Difficulty[difficulty])) {
                hsd.forEach(hs => {
                    if (Shared.isObject(hs)
                            && Shared.isString(hs.name)
                            && hs.name.length > 0
                            && Shared.isString(hs.dateStamp)
                            && hs.dateStamp.length === Shared.dateStampLength
                            && Shared.isInteger(hs.value)
                            && hs.value > 0
                            && Shared.isInteger(hs.difficulty)
                            && Shared.isDefined(Difficulty[hs.difficulty])) {
                        highScoreArray[difficulty].push(hs);
                    }
                });
            }
        });
    }

    return highScoreArray;
}

function fetchHighScores(key: string): IHighScore[][] {
    return mapHHighScores(fetchData<Storable>(key) as IHighScore[][]);
}

export {
    persistData,
    fetchString,
    fetchStorableEnumValue,
    fetchHighScores
};