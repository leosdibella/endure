import * as GeneralUtilities from './general';
import * as TileUtilities from './tile';

const tileRelations: GeneralUtilities.IDictionary<number[]> = {
    bottom: [1, 0],
    bottomLeft: [1, -1],
    bottomRight: [1, 1],
    left: [0, -1],
    right: [0, 1],
    self: [0, 0],
    top: [-1, 0],
    topLeft: [-1, -1],
    topRight: [-1, 1]
};

const centralRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right,
    tileRelations.bottomRight,
    tileRelations.bottom,
    tileRelations.bottomLeft
];

const topLeftHandCornerRotationMap: number[][] = [
    tileRelations.bottom,
    tileRelations.self,
    tileRelations.right,
    tileRelations.bottomRight
];

const topRightHandCornerRotationMap: number[][] = [
    tileRelations.bottomLeft,
    tileRelations.left,
    tileRelations.self,
    tileRelations.bottom
];

const bottomLeftHandCornerRotationMap: number[][] = [
    tileRelations.self,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right
];

const bottomRightHandCornerRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.self
];

const topSideRotationMap: number[][] = [
    tileRelations.bottomLeft,
    tileRelations.left,
    tileRelations.self,
    tileRelations.right,
    tileRelations.bottomRight,
    tileRelations.bottom
];

const bottomSideRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right,
    tileRelations.self
];

const leftSideRotationMap: number[][] = [
    tileRelations.self,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right,
    tileRelations.bottomRight,
    tileRelations.bottom
];

const rightSideRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.self,
    tileRelations.bottom,
    tileRelations.bottomLeft
];

const maps: GeneralUtilities.IDictionary<number[][]> = {
    [TileUtilities.Link.topRight]: topRightHandCornerRotationMap,
    [TileUtilities.Link.rightBottom]: bottomRightHandCornerRotationMap,
    [TileUtilities.Link.bottomLeft]: bottomLeftHandCornerRotationMap,
    [TileUtilities.Link.topLeft]: topLeftHandCornerRotationMap,
    [TileUtilities.Link.top]: topSideRotationMap,
    [TileUtilities.Link.right]: rightSideRotationMap,
    [TileUtilities.Link.bottom]: bottomSideRotationMap,
    [TileUtilities.Link.left]: leftSideRotationMap,
    [TileUtilities.Link.none]: centralRotationMap
};

export {
    maps
};