declare module '@interactjs/core/scope' {
    interface Scope {
        modifiers?: any;
    }
}
declare module '@interactjs/core/Interaction' {
    interface Interaction {
        modifiers?: {
            states: ModifierState[];
            offsets: any;
            startOffset: any;
            startDelta: Interact.Point;
            result?: ModifiersResult;
            endPrevented: boolean;
        };
    }
}
declare module '@interactjs/core/defaultOptions' {
    interface PerActionDefaults {
        modifiers?: Modifier[];
    }
}
export interface Modifier<Defaults = any, State extends ModifierState = any, Name extends string = any> {
    options?: Defaults;
    methods: {
        start?: (arg: ModifierArg<State>) => void;
        set: (arg: ModifierArg<State>) => void;
        beforeEnd?: (arg: ModifierArg<State>) => boolean;
        stop?: (arg: ModifierArg<State>) => void;
    };
    name?: Name;
}
export declare type ModifierState<Defaults = {}, StateProps extends {
    [prop: string]: any;
} = {}, Name extends string = any> = {
    options: Defaults;
    methods?: Modifier<Defaults>['methods'];
    index?: number;
    name?: Name;
} & StateProps;
export interface ModifierArg<State extends ModifierState = ModifierState> {
    interaction: Interact.Interaction;
    interactable: Interact.Interactable;
    phase: Interact.EventPhase;
    rect: Interact.FullRect;
    edges: Interact.EdgeOptions;
    states?: State[];
    state?: State;
    element: Interact.Element;
    pageCoords?: Interact.Point;
    prevCoords?: Interact.Point;
    prevRect?: Interact.FullRect;
    coords?: Interact.Point;
    startOffset?: Interact.Rect;
    preEnd?: boolean;
    requireEndOnly?: boolean;
}
export interface ModifierModule<Defaults extends {
    enabled?: boolean;
}, State extends ModifierState> {
    defaults?: Defaults;
    start?(arg: ModifierArg<State>): void;
    set?(arg: ModifierArg<State>): void;
    beforeEnd?(arg: ModifierArg<State>): boolean;
    stop?(arg: ModifierArg<State>): void;
}
export interface ModifiersResult {
    delta: {
        x: number;
        y: number;
    };
    rectDelta: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    coords: Interact.Point;
    rect: Interact.FullRect;
    changed: boolean;
}
export declare function startAll(arg: ModifierArg<any>): void;
export declare function setAll(arg: ModifierArg): {
    delta: {
        x: number;
        y: number;
    };
    rectDelta: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    coords: import("../types/types").Point;
    rect: Required<import("../types/types").Rect>;
    changed: boolean;
};
export declare function prepareStates(modifierList: Modifier[]): {
    options: {};
    methods?: {
        start?: (arg: ModifierArg<any>) => void;
        set: (arg: ModifierArg<any>) => void;
        beforeEnd?: (arg: ModifierArg<any>) => boolean;
        stop?: (arg: ModifierArg<any>) => void;
    };
    index?: number;
    name?: any;
}[];
export declare function setCoords(arg: {
    interaction: Interact.Interaction;
    phase: Interact.EventPhase;
    rect?: Interact.Rect;
}): void;
export declare function restoreCoords({ interaction: { coords, rect, modifiers } }: {
    interaction: Interact.Interaction;
}): void;
export declare function makeModifier<Defaults extends {
    enabled?: boolean;
}, State extends ModifierState, Name extends string>(module: ModifierModule<Defaults, State>, name?: Name): {
    (_options?: Partial<Defaults>): Modifier<Defaults, State, Name>;
    _defaults: Defaults;
    _methods: {
        start: (arg: ModifierArg<State>) => void;
        set: (arg: ModifierArg<State>) => void;
        beforeEnd: (arg: ModifierArg<State>) => boolean;
        stop: (arg: ModifierArg<State>) => void;
    };
};
declare const modifiersBase: Interact.Plugin;
export default modifiersBase;