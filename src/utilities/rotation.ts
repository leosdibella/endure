import { IDictionary } from '../interfaces/iDictionary';
import { Boundary } from './enum';

const tileRelations: IDictionary<number[]> = {
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

export const rotationMaps: IDictionary<number[][]> = {
    [Boundary.topRight]: topRightHandCornerRotationMap,
    [Boundary.rightBottom]: bottomRightHandCornerRotationMap,
    [Boundary.bottomLeft]: bottomLeftHandCornerRotationMap,
    [Boundary.topLeft]: topLeftHandCornerRotationMap,
    [Boundary.top]: topSideRotationMap,
    [Boundary.right]: rightSideRotationMap,
    [Boundary.bottom]: bottomSideRotationMap,
    [Boundary.left]: leftSideRotationMap,
    [Boundary.none]: centralRotationMap
};