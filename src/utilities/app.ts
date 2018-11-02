/// <reference path="Utilities.ts" />
namespace Utilities {
    export namespace App {
        export interface Updates {
            view?: Utilities.App.View;
        };
        
        export enum View {
            dark = 'dark',
            light = 'light'
        };
    };
};