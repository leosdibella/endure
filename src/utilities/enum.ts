enum AnimationTiming {
    linear = 0,
    accelerate
}

enum Boundary {
    none = 0,
    top = 1,
    right = 2,
    bottom = 4,
    left = 8,
    topRight = top | right,
    topBottom = top | bottom,
    topLeft = top | left,
    rightBottom = bottom | right,
    bottomLeft = bottom | left,
    rightLeft = left | right,
    topRightBottom = top | right | bottom,
    rightBottomLeft = right | bottom | left,
    topBottomLeft = bottom | left | top,
    topRightLeft = left | top | right,
    all = top | right | bottom | left
}

enum Color {
    transparent = 0,
    red,
    green,
    blue,
    violet,
    yellow,
    orange,
    grey
}

enum DetonationRange {
    none = 0,
    small,
    medium,
    large
}

enum Difficulty {
    beginner = 0,
    low,
    medium,
    hard,
    expert
}

enum DomEvent {
    resize = 'resize',
    orientationChange = 'orientationchange',
    keyDown = 'keydown',
    click = 'click'
}

enum GameMode {
    newGame = 0,
    specifyName,
    selectDifficulty,
    inGame,
    gameOver,
    paused,
    highScores,
    setTheme
}

enum GridMode {
    ready = 0,
    collapsing,
    cascading
}

enum LetterGrade {
    aPlus = 0,
    a,
    aMinus,
    bPlus,
    b,
    bMinus,
    cPlus,
    c,
    cMinus,
    dPlus,
    d,
    dMinus,
    f
}

enum Orientation {
    portrait = 0,
    landscape
}

enum Theme {
    light = 0,
    dark
}

enum TileType {
    standard = 0,
    highlighted,
    highlightedNeighbor,
    obscured
}

export {
    AnimationTiming,
    Boundary,
    Color,
    DetonationRange,
    Difficulty,
    DomEvent,
    GameMode,
    GridMode,
    LetterGrade,
    Orientation,
    Theme,
    TileType
};