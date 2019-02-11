import extend from '@interactjs/utils/extend';
function install(scope) {
    const { interactions, } = scope;
    scope.defaults.perAction.modifiers = [];
    scope.modifiers = {};
    interactions.signals.on('new', ({ interaction }) => {
        interaction.modifiers = {
            startOffset: { left: 0, right: 0, top: 0, bottom: 0 },
            offsets: {},
            states: null,
            result: null,
        };
    });
    interactions.signals.on('before-action-start', (arg) => {
        start(arg, arg.interaction.coords.start.page, scope.modifiers);
    });
    interactions.signals.on('action-resume', (arg) => {
        beforeMove(arg);
        start(arg, arg.interaction.coords.cur.page, scope.modifiers);
    });
    interactions.signals.on('before-action-move', beforeMove);
    interactions.signals.on('before-action-end', beforeEnd);
    interactions.signals.on('before-action-start', setCoords);
    interactions.signals.on('before-action-move', setCoords);
    interactions.signals.on('after-action-start', restoreCoords);
    interactions.signals.on('after-action-move', restoreCoords);
    interactions.signals.on('stop', stop);
}
function startAll(arg) {
    for (const state of arg.states) {
        if (state.methods.start) {
            arg.state = state;
            state.methods.start(arg);
        }
    }
}
function getRectOffset(rect, coords) {
    return rect
        ? {
            left: coords.x - rect.left,
            top: coords.y - rect.top,
            right: rect.right - coords.x,
            bottom: rect.bottom - coords.y,
        }
        : {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
}
function start({ interaction, phase }, pageCoords, registeredModifiers) {
    const { target: interactable, element } = interaction;
    const modifierList = getModifierList(interaction, registeredModifiers);
    const states = prepareStates(modifierList);
    const rect = extend({}, interactable.getRect(element));
    if (!('width' in rect)) {
        rect.width = rect.right - rect.left;
    }
    if (!('height' in rect)) {
        rect.height = rect.bottom - rect.top;
    }
    const startOffset = getRectOffset(rect, pageCoords);
    interaction.modifiers.startOffset = startOffset;
    interaction.modifiers.startDelta = { x: 0, y: 0 };
    const arg = {
        interaction,
        interactable,
        element,
        pageCoords,
        phase,
        rect,
        startOffset,
        states,
        preEnd: false,
        requireEndOnly: false,
    };
    interaction.modifiers.states = states;
    interaction.modifiers.result = null;
    startAll(arg);
    arg.pageCoords = extend({}, interaction.coords.start.page);
    const result = interaction.modifiers.result = setAll(arg);
    return result;
}
function setAll(arg) {
    const { interaction, phase, preEnd, requireEndOnly, rect, skipModifiers } = arg;
    const states = skipModifiers
        ? arg.states.slice(interaction.modifiers.skip)
        : arg.states;
    arg.coords = extend({}, arg.pageCoords);
    arg.rect = extend({}, rect);
    const result = {
        delta: { x: 0, y: 0 },
        coords: arg.coords,
        changed: true,
    };
    for (const state of states) {
        const { options } = state;
        if (!state.methods.set ||
            !shouldDo(options, preEnd, requireEndOnly, phase)) {
            continue;
        }
        arg.state = state;
        state.methods.set(arg);
    }
    result.delta.x = arg.coords.x - arg.pageCoords.x;
    result.delta.y = arg.coords.y - arg.pageCoords.y;
    const prevCoords = interaction.modifiers.result
        ? interaction.modifiers.result.coords
        : interaction.coords.prev.page;
    result.changed = (prevCoords.x !== result.coords.x ||
        prevCoords.y !== result.coords.y);
    return result;
}
function prepareStates(modifierList) {
    const states = [];
    for (let index = 0; index < modifierList.length; index++) {
        const { options, methods, name } = modifierList[index];
        if (options && options.enabled === false) {
            continue;
        }
        const state = {
            options,
            methods,
            index,
            name,
        };
        states.push(state);
    }
    return states;
}
function beforeMove({ interaction, phase, preEnd, skipModifiers }) {
    const { target: interactable, element } = interaction;
    const modifierResult = setAll({
        interaction,
        interactable,
        element,
        preEnd,
        phase,
        pageCoords: interaction.coords.cur.page,
        rect: interactable.getRect(element),
        states: interaction.modifiers.states,
        requireEndOnly: false,
        skipModifiers,
    });
    interaction.modifiers.result = modifierResult;
    // don't fire an action move if a modifier would keep the event in the same
    // cordinates as before
    if (!modifierResult.changed && interaction.interacting()) {
        return false;
    }
}
function beforeEnd(arg) {
    const { interaction, event, noPreEnd } = arg;
    const states = interaction.modifiers.states;
    if (noPreEnd || !states || !states.length) {
        return;
    }
    let didPreEnd = false;
    for (const state of states) {
        arg.state = state;
        const { options, methods } = state;
        const endResult = methods.beforeEnd && methods.beforeEnd(arg);
        if (endResult === false) {
            return false;
        }
        // if the endOnly option is true for any modifier
        if (!didPreEnd && shouldDo(options, true, true)) {
            // fire a move event at the modified coordinates
            interaction.move({ event, preEnd: true });
            didPreEnd = true;
        }
    }
}
function stop(arg) {
    const { interaction } = arg;
    const states = interaction.modifiers.states;
    if (!states || !states.length) {
        return;
    }
    const modifierArg = extend({
        states,
        interactable: interaction.target,
        element: interaction.element,
    }, arg);
    restoreCoords(arg);
    for (const state of states) {
        modifierArg.state = state;
        if (state.methods.stop) {
            state.methods.stop(modifierArg);
        }
    }
    arg.interaction.modifiers.states = null;
}
function setCoords(arg) {
    const { interaction, phase } = arg;
    const curCoords = arg.curCoords || interaction.coords.cur;
    const startCoords = arg.startCoords || interaction.coords.start;
    const { result, startDelta } = interaction.modifiers;
    const curDelta = result.delta;
    if (phase === 'start') {
        extend(interaction.modifiers.startDelta, result.delta);
    }
    for (const [coordsSet, delta] of [[startCoords, startDelta], [curCoords, curDelta]]) {
        coordsSet.page.x += delta.x;
        coordsSet.page.y += delta.y;
        coordsSet.client.x += delta.x;
        coordsSet.client.y += delta.y;
    }
}
function restoreCoords({ interaction: { coords, modifiers } }) {
    const { startDelta, result: { delta: curDelta } } = modifiers;
    for (const [coordsSet, delta] of [[coords.start, startDelta], [coords.cur, curDelta]]) {
        coordsSet.page.x -= delta.x;
        coordsSet.page.y -= delta.y;
        coordsSet.client.x -= delta.x;
        coordsSet.client.y -= delta.y;
    }
}
function getModifierList(interaction, registeredModifiers) {
    const actionOptions = interaction.target.options[interaction.prepared.name];
    const actionModifiers = actionOptions.modifiers;
    if (actionModifiers && actionModifiers.length) {
        return actionModifiers.map((modifier) => {
            if (!modifier.methods && modifier.type) {
                return registeredModifiers[modifier.type](modifier);
            }
            return modifier;
        });
    }
    return ['snap', 'snapSize', 'snapEdges', 'restrict', 'restrictEdges', 'restrictSize']
        .map((type) => {
        const options = actionOptions[type];
        return options && options.enabled && {
            options,
            methods: options._methods,
        };
    })
        .filter((m) => !!m);
}
function shouldDo(options, preEnd, requireEndOnly, phase) {
    return options
        ? options.enabled !== false &&
            (preEnd || !options.endOnly) &&
            (!requireEndOnly || options.endOnly) &&
            (options.setStart || phase !== 'start')
        : !requireEndOnly;
}
function makeModifier(module, name) {
    const { defaults } = module;
    const methods = {
        start: module.start,
        set: module.set,
        beforeEnd: module.beforeEnd,
        stop: module.stop,
    };
    const modifier = (options) => {
        options = options || {};
        // add missing defaults to options
        options.enabled = options.enabled !== false;
        for (const prop in defaults) {
            if (!(prop in options)) {
                options[prop] = defaults[prop];
            }
        }
        return { options, methods, name };
    };
    if (typeof name === 'string') {
        Object.defineProperty(modifier, 'name', { value: name });
        // for backwrads compatibility
        modifier._defaults = defaults;
        modifier._methods = methods;
    }
    return modifier;
}
export default {
    install,
    startAll,
    setAll,
    prepareStates,
    start,
    beforeMove,
    beforeEnd,
    stop,
    shouldDo,
    getModifierList,
    getRectOffset,
    makeModifier,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxNQUFNLE1BQU0sMEJBQTBCLENBQUE7QUFvQjdDLFNBQVMsT0FBTyxDQUFFLEtBQVk7SUFDNUIsTUFBTSxFQUNKLFlBQVksR0FDYixHQUFHLEtBQUssQ0FBQTtJQUVULEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7SUFDdkMsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7SUFFcEIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFO1FBQ2pELFdBQVcsQ0FBQyxTQUFTLEdBQUc7WUFDdEIsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtZQUNyRCxPQUFPLEVBQU0sRUFBRTtZQUNmLE1BQU0sRUFBSyxJQUFJO1lBQ2YsTUFBTSxFQUFPLElBQUk7U0FDbEIsQ0FBQTtJQUNILENBQUMsQ0FBQyxDQUFBO0lBRUYsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNyRCxLQUFLLENBQUMsR0FBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3ZFLENBQUMsQ0FBQyxDQUFBO0lBRUYsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDL0MsVUFBVSxDQUFDLEdBQVUsQ0FBQyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxHQUFVLEVBQUUsR0FBRyxDQUFDLFdB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QUNSLE1BQU0sRUFDTixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBRWxCLDhCQUE4QjtRQUM5QixRQUFRLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQTtRQUM3QixRQUFRLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtLQUM1QjtJQUVELE9BQU8sUUFBUSxDQUFBO0FBQ2pCLENBQUM7QUFFRCxlQUFlO0lBQ2IsT0FBTztJQUNQLFFBQVE7SUFDUixNQUFNO0lBQ04sYUFBYTtJQUNiLEtBQUs7SUFDTCxVQUFVO0lBQ1YsU0FBUztJQUNULElBQUk7SUFDSixRQUFRO0lBQ1IsZUFBZTtJQUNmLGFBQWE7SUFDYixZQUFZO0NBQ2IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNjb3BlIH0gZnJvbSAnQGludGVyYWN0anMvY29yZS9zY29wZSdcbmltcG9ydCBleHRlbmQgZnJvbSAnQGludGVyYWN0anMvdXRpbHMvZXh0ZW5kJ1xuXG5kZWNsYXJlIG1vZHVsZSAnQGludGVyYWN0anMvY29yZS9zY29wZScge1xuICBpbnRlcmZhY2UgU2NvcGUge1xuICAgIG1vZGlmaWVycz86IGFueVxuICB9XG59XG5cbmRlY2xhcmUgbW9kdWxlICdAaW50ZXJhY3Rqcy9jb3JlL0ludGVyYWN0aW9uJyB7XG4gIGludGVyZmFjZSBJbnRlcmFjdGlvbiB7XG4gICAgbW9kaWZpZXJzPzogYW55XG4gIH1cbn1cblxuZGVjbGFyZSBtb2R1bGUgJ0BpbnRlcmFjdGpzL2NvcmUvZGVmYXVsdE9wdGlvbnMnIHtcbiAgaW50ZXJmYWNlIFBlckFjdGlvbkRlZmF1bHRzIHtcbiAgICBtb2RpZmllcnM/OiBhbnlbXVxuICB9XG59XG5cbmZ1bmN0aW9uIGluc3RhbGwgKHNjb3BlOiBTY29wZSkge1xuICBjb25zdCB7XG4gICAgaW50ZXJhY3Rpb25zLFxuICB9ID0gc2NvcGVcblxuICBzY29wZS5kZWZhdWx0cy5wZXJBY3Rpb24ubW9kaWZpZXJzID0gW11cbiAgc2NvcGUubW9kaWZpZXJzID0ge31cblxuICBpbnRlcmFjdGlvbnMuc2lnbmFscy5vbignbmV3JywgKHsgaW50ZXJhY3Rpb24gfSkgPT4ge1xuICAgIGludGVyYWN0aW9uLm1vZGlmaWVycyA9IHtcbiAgICAgIHN0YXJ0T2Zmc2V0OiB7IGxlZnQ6IDAsIHJpZ2h0OiAwLCB0b3A6IDAsIGJvdHRvbTogMCB9LFxuICAgICAgb2Zmc2V0cyAgICA6IHt9LFxuICAgICAgc3RhdGVzICAgOiBudWxsLFxuICAgICAgcmVzdWx0ICAgICA6IG51bGwsXG4gICAgfVxuICB9KVxuXG4gIGludGVyYWN0aW9ucy5zaWduYWxzLm9uKCdiZWZvcmUtYWN0aW9uLXN0YXJ0JywgKGFyZykgPT4ge1xuICAgIHN0YXJ0KGFyZyBhcyBhbnksIGFyZy5pbnRlcmFjdGlvbi5jb29yZHMuc3RhcnQucGFnZSwgc2NvcGUubW9kaWZpZXJzKVxuICB9KVxuXG4gIGludGVyYWN0aW9ucy5zaWduYWxzLm9uKCdhY3Rpb24tcmVzdW1lJywgKGFyZykgPT4ge1xuICAgIGJlZm9yZU1vdmUoYXJnIGFzIGFueSlcbiAgICBzdGFydChhcmcgYXMgYW55LCBhcmcuaW50ZXJhY3Rpb24uY29vcmRzLmN1ci5wYWdlLCBzY29wZS5tb2RpZmllcnMpXG4gIH0pXG5cbiAgaW50ZXJhY3Rpb25zLnNpZ25hbHMub24oJ2JlZm9yZS1hY3Rpb24tbW92ZScsIGJlZm9yZU1vdmUpXG4gIGludGVyYWN0aW9ucy5zaWduYWxzLm9uKCdiZWZvcmUtYWN0aW9uLWVuZCcsIGJlZm9yZUVuZClcblxuICBpbnRlcmFjdGlvbnMuc2lnbmFscy5vbignYmVmb3JlLWFjdGlvbi1zdGFydCcsIHNldENvb3JkcylcbiAgaW50ZXJhY3Rpb25zLnNpZ25hbHMub24oJ2JlZm9yZS1hY3Rpb24tbW92ZScsIHNldENvb3JkcylcblxuICBpbnRlcmFjdGlvbnMuc2lnbmFscy5vbignYWZ0ZXItYWN0aW9uLXN0YXJ0JywgcmVzdG9yZUNvb3JkcyBhcyBhbnkpXG4gIGludGVyYWN0aW9ucy5zaWduYWxzLm9uKCdhZnRlci1hY3Rpb24tbW92ZScsIHJlc3RvcmVDb29yZHMgYXMgYW55KVxuICBpbnRlcmFjdGlvbnMuc2lnbmFscy5vbignc3RvcCcsIHN0b3ApXG59XG5cbmZ1bmN0aW9uIHN0YXJ0QWxsIChhcmcpIHtcbiAgZm9yIChjb25zdCBzdGF0ZSBvZiBhcmcuc3RhdGVzKSB7XG4gICAgaWYgKHN0YXRlLm1ldGhvZHMuc3RhcnQpIHtcbiAgICAgIGFyZy5zdGF0ZSA9IHN0YXRlXG4gICAgICBzdGF0ZS5tZXRob2RzLnN0YXJ0KGFyZylcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmVjdE9mZnNldCAocmVjdCwgY29vcmRzKSB7XG4gIHJldHVybiByZWN0XG4gICAgPyB7XG4gICAgICBsZWZ0ICA6IGNvb3Jkcy54IC0gcmVjdC5sZWZ0LFxuICAgICAgdG9wICAgOiBjb29yZHMueSAtIHJlY3QudG9wLFxuICAgICAgcmlnaHQgOiByZWN0LnJpZ2h0ICAtIGNvb3Jkcy54LFxuICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSAtIGNvb3Jkcy55LFxuICAgIH1cbiAgICA6IHtcbiAgICAgIGxlZnQgIDogMCxcbiAgICAgIHRvcCAgIDogMCxcbiAgICAgIHJpZ2h0IDogMCxcbiAgICAgIGJvdHRvbTogMCxcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0IChcbiAgeyBpbnRlcmFjdGlvbiwgcGhhc2UgfTogSW50ZXJhY3QuU2lnbmFsQXJnLFxuICBwYWdlQ29vcmRzOiBJbnRlcmFjdC5Qb2ludCxcbiAgcmVnaXN0ZXJlZE1vZGlmaWVycyxcbikge1xuICBjb25zdCB7IHRhcmdldDogaW50ZXJhY3RhYmxlLCBlbGVtZW50IH0gPSBpbnRlcmFjdGlvblxuICBjb25zdCBtb2RpZmllckxpc3QgPSBnZXRNb2RpZmllckxpc3QoaW50ZXJhY3Rpb24sIHJlZ2lzdGVyZWRNb2RpZmllcnMpXG4gIGNvbnN0IHN0YXRlcyA9IHByZXBhcmVTdGF0ZXMobW9kaWZpZXJMaXN0KVxuXG4gIGNvbnN0IHJlY3QgPSBleHRlbmQoe30sIGludGVyYWN0YWJsZS5nZXRSZWN0KGVsZW1lbnQpKSBhcyAgSW50ZXJhY3QuUmVjdCAmIEludGVyYWN0LlJlY3QyXG5cbiAgaWYgKCEoJ3dpZHRoJyAgaW4gcmVjdCkpIHsgcmVjdC53aWR0aCAgPSByZWN0LnJpZ2h0ICAtIHJlY3QubGVmdCB9XG4gIGlmICghKCdoZWlnaHQnIGluIHJlY3QpKSB7IHJlY3QuaGVpZ2h0ID0gcmVjdC5ib3R0b20gLSByZWN0LnRvcCAgfVxuXG4gIGNvbnN0IHN0YXJ0T2Zmc2V0ID0gZ2V0UmVjdE9mZnNldChyZWN0LCBwYWdlQ29vcmRzKVxuXG4gIGludGVyYWN0aW9uLm1vZGlmaWVycy5zdGFydE9mZnNldCA9IHN0YXJ0T2Zmc2V0XG4gIGludGVyYWN0aW9uLm1vZGlmaWVycy5zdGFydERlbHRhID0geyB4OiAwLCB5OiAwIH1cblxuICBjb25zdCBhcmc6IFBhcnRpYWw8SW50ZXJhY3QuU2lnbmFsQXJnPiA9IHtcbiAgICBpbnRlcmFjdGlvbixcbiAgICBpbnRlcmFjdGFibGUsXG4gICAgZWxlbWVudCxcbiAgICBwYWdlQ29vcmRzLFxuICAgIHBoYXNlLFxuICAgIHJlY3QsXG4gICAgc3RhcnRPZmZzZXQsXG4gICAgc3RhdGVzLFxuICAgIHByZUVuZDogZmFsc2UsXG4gICAgcmVxdWlyZUVuZE9ubHk6IGZhbHNlLFxuICB9XG5cbiAgaW50ZXJhY3Rpb24ubW9kaWZpZXJzLnN0YXRlcyA9IHN0YXRlc1xuICBpbnRlcmFjdGlvbi5tb2RpZmllcnMucmVzdWx0ID0gbnVsbFxuICBzdGFydEFsbChhcmcpXG5cbiAgYXJnLnBhZ2VDb29yZHMgPSBleHRlbmQoe30sIGludGVyYWN0aW9uLmNvb3Jkcy5zdGFydC5wYWdlKVxuXG4gIGNvbnN0IHJlc3VsdCA9IGludGVyYWN0aW9uLm1vZGlmaWVycy5yZXN1bHQgPSBzZXRBbGwoYXJnKVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gc2V0QWxsIChhcmc6IFBhcnRpYWw8SW50ZXJhY3QuU2lnbmFsQXJnPikge1xuICBjb25zdCB7IGludGVyYWN0aW9uLCBwaGFzZSwgcHJlRW5kLCByZXF1aXJlRW5kT25seSwgcmVjdCwgc2tpcE1vZGlmaWVycyB9ID0gYXJnXG5cbiAgY29uc3Qgc3RhdGVzID0gc2tpcE1vZGlmaWVyc1xuICAgID8gYXJnLnN0YXRlcy5zbGljZShpbnRlcmFjdGlvbi5tb2RpZmllcnMuc2tpcClcbiAgICA6IGFyZy5zdGF0ZXNcblxuICBhcmcuY29vcmRzID0gZXh0ZW5kKHt9LCBhcmcucGFnZUNvb3JkcylcbiAgYXJnLnJlY3QgPSBleHRlbmQoe30sIHJlY3QpXG5cbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIGRlbHRhOiB7IHg6IDAsIHk6IDAgfSxcbiAgICBjb29yZHM6IGFyZy5jb29yZHMsXG4gICAgY2hhbmdlZDogdHJ1ZSxcbiAgfVxuXG4gIGZvciAoY29uc3Qgc3RhdGUgb2Ygc3RhdGVzKSB7XG4gICAgY29uc3QgeyBvcHRpb25zIH0gPSBzdGF0ZVxuXG4gICAgaWYgKCFzdGF0ZS5tZXRob2RzLnNldCB8fFxuICAgICAgIXNob3VsZERvKG9wdGlvbnMsIHByZUVuZCwgcmVxdWlyZUVuZE9ubHksIHBoYXNlKSkgeyBjb250aW51ZSB9XG5cbiAgICBhcmcuc3RhdGUgPSBzdGF0ZVxuICAgIHN0YXRlLm1ldGhvZHMuc2V0KGFyZylcbiAgfVxuXG4gIHJlc3VsdC5kZWx0YS54ID0gYXJnLmNvb3Jkcy54IC0gYXJnLnBhZ2VDb29yZHMueFxuICByZXN1bHQuZGVsdGEueSA9IGFyZy5jb29yZHMueSAtIGFyZy5wYWdlQ29vcmRzLnlcblxuICBjb25zdCBwcmV2Q29vcmRzID0gaW50ZXJhY3Rpb24ubW9kaWZpZXJzLnJlc3VsdFxuICAgID8gaW50ZXJhY3Rpb24ubW9kaWZpZXJzLnJlc3VsdC5jb29yZHNcbiAgICA6IGludGVyYWN0aW9uLmNvb3Jkcy5wcmV2LnBhZ2VcblxuICByZXN1bHQuY2hhbmdlZCA9IChcbiAgICBwcmV2Q29vcmRzLnggIT09IHJlc3VsdC5jb29yZHMueCB8fFxuICAgIHByZXZDb29yZHMueSAhPT0gcmVzdWx0LmNvb3Jkcy55KVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gcHJlcGFyZVN0YXRlcyAobW9kaWZpZXJMaXN0KSB7XG4gIGNvbnN0IHN0YXRlcyA9IFtdXG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG1vZGlmaWVyTGlzdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBjb25zdCB7IG9wdGlvbnMsIG1ldGhvZHMsIG5hbWUgfSA9IG1vZGlmaWVyTGlzdFtpbmRleF1cblxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZW5hYmxlZCA9PT0gZmFsc2UpIHsgY29udGludWUgfVxuXG4gICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICBvcHRpb25zLFxuICAgICAgbWV0aG9kcyxcbiAgICAgIGluZGV4LFxuICAgICAgbmFtZSxcbiAgICB9XG5cbiAgICBzdGF0ZXMucHVzaChzdGF0ZSlcbiAgfVxuXG4gIHJldHVybiBzdGF0ZXNcbn1cblxuZnVuY3Rpb24gYmVmb3JlTW92ZSAoeyBpbnRlcmFjdGlvbiwgcGhhc2UsIHByZUVuZCwgc2tpcE1vZGlmaWVycyB9KTogdm9pZCB8IGZhbHNlIHtcbiAgY29uc3QgeyB0YXJnZXQ6IGludGVyYWN0YWJsZSwgZWxlbWVudCB9ID0gaW50ZXJhY3Rpb25cbiAgY29uc3QgbW9kaWZpZXJSZXN1bHQgPSBzZXRBbGwoXG4gICAge1xuICAgICAgaW50ZXJhY3Rpb24sXG4gICAgICBpbnRlcmFjdGFibGUsXG4gICAgICBlbGVtZW50LFxuICAgICAgcHJlRW5kLFxuICAgICAgcGhhc2UsXG4gICAgICBwYWdlQ29vcmRzOiBpbnRlcmFjdGlvbi5jb29yZHMuY3VyLnBhZ2UsXG4gICAgICByZWN0OiBpbnRlcmFjdGFibGUuZ2V0UmVjdChlbGVtZW50KSxcbiAgICAgIHN0YXRlczogaW50ZXJhY3Rpb24ubW9kaWZpZXJzLnN0YXRlcyxcbiAgICAgIHJlcXVpcmVFbmRPbmx5OiBmYWxzZSxcbiAgICAgIHNraXBNb2RpZmllcnMsXG4gICAgfSlcblxuICBpbnRlcmFjdGlvbi5tb2RpZmllcnMucmVzdWx0ID0gbW9kaWZpZXJSZXN1bHRcblxuICAvLyBkb24ndCBmaXJlIGFuIGFjdGlvbiBtb3ZlIGlmIGEgbW9kaWZpZXIgd291bGQga2VlcCB0aGUgZXZlbnQgaW4gdGhlIHNhbWVcbiAgLy8gY29yZGluYXRlcyBhcyBiZWZvcmVcbiAgaWYgKCFtb2RpZmllclJlc3VsdC5jaGFuZ2VkICYmIGludGVyYWN0aW9uLmludGVyYWN0aW5nKCkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBiZWZvcmVFbmQgKGFyZyk6IHZvaWQgfCBmYWxzZSB7XG4gIGNvbnN0IHsgaW50ZXJhY3Rpb24sIGV2ZW50LCBub1ByZUVuZCB9ID0gYXJnXG4gIGNvbnN0IHN0YXRlcyA9IGludGVyYWN0aW9uLm1vZGlmaWVycy5zdGF0ZXNcblxuICBpZiAobm9QcmVFbmQgfHwgIXN0YXRlcyB8fCAhc3RhdGVzLmxlbmd0aCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgbGV0IGRpZFByZUVuZCA9IGZhbHNlXG5cbiAgZm9yIChjb25zdCBzdGF0ZSBvZiBzdGF0ZXMpIHtcbiAgICBhcmcuc3RhdGUgPSBzdGF0ZVxuICAgIGNvbnN0IHsgb3B0aW9ucywgbWV0aG9kcyB9ID0gc3RhdGVcblxuICAgIGNvbnN0IGVuZFJlc3VsdCA9IG1ldGhvZHMuYmVmb3JlRW5kICYmIG1ldGhvZHMuYmVmb3JlRW5kKGFyZylcblxuICAgIGlmIChlbmRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgZW5kT25seSBvcHRpb24gaXMgdHJ1ZSBmb3IgYW55IG1vZGlmaWVyXG4gICAgaWYgKCFkaWRQcmVFbmQgJiYgc2hvdWxkRG8ob3B0aW9ucywgdHJ1ZSwgdHJ1ZSkpIHtcbiAgICAgIC8vIGZpcmUgYSBtb3ZlIGV2ZW50IGF0IHRoZSBtb2RpZmllZCBjb29yZGluYXRlc1xuICAgICAgaW50ZXJhY3Rpb24ubW92ZSh7IGV2ZW50LCBwcmVFbmQ6IHRydWUgfSlcbiAgICAgIGRpZFByZUVuZCA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RvcCAoYXJnKSB7XG4gIGNvbnN0IHsgaW50ZXJhY3Rpb24gfSA9IGFyZ1xuICBjb25zdCBzdGF0ZXMgPSBpbnRlcmFjdGlvbi5tb2RpZmllcnMuc3RhdGVzXG5cbiAgaWYgKCFzdGF0ZXMgfHwgIXN0YXRlcy5sZW5ndGgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IG1vZGlmaWVyQXJnID0gZXh0ZW5kKHtcbiAgICBzdGF0ZXMsXG4gICAgaW50ZXJhY3RhYmxlOiBpbnRlcmFjdGlvbi50YXJnZXQsXG4gICAgZWxlbWVudDogaW50ZXJhY3Rpb24uZWxlbWVudCxcbiAgfSwgYXJnKVxuXG4gIHJlc3RvcmVDb29yZHMoYXJnKVxuXG4gIGZvciAoY29uc3Qgc3RhdGUgb2Ygc3RhdGVzKSB7XG4gICAgbW9kaWZpZXJBcmcuc3RhdGUgPSBzdGF0ZVxuXG4gICAgaWYgKHN0YXRlLm1ldGhvZHMuc3RvcCkgeyBzdGF0ZS5tZXRob2RzLnN0b3AobW9kaWZpZXJBcmcpIH1cbiAgfVxuXG4gIGFyZy5pbnRlcmFjdGlvbi5tb2RpZmllcnMuc3RhdGVzID0gbnVsbFxufVxuXG5mdW5jdGlvbiBzZXRDb29yZHMgKGFyZykge1xuICBjb25zdCB7IGludGVyYWN0aW9uLCBwaGFzZSB9ID0gYXJnXG4gIGNvbnN0IGN1ckNvb3JkcyA9IGFyZy5jdXJDb29yZHMgfHwgaW50ZXJhY3Rpb24uY29vcmRzLmN1clxuICBjb25zdCBzdGFydENvb3JkcyA9IGFyZy5zdGFydENvb3JkcyB8fCBpbnRlcmFjdGlvbi5jb29yZHMuc3RhcnRcbiAgY29uc3QgeyByZXN1bHQsIHN0YXJ0RGVsdGEgfSA9IGludGVyYWN0aW9uLm1vZGlmaWVyc1xuICBjb25zdCBjdXJEZWx0YSA9IHJlc3VsdC5kZWx0YVxuXG4gIGlmIChwaGFzZSA9PT0gJ3N0YXJ0Jykge1xuICAgIGV4dGVuZChpbnRlcmFjdGlvbi5tb2RpZmllcnMuc3RhcnREZWx0YSwgcmVzdWx0LmRlbHRhKVxuICB9XG5cbiAgZm9yIChjb25zdCBbY29vcmRzU2V0LCBkZWx0YV0gb2YgW1tzdGFydENvb3Jkcywgc3RhcnREZWx0YV0sIFtjdXJDb29yZHMsIGN1ckRlbHRhXV0pIHtcbiAgICBjb29yZHNTZXQucGFnZS54ICAgKz0gZGVsdGEueFxuICAgIGNvb3Jkc1NldC5wYWdlLnkgICArPSBkZWx0YS55XG4gICAgY29vcmRzU2V0LmNsaWVudC54ICs9IGRlbHRhLnhcbiAgICBjb29yZHNTZXQuY2xpZW50LnkgKz0gZGVsdGEueVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVDb29yZHMgKHsgaW50ZXJhY3Rpb246IHsgY29vcmRzLCBtb2RpZmllcnMgfSB9KSB7XG4gIGNvbnN0IHsgc3RhcnREZWx0YSwgcmVzdWx0OiB7IGRlbHRhOiBjdXJEZWx0YSB9IH0gPSBtb2RpZmllcnNcblxuICBmb3IgKGNvbnN0IFtjb29yZHNTZXQsIGRlbHRhXSBvZiBbW2Nvb3Jkcy5zdGFydCwgc3RhcnREZWx0YV0sIFtjb29yZHMuY3VyLCBjdXJEZWx0YV1dKSB7XG4gICAgY29vcmRzU2V0LnBhZ2UueCAtPSBkZWx0YS54XG4gICAgY29vcmRzU2V0LnBhZ2UueSAtPSBkZWx0YS55XG4gICAgY29vcmRzU2V0LmNsaWVudC54IC09IGRlbHRhLnhcbiAgICBjb29yZHNTZXQuY2xpZW50LnkgLT0gZGVsdGEueVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1vZGlmaWVyTGlzdCAoaW50ZXJhY3Rpb24sIHJlZ2lzdGVyZWRNb2RpZmllcnMpIHtcbiAgY29uc3QgYWN0aW9uT3B0aW9ucyA9IGludGVyYWN0aW9uLnRhcmdldC5vcHRpb25zW2ludGVyYWN0aW9uLnByZXBhcmVkLm5hbWVdXG4gIGNvbnN0IGFjdGlvbk1vZGlmaWVycyA9IGFjdGlvbk9wdGlvbnMubW9kaWZpZXJzXG5cbiAgaWYgKGFjdGlvbk1vZGlmaWVycyAmJiBhY3Rpb25Nb2RpZmllcnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGFjdGlvbk1vZGlmaWVycy5tYXAoKG1vZGlmaWVyKSA9PiB7XG4gICAgICBpZiAoIW1vZGlmaWVyLm1ldGhvZHMgJiYgbW9kaWZpZXIudHlwZSkge1xuICAgICAgICByZXR1cm4gcmVnaXN0ZXJlZE1vZGlmaWVyc1ttb2RpZmllci50eXBlXShtb2RpZmllcilcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vZGlmaWVyXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBbJ3NuYXAnLCAnc25hcFNpemUnLCAnc25hcEVkZ2VzJywgJ3Jlc3RyaWN0JywgJ3Jlc3RyaWN0RWRnZXMnLCAncmVzdHJpY3RTaXplJ11cbiAgICAubWFwKCh0eXBlKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0gYWN0aW9uT3B0aW9uc1t0eXBlXVxuXG4gICAgICByZXR1cm4gb3B0aW9ucyAmJiBvcHRpb25zLmVuYWJsZWQgJiYge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBtZXRob2RzOiBvcHRpb25zLl9tZXRob2RzLFxuICAgICAgfVxuICAgIH0pXG4gICAgLmZpbHRlcigobSkgPT4gISFtKVxufVxuXG5mdW5jdGlvbiBzaG91bGREbyAob3B0aW9ucywgcHJlRW5kPzogYm9vbGVhbiwgcmVxdWlyZUVuZE9ubHk/OiBib29sZWFuLCBwaGFzZT86IHN0cmluZykge1xuICByZXR1cm4gb3B0aW9uc1xuICAgID8gb3B0aW9ucy5lbmFibGVkICE9PSBmYWxzZSAmJlxuICAgICAgKHByZUVuZCB8fCAhb3B0aW9ucy5lbmRPbmx5KSAmJlxuICAgICAgKCFyZXF1aXJlRW5kT25seSB8fCBvcHRpb25zLmVuZE9ubHkpICYmXG4gICAgICAob3B0aW9ucy5zZXRTdGFydCB8fCBwaGFzZSAhPT0gJ3N0YXJ0JylcbiAgICA6ICFyZXF1aXJlRW5kT25seVxufVxuXG5mdW5jdGlvbiBtYWtlTW9kaWZpZXIgKG1vZHVsZSwgbmFtZT86IHN0cmluZykge1xuICBjb25zdCB7IGRlZmF1bHRzIH0gPSBtb2R1bGVcbiAgY29uc3QgbWV0aG9kcyA9IHtcbiAgICBzdGFydDogbW9kdWxlLnN0YXJ0LFxuICAgIHNldDogbW9kdWxlLnNldCxcbiAgICBiZWZvcmVFbmQ6IG1vZHVsZS5iZWZvcmVFbmQsXG4gICAgc3RvcDogbW9kdWxlLnN0b3AsXG4gIH1cblxuICBjb25zdCBtb2RpZmllciA9IChvcHRpb25zKSA9PiB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICAgIC8vIGFkZCBtaXNzaW5nIGRlZmF1bHRzIHRvIG9wdGlvbnNcbiAgICBvcHRpb25zLmVuYWJsZWQgPSBvcHRpb25zLmVuYWJsZWQgIT09IGZhbHNlXG5cbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gZGVmYXVsdHMpIHtcbiAgICAgIGlmICghKHByb3AgaW4gb3B0aW9ucykpIHtcbiAgICAgICAgb3B0aW9uc1twcm9wXSA9IGRlZmF1bHRzW3Byb3BdXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgb3B0aW9ucywgbWV0aG9kcywgbmFtZSB9XG4gIH1cblxuICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgbW9kaWZpZXIsXG4gICAgICAnbmFtZScsXG4gICAgICB7IHZhbHVlOiBuYW1lIH0pXG5cbiAgICAvLyBmb3IgYmFja3dyYWRzIGNvbXBhdGliaWxpdHlcbiAgICBtb2RpZmllci5fZGVmYXVsdHMgPSBkZWZhdWx0c1xuICAgIG1vZGlmaWVyLl9tZXRob2RzID0gbWV0aG9kc1xuICB9XG5cbiAgcmV0dXJuIG1vZGlmaWVyXG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaW5zdGFsbCxcbiAgc3RhcnRBbGwsXG4gIHNldEFsbCxcbiAgcHJlcGFyZVN0YXRlcyxcbiAgc3RhcnQsXG4gIGJlZm9yZU1vdmUsXG4gIGJlZm9yZUVuZCxcbiAgc3RvcCxcbiAgc2hvdWxkRG8sXG4gIGdldE1vZGlmaWVyTGlzdCxcbiAgZ2V0UmVjdE9mZnNldCxcbiAgbWFrZU1vZGlmaWVyLFxufVxuIl19