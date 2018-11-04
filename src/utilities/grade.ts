export namespace Grade {
    export const stageDurationModifier: number = 10;
    export const timerModifier: number = 12;

    export const decrementIntervalBases: number[] = [
        419,
        379,
        337,
        293,
        257
    ];
    
    enum Value {
        aPlus = 'A+',
        a = 'A',
        aMinus = 'A-',
        bPlus = 'B+',
        b = 'B',
        bMinus = 'B-',
        cPlus = 'C+',
        c = 'C',
        cMinus = 'C-',
        dPlus = 'D+',
        d = 'D',
        dMinus = 'D-',
        f = 'F'
    };

    export const values: Value[] = Object.keys(Grade).map(g => g as Value);
};