import { IFirebaseDependencies } from '../interfaces/iFirebaseDependencies';
import { IHighScore } from '../interfaces/iHighScore';
import { Difficulty } from './enum';
import { dateStampLength, isDefined, isInteger, isObject, isString } from './shared';

function areValidFirebaseDependencies(firebaseDependencies: IFirebaseDependencies) {
    return isObject(firebaseDependencies)
        && isString(firebaseDependencies.baseUrl)
        && isString(firebaseDependencies.getEndpointSuffix)
        && isString(firebaseDependencies.postEndpointSuffix);
}

function isValidHighScore(highScore: IHighScore): boolean {
    return isObject(highScore)
        && isString(highScore.name)
        && highScore.name.length > 0
        && isString(highScore.dateStamp)
        && highScore.dateStamp.length === dateStampLength
        && isInteger(highScore.value)
        && highScore.value > 0
        && isInteger(highScore.difficulty)
        && isDefined(Difficulty[highScore.difficulty]);
}

export {
    areValidFirebaseDependencies,
    isValidHighScore
};