import { IEnum } from '../interfaces/iEnum';
import { IHighScore } from '../interfaces/iHighScore';
import { Difficulty, Theme } from './enum';
import * as Shared from './shared';

type Storable = string | number | Difficulty | Theme | IHighScore[];
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

function mapHHighScores(highScores: IHighScore[]): IHighScore[] {
    const highScoreArray: IHighScore[] = [];

    if (Array.isArray(highScores)) {
        highScores.forEach(hs => {
            if (Shared.isObject(hs)
                    && Shared.isString(hs.name)
                    && Shared.isString(hs.dateStamp)
                    && Shared.isInteger(hs.value)
                    && Shared.isInteger(hs.difficulty)
                    && Shared.isDefined(Difficulty[hs.difficulty])) {
                highScoreArray.push(hs);
            }
        });
    }

    return highScoreArray;
}

function fetchHighScores(key: string): IHighScore[] {
    return mapHHighScores(fetchData<Storable>(key) as IHighScore[]);
}

export {
    persistData,
    fetchString,
    fetchStorableEnumValue,
    fetchHighScores
};