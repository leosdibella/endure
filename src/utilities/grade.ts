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

    const modifiers: string[] = ['+', '', '-'];
     
    export const grades: string[] = ['A', 'B', 'C', 'D'].map(g => modifiers.map(m => g + m))
                                                        .reduce((a, b) => a.concat(b))
                                                        .concat('F');
};