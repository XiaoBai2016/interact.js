import * as actions from '@interactjs/actions';
import autoScroll from '@interactjs/auto-scroll';
import * as autoStart from '@interactjs/auto-start';
import interactablePreventDefault from '@interactjs/core/interactablePreventDefault';
import devTools from '@interactjs/dev-tools';
import inertia from '@interactjs/inertia';
import * as modifiers from '@interactjs/modifiers';
import modifiersBase from '@interactjs/modifiers/base';
import * as pointerEvents from '@interactjs/pointer-events';
import reflow from '@interactjs/reflow';
import interact, { scope } from './interact';
export function init(window) {
    scope.init(window);
    interact.use(interactablePreventDefault);
    // inertia
    interact.use(inertia);
    // pointerEvents
    interact.use(pointerEvents);
    // autoStart, hold
    interact.use(autoStart);
    // drag and drop, resize, gesture
    interact.use(actions);
    // snap, resize, etc.
    interact.use(modifiersBase);
    // for backwrads compatibility
    for (const type in modifiers) {
        const { _defaults, _methods } = modifiers[type];
        _defaults._methods = _methods;
        scope.defaults.perAction[type] = _defaults;
    }
    // autoScroll
    interact.use(autoScroll);
    // reflow
    interact.use(reflow);
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV !== 'production') {
        interact.use(devTools);
    }
    return interact;
}
// eslint-disable-next-line no-undef
interact.version = process.env.npm_package_version;
export default interact;
export { interact, actions, autoScroll, interactablePreventDefault, inertia, modifiersBase as modifiers, pointerEvents, reflow, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssT0FBTyxNQUFNLHFCQUFxQixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLHlCQUF5QixDQUFBO0FBQ2hELE9BQU8sS0FBSyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDbkQsT0FBTywwQkFBMEIsTUFBTSw2Q0FBNkMsQ0FBQTtBQUNwRixPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1QyxPQUFPLE9BQU8sTUFBTSxxQkFBcUIsQ0FBQTtBQUN6QyxPQUFPLEtBQUssU0FBUyxNQUFNLHVCQUF1QixDQUFBO0FBQ2xELE9BQU8sYUFBYSxNQUFNLDRCQUE0QixDQUFBO0FBQ3RELE9BQU8sS0FBSyxhQUFhLE1BQU0sNEJBQTRCLENBQUE7QUFDM0QsT0FBTyxNQUFNLE1BQU0sb0JBQW9CLENBQUE7QUFDdkMsT0FBTyxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFFNUMsTUFBTSxVQUFVLElBQUksQ0FBRSxNQUFjO0lBQ2xDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFbEIsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0lBRXhDLFVBQVU7SUFDVixRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRXJCLGdCQUFnQjtJQUNoQixRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRTNCLGtCQUFrQjtJQUNsQixRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRXZCLGlDQUFpQztJQUNqQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRXJCLHFCQUFxQjtJQUNyQixRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRTNCLDhCQUE4QjtJQUM5QixLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsRUFBRTtRQUM1QixNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUUvQyxTQUFTLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUM3QixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUE7S0FDM0M7SUFFRCxhQUFhO0lBQ2IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUV4QixTQUFTO0lBQ1QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUVwQixvQ0FBb0M7SUFDcEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLEVBQUU7UUFDekMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUN2QjtJQUVELE9BQU8sUUFBUSxDQUFBO0FBQ2pCLENBQUM7QUFFRCxvQ0FBb0M7QUFDcEMsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFBO0FBRWxELGVBQWUsUUFBUSxDQUFBO0FBQ3ZCLE9BQU8sRUFDTCxRQUFRLEVBQ1IsT0FBTyxFQUNQLFVBQVUsRUFDViwwQkFBMEIsRUFDMUIsT0FBTyxFQUNQLGFBQWEsSUFBSSxTQUFTLEVBQzFCLGFBQWEsRUFDYixNQUFNLEdBQ1AsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFjdGlvbnMgZnJvbSAnQGludGVyYWN0anMvYWN0aW9ucydcbmltcG9ydCBhdXRvU2Nyb2xsIGZyb20gJ0BpbnRlcmFjdGpzL2F1dG8tc2Nyb2xsJ1xuaW1wb3J0ICogYXMgYXV0b1N0YXJ0IGZyb20gJ0BpbnRlcmFjdGpzL2F1dG8tc3RhcnQnXG5pbXBvcnQgaW50ZXJhY3RhYmxlUHJldmVudERlZmF1bHQgZnJvbSAnQGludGVyYWN0anMvY29yZS9pbnRlcmFjdGFibGVQcmV2ZW50RGVmYXVsdCdcbmltcG9ydCBkZXZUb29scyBmcm9tICdAaW50ZXJhY3Rqcy9kZXYtdG9vbHMnXG5pbXBvcnQgaW5lcnRpYSBmcm9tICdAaW50ZXJhY3Rqcy9pbmVydGlhJ1xuaW1wb3J0ICogYXMgbW9kaWZpZXJzIGZyb20gJ0BpbnRlcmFjdGpzL21vZGlmaWVycydcbmltcG9ydCBtb2RpZmllcnNCYXNlIGZyb20gJ0BpbnRlcmFjdGpzL21vZGlmaWVycy9iYXNlJ1xuaW1wb3J0ICogYXMgcG9pbnRlckV2ZW50cyBmcm9tICdAaW50ZXJhY3Rqcy9wb2ludGVyLWV2ZW50cydcbmltcG9ydCByZWZsb3cgZnJvbSAnQGludGVyYWN0anMvcmVmbG93J1xuaW1wb3J0IGludGVyYWN0LCB7IHNjb3BlIH0gZnJvbSAnLi9pbnRlcmFjdCdcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQgKHdpbmRvdzogV2luZG93KSB7XG4gIHNjb3BlLmluaXQod2luZG93KVxuXG4gIGludGVyYWN0LnVzZShpbnRlcmFjdGFibGVQcmV2ZW50RGVmYXVsdClcblxuICAvLyBpbmVydGlhXG4gIGludGVyYWN0LnVzZShpbmVydGlhKVxuXG4gIC8vIHBvaW50ZXJFdmVudHNcbiAgaW50ZXJhY3QudXNlKHBvaW50ZXJFdmVudHMpXG5cbiAgLy8gYXV0b1N0YXJ0LCBob2xkXG4gIGludGVyYWN0LnVzZShhdXRvU3RhcnQpXG5cbiAgLy8gZHJhZyBhbmQgZHJvcCwgcmVzaXplLCBnZXN0dXJlXG4gIGludGVyYWN0LnVzZShhY3Rpb25zKVxuXG4gIC8vIHNuYXAsIHJlc2l6ZSwgZXRjLlxuICBpbnRlcmFjdC51c2UobW9kaWZpZXJzQmFzZSlcblxuICAvLyBmb3IgYmFja3dyYWRzIGNvbXBhdGliaWxpdHlcbiAgZm9yIChjb25zdCB0eXBlIGluIG1vZGlmaWVycykge1xuICAgIGNvbnN0IHsgX2RlZmF1bHRzLCBfbWV0aG9kcyB9ID0gbW9kaWZpZXJzW3R5cGVdXG5cbiAgICBfZGVmYXVsdHMuX21ldGhvZHMgPSBfbWV0aG9kc1xuICAgIHNjb3BlLmRlZmF1bHRzLnBlckFjdGlvblt0eXBlXSA9IF9kZWZhdWx0c1xuICB9XG5cbiAgLy8gYXV0b1Njcm9sbFxuICBpbnRlcmFjdC51c2UoYXV0b1Njcm9sbClcblxuICAvLyByZWZsb3dcbiAgaW50ZXJhY3QudXNlKHJlZmxvdylcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBpbnRlcmFjdC51c2UoZGV2VG9vbHMpXG4gIH1cblxuICByZXR1cm4gaW50ZXJhY3Rcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5pbnRlcmFjdC52ZXJzaW9uID0gcHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvblxuXG5leHBvcnQgZGVmYXVsdCBpbnRlcmFjdFxuZXhwb3J0IHtcbiAgaW50ZXJhY3QsXG4gIGFjdGlvbnMsXG4gIGF1dG9TY3JvbGwsXG4gIGludGVyYWN0YWJsZVByZXZlbnREZWZhdWx0LFxuICBpbmVydGlhLFxuICBtb2RpZmllcnNCYXNlIGFzIG1vZGlmaWVycyxcbiAgcG9pbnRlckV2ZW50cyxcbiAgcmVmbG93LFxufVxuIl19