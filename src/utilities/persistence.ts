import axios, { AxiosPromise } from 'axios';
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

function isValidHighScore(highScore: IHighScore): boolean {
    return Shared.isObject(highScore)
        && Shared.isString(highScore.name)
        && highScore.name.length > 0
        && Shared.isString(highScore.dateStamp)
        && highScore.dateStamp.length === Shared.dateStampLength
        && Shared.isInteger(highScore.value)
        && highScore.value > 0
        && Shared.isInteger(highScore.difficulty)
        && Shared.isDefined(Difficulty[highScore.difficulty]);
}

function mapHHighScores(highScores: IHighScore[][]): IHighScore[][] {
    const highScoreArray: IHighScore[][] = Shared.fillArray(Shared.getNumericEnumKeys(Difficulty).length, () => []);

    if (Array.isArray(highScores)) {
        highScores.forEach((hsd, difficulty) => {
            if (Array.isArray(hsd) && Shared.isDefined(Difficulty[difficulty])) {
                hsd.forEach(hs => {
                    if (isValidHighScore(hs)) {
                        highScoreArray[difficulty].push(hs);
                    }
                });
            }
        });
    }

    return highScoreArray;
}

function fetchLocalHighScores(key: string): IHighScore[][] {
    return mapHHighScores(fetchData<Storable>(key) as IHighScore[][]);
}

function fetchGlobalHighScores(difficulty: Difficulty): AxiosPromise {
    return axios.get('place-holder-url-for-firebase-functional-endpoint', {
        params: {
            difficulty
        }
    });
}

function persistGlobalHighScore(highScore: IHighScore, difficulty: Difficulty): AxiosPromise {
    return axios.post('place-holder-url-for-firebase-functional-endpoint', highScore, {
        params: {
            difficulty
        }
    });
}

export {
    persistData,
    fetchString,
    fetchStorableEnumValue,
    fetchLocalHighScores,
    fetchGlobalHighScores,
    persistGlobalHighScore,
    isValidHighScore
};