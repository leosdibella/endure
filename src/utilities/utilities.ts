export namespace Utilities {
    /**
     * Determines whether a value is well defined (i.e. non-null and not undefined)
     * @param value 
     * @returns true if well defined value 
     */
    export function isWellDefinedValue(value: any) : boolean {
        return value !== null && value !== undefined;
    };
};