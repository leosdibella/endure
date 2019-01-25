import axios, { AxiosResponse } from 'axios';
import { IEnum } from '../interfaces/iEnum';
import { IFirebaseDependencies } from '../interfaces/iFirebaseDependencies';
import { IHighScore } from '../interfaces/iHighScore';
import { Difficulty, Theme } from './enum';
import { fillArray, getNumericEnumKeys, isDefined, isInteger, isNotNull, isString } from './shared';
import { areValidFirebaseDependencies, isValidHighScore } from './validation';

type Storable = string | number | Difficulty | Theme | IHighScore[][];
type StorableEnumValue = Difficulty | Theme;

const defaultFirebaseDependencies: IFirebaseDependencies = {
    baseUrl: 'YOU_NEED_A_SECRETS_FILE',
    getEndpointSuffix: 'NO_GET_ENDPOINT_CONFIGURED',
    postEndpointSuffix: 'NO_POST_ENDPOINT_CONFIGURED'
};

let secretFirebaseDependencies: IFirebaseDependencies | undefined;

async function loadFirebaseDependenciesAsync(): Promise<IFirebaseDependencies> {
    if (!isDefined(secretFirebaseDependencies)) {
        const importedFirebaseDependencies: IFirebaseDependencies | undefined = await import(`../../config/secrets.${'production'}.config`);

        if (isDefined(importedFirebaseDependencies)) {
            secretFirebaseDependencies = importedFirebaseDependencies;
        }
    }

    return areValidFirebaseDependencies(secretFirebaseDependencies as IFirebaseDependencies) ? secretFirebaseDependencies as IFirebaseDependencies : defaultFirebaseDependencies;
}

function isLocalStorageSupported(): boolean {
    return typeof(Storage) !== 'undefined' && isDefined(window.localStorage) && isNotNull(window.localStorage);
}

function persistLocalData(key: string, value: Storable): boolean {
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

        if (isNotNull(data)) {
            return JSON.parse(data as string) as T;
        }

        return undefined;
    }
}

function fetchString(key: string): string | undefined {
    const data: string | undefined = fetchData<string>(key);

    if (isString(data)) {
        return (data as string).length > 0 ? data as string : undefined;
    }

    return undefined;
}

function fetchStorableEnumValue(key: string, collection: IEnum, defaultValue: StorableEnumValue): StorableEnumValue {
    const data: StorableEnumValue | undefined = fetchData<StorableEnumValue>(key);

    if (isInteger(data) && isDefined(collection[data as number])) {
        return data as StorableEnumValue;
    }

    return defaultValue;
}

function mapHHighScores(highScores: IHighScore[][]): IHighScore[][] {
    const highScoreArray: IHighScore[][] = fillArray(getNumericEnumKeys(Difficulty).length, () => []);

    if (Array.isArray(highScores)) {
        highScores.forEach((hsd, difficulty) => {
            if (Array.isArray(hsd) && isDefined(Difficulty[difficulty])) {
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

async function fetchGlobalHighScoresAsync(difficulty: Difficulty): Promise<AxiosResponse> {
    const firebaseDependencies: IFirebaseDependencies = await loadFirebaseDependenciesAsync();

    return axios.get(`${firebaseDependencies.baseUrl}/${firebaseDependencies.getEndpointSuffix}`, {
        params: {
            difficulty
        }
    });
}

async function persistGlobalHighScoreAsync(highScore: IHighScore, difficulty: Difficulty): Promise<AxiosResponse> {
    const firebaseDependencies: IFirebaseDependencies = await loadFirebaseDependenciesAsync();

    return axios.post(`${firebaseDependencies.baseUrl}/${firebaseDependencies.postEndpointSuffix}`, highScore, {
        params: {
            difficulty
        }
    });
}

export {
    persistLocalData,
    fetchString,
    fetchStorableEnumValue,
    fetchLocalHighScores,
    fetchGlobalHighScoresAsync,
    persistGlobalHighScoreAsync
};