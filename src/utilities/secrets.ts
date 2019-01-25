import { IFirebaseDependencies } from '../interfaces/iFirebaseDependencies';
import { ISecrets } from '../interfaces/ISecrets';
import { isDefined, isObject } from './shared';
import { areValidFirebaseDependencies } from './validation';

const defaultFirebaseDependencies: IFirebaseDependencies = {
    baseUrl: 'YOU_NEED_A_SECRETS_FILE',
    getEndpointSuffix: 'NO_GET_ENDPOINT_CONFIGURED',
    postEndpointSuffix: 'NO_POST_ENDPOINT_CONFIGURED'
};

let secretFirebaseDependencies: IFirebaseDependencies | undefined;

async function loadFirebaseDependenciesAsync(): Promise<IFirebaseDependencies> {
    if (!isDefined(secretFirebaseDependencies)) {
        const imported: ISecrets | undefined = await import(`../../config/secrets.${'production'}.config`);

        if (isDefined(imported) && isObject(imported)) {
            secretFirebaseDependencies = (imported as ISecrets).firebaseDependencies;
        }

        if (!areValidFirebaseDependencies(secretFirebaseDependencies as IFirebaseDependencies)) {
            secretFirebaseDependencies = defaultFirebaseDependencies;
        }
    }

    return secretFirebaseDependencies as IFirebaseDependencies;
}

export {
    loadFirebaseDependenciesAsync
};