import interact from 'interactjs';
// Interactables
interact(document.body);
interact(document);
interact(window);
interact('.drag-and-resize')
    .draggable({
    modifiers: [{
            type: 'snap',
            targets: [
                { x: 100, y: 200 },
                function (x, y) { return { x: x % 20, y }; },
            ],
        }],
})
    .resizable({
    inertia: true,
});
// Selector context
const myList = document.querySelector('#my-list');
interact('li', {
    context: myList,
})
    .draggable({ /* ... */});
// Action options
const target = 'li';
interact(target)
    .draggable({
    max: 1,
    maxPerElement: 2,
    manualStart: true,
    modifiers: [],
    inertia: { /* ... */},
    autoScroll: { /* ... */},
    lockAxis: 'x' || 'y' || 'start',
    startAxis: 'x' || 'y',
})
    .resizable({
    max: 1,
    maxPerElement: 2,
    manualStart: true,
    modifiers: [],
    inertia: { /* ... */},
    autoScroll: { /* ... */},
    margin: 50,
    square: true || false,
    axis: 'x' || 'y',
})
    .gesturable({
    max: 1,
    maxPerElement: 2,
    manualStart: true,
    modifiers: [],
});
// autoscroll
const element = 'li';
interact(element)
    .draggable({
    autoScroll: true,
})
    .resizable({
    autoScroll: {
        container: document.body,
        margin: 50,
        distance: 5,
        interval: 10,
    },
});
// axis
interact(target).draggable({
    axis: 'x',
});
interact(target).resizable({
    axis: 'x',
});
const handleEl = 'li';
interact(target).resizable({
    edges: {
        top: true,
        left: false,
        bottom: '.resize-s',
        right: handleEl,
    },
});
// resize invert
interact(target).resizable({
    edges: { bottom: true, right: true },
    invert: 'reposition',
});
// resize square
interact(target).resizable({
    squareResize: true,
});
// dropzone  accept
interact(target).dropzone({
    accept: '.drag0, .drag1',
});
// dropzone overlap
interact(target).dropzone({
    overlap: 0.25,
});
// dropzone checker
interact(target).dropzone({
    checker(_dragEvent, // related dragmove or dragend
    _event, // Touch, Pointer or Mouse Event
    dropped, // bool default checker result
    _dropzone, // dropzone Interactable
    dropElement, // dropzone elemnt
    _draggable, // draggable Interactable
    _draggableElement) {
        // only allow drops into empty dropzone elements
        return dropped && !dropElement.hasChildNodes();
    },
});
interact.dynamicDrop();
interact.dynamicDrop(false);
// Events
function listener(event) {
    const { type, pageX, pageY } = event;
    alert({ type, pageX, pageY });
}
interact(target)
    .on('dragstart', listener)
    .on('dragmove dragend', listener)
    .on(['resizemove', 'resizeend'], listener)
    .on({
    gesturestart: listener,
    gestureend: listener,
});
interact.on('resize', (event) => {
    const { rect, deltaRect } = event;
    alert(JSON.stringify({ rect, deltaRect }));
});
interact(target).resizable({
    listeners: [
        { start: listener, move: listener },
    ],
});
interact(target).draggable({
    listeners: { start: listener, end: listener },
});
interact(target).draggable({
    onstart: listener,
    onmove: listener,
    onend: listener,
});
interact.on(['dragmove', 'resizestart'], listener);
const dropTarget = 'div';
// Drop Events
interact(dropTarget)
    .dropzone({
    ondrop(event) {
        alert(event.relatedTarget.id +
            ' was dropped into ' +
            event.target.id);
    },
})
    .on('dropactivate', (event) => {
    event.target.classList.add('drop-activated');
});
interact(target).on('up', (_event) => { });
// fast click
interact('a[href]').on('tap', (event) => {
    window.location.href = event.currentTarget.href;
    event.preventDefault();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Rqcy10ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW50ZXJhY3Rqcy10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUVqQyxnQkFBZ0I7QUFDaEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN2QixRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDbEIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRWhCLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQztLQUN6QixTQUFTLENBQUM7SUFDVCxTQUFTLEVBQUUsQ0FBQztZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFO2dCQUNQLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFO2dCQUNsQixVQUFVLENBQVMsRUFBRSxDQUFTLElBQUksT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFBLENBQUMsQ0FBQzthQUM1RDtTQUNGLENBQUM7Q0FDSCxDQUFDO0tBQ0QsU0FBUyxDQUFDO0lBQ1QsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDLENBQUE7QUFFSixtQkFBbUI7QUFDbkIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUVqRCxRQUFRLENBQUMsSUFBSSxFQUFFO0lBQ2IsT0FBTyxFQUFFLE1BQU07Q0FDaEIsQ0FBQztLQUNDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBRSxDQUFDLENBQUE7QUFFM0IsaUJBQWlCO0FBQ2pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNuQixRQUFRLENBQUMsTUFBTSxDQUFDO0tBQ2IsU0FBUyxDQUFDO0lBQ1QsR0FBRyxFQUFZLENBQUM7SUFDaEIsYUFBYSxFQUFFLENBQUM7SUFDaEIsV0FBVyxFQUFJLElBQUk7SUFDbkIs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QUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGludGVyYWN0IGZyb20gJ2ludGVyYWN0anMnXG5cbi8vIEludGVyYWN0YWJsZXNcbmludGVyYWN0KGRvY3VtZW50LmJvZHkpXG5pbnRlcmFjdChkb2N1bWVudClcbmludGVyYWN0KHdpbmRvdylcblxuaW50ZXJhY3QoJy5kcmFnLWFuZC1yZXNpemUnKVxuICAuZHJhZ2dhYmxlKHtcbiAgICBtb2RpZmllcnM6IFt7XG4gICAgICB0eXBlOiAnc25hcCcsXG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgIHsgeDogMTAwLCB5OiAyMDAgfSxcbiAgICAgICAgZnVuY3Rpb24gKHg6IG51bWJlciwgeTogbnVtYmVyKSB7IHJldHVybiB7IHg6IHggJSAyMCwgeSB9IH0sXG4gICAgICBdLFxuICAgIH1dLFxuICB9KVxuICAucmVzaXphYmxlKHtcbiAgICBpbmVydGlhOiB0cnVlLFxuICB9KVxuXG4vLyBTZWxlY3RvciBjb250ZXh0XG5jb25zdCBteUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXktbGlzdCcpXG5cbmludGVyYWN0KCdsaScsIHtcbiAgY29udGV4dDogbXlMaXN0LFxufSlcbiAgLmRyYWdnYWJsZSh7IC8qIC4uLiAqLyB9KVxuXG4vLyBBY3Rpb24gb3B0aW9uc1xuY29uc3QgdGFyZ2V0ID0gJ2xpJ1xuaW50ZXJhY3QodGFyZ2V0KVxuICAuZHJhZ2dhYmxlKHtcbiAgICBtYXggICAgICAgICAgOiAxLFxuICAgIG1heFBlckVsZW1lbnQ6IDIsXG4gICAgbWFudWFsU3RhcnQgIDogdHJ1ZSxcbiAgICBtb2RpZmllcnMgICAgOiBbXSxcbiAgICBpbmVydGlhICAgICAgOiB7LyogLi4uICovfSxcbiAgICBhdXRvU2Nyb2xsICAgOiB7LyogLi4uICovfSxcblxuICAgIGxvY2tBeGlzICAgICA6ICd4JyB8fCAneScgfHwgJ3N0YXJ0JyxcbiAgICBzdGFydEF4aXMgICAgOiAneCcgfHwgJ3knLFxuICB9KVxuICAucmVzaXphYmxlKHtcbiAgICBtYXggICAgICAgICAgOiAxLFxuICAgIG1heFBlckVsZW1lbnQ6IDIsXG4gICAgbWFudWFsU3RhcnQgIDogdHJ1ZSxcbiAgICBtb2RpZmllcnMgICAgOiBbXSxcbiAgICBpbmVydGlhICAgICAgOiB7LyogLi4uICovfSxcbiAgICBhdXRvU2Nyb2xsICAgOiB7LyogLi4uICovfSxcbiAgICBtYXJnaW4gICAgICAgOiA1MCxcblxuICAgIHNxdWFyZSAgICAgICA6IHRydWUgfHwgZmFsc2UsXG4gICAgYXhpcyAgICAgICAgIDogJ3gnIHx8ICd5JyxcbiAgfSlcbiAgLmdlc3R1cmFibGUoe1xuICAgIG1heCAgICAgICAgICA6IDEsXG4gICAgbWF4UGVyRWxlbWVudDogMixcbiAgICBtYW51YWxTdGFydCAgOiB0cnVlLFxuICAgIG1vZGlmaWVycyAgICA6IFtdLFxuICB9KVxuXG4vLyBhdXRvc2Nyb2xsXG5jb25zdCBlbGVtZW50ID0gJ2xpJ1xuaW50ZXJhY3QoZWxlbWVudClcbiAgLmRyYWdnYWJsZSh7XG4gICAgYXV0b1Njcm9sbDogdHJ1ZSxcbiAgfSlcbiAgLnJlc2l6YWJsZSh7XG4gICAgYXV0b1Njcm9sbDoge1xuICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5ib2R5LFxuICAgICAgbWFyZ2luOiA1MCxcbiAgICAgIGRpc3RhbmNlOiA1LFxuICAgICAgaW50ZXJ2YWw6IDEwLFxuICAgIH0sXG4gIH0pXG5cbi8vIGF4aXNcbmludGVyYWN0KHRhcmdldCkuZHJhZ2dhYmxlKHtcbiAgYXhpczogJ3gnLFxufSlcblxuaW50ZXJhY3QodGFyZ2V0KS5yZXNpemFibGUoe1xuICBheGlzOiAneCcsXG59KVxuXG5jb25zdCBoYW5kbGVFbCA9ICdsaSdcbmludGVyYWN0KHRhcmdldCkucmVzaXphYmxlKHtcbiAgZWRnZXM6IHtcbiAgICB0b3AgICA6IHRydWUsICAgICAgIC8vIFVzZSBwb2ludGVyIGNvb3JkcyB0byBjaGVjayBmb3IgcmVzaXplLlxuICAgIGxlZnQgIDogZmFsc2UsICAgICAgLy8gRGlzYWJsZSByZXNpemluZyBmcm9tIGxlZnQgZWRnZS5cbiAgICBib3R0b206ICcucmVzaXplLXMnLCAvLyBSZXNpemUgaWYgcG9pbnRlciB0YXJnZXQgbWF0Y2hlcyBzZWxlY3RvclxuICAgIHJpZ2h0IDogaGFuZGxlRWwsICAgIC8vIFJlc2l6ZSBpZiBwb2ludGVyIHRhcmdldCBpcyB0aGUgZ2l2ZW4gRWxlbWVudFxuICB9LFxufSlcblxuLy8gcmVzaXplIGludmVydFxuaW50ZXJhY3QodGFyZ2V0KS5yZXNpemFibGUoe1xuICBlZGdlczogeyBib3R0b206IHRydWUsIHJpZ2h0OiB0cnVlIH0sXG4gIGludmVydDogJ3JlcG9zaXRpb24nLFxufSlcblxuLy8gcmVzaXplIHNxdWFyZVxuaW50ZXJhY3QodGFyZ2V0KS5yZXNpemFibGUoe1xuICBzcXVhcmVSZXNpemU6IHRydWUsXG59KVxuXG4vLyBkcm9wem9uZSAgYWNjZXB0XG5pbnRlcmFjdCh0YXJnZXQpLmRyb3B6b25lKHtcbiAgYWNjZXB0OiAnLmRyYWcwLCAuZHJhZzEnLFxufSlcblxuLy8gZHJvcHpvbmUgb3ZlcmxhcFxuaW50ZXJhY3QodGFyZ2V0KS5kcm9wem9uZSh7XG4gIG92ZXJsYXA6IDAuMjUsXG59KVxuXG4vLyBkcm9wem9uZSBjaGVja2VyXG5pbnRlcmFjdCh0YXJnZXQpLmRyb3B6b25lKHtcbiAgY2hlY2tlciAoXG4gICAgX2RyYWdFdmVudDogRWxlbWVudCwgICAgICAgICAgLy8gcmVsYXRlZCBkcmFnbW92ZSBvciBkcmFnZW5kXG4gICAgX2V2ZW50OiBFdmVudCwgICAgICAgICAgICAgICAgLy8gVG91Y2gsIFBvaW50ZXIgb3IgTW91c2UgRXZlbnRcbiAgICBkcm9wcGVkOiBib29sZWFuLCAgICAgICAgICAgICAvLyBib29sIGRlZmF1bHQgY2hlY2tlciByZXN1bHRcbiAgICBfZHJvcHpvbmU6IEludGVyYWN0LkludGVyYWN0YWJsZSwgICAgICAvLyBkcm9wem9uZSBJbnRlcmFjdGFibGVcbiAgICBkcm9wRWxlbWVudDogRWxlbWVudCwgICAgICAgICAvLyBkcm9wem9uZSBlbGVtbnRcbiAgICBfZHJhZ2dhYmxlOiBJbnRlcmFjdC5JbnRlcmFjdGFibGUsICAgICAvLyBkcmFnZ2FibGUgSW50ZXJhY3RhYmxlXG4gICAgX2RyYWdnYWJsZUVsZW1lbnQ6IEVsZW1lbnQpIHsgLy8gZHJhZ2dhYmxlIGVsZW1lbnRcbiAgICAvLyBvbmx5IGFsbG93IGRyb3BzIGludG8gZW1wdHkgZHJvcHpvbmUgZWxlbWVudHNcbiAgICByZXR1cm4gZHJvcHBlZCAmJiAhZHJvcEVsZW1lbnQuaGFzQ2hpbGROb2RlcygpXG4gIH0sXG59KVxuXG5pbnRlcmFjdC5keW5hbWljRHJvcCgpXG5pbnRlcmFjdC5keW5hbWljRHJvcChmYWxzZSlcblxuLy8gRXZlbnRzXG5mdW5jdGlvbiBsaXN0ZW5lciAoZXZlbnQpIHtcbiAgY29uc3QgeyB0eXBlLCBwYWdlWCwgcGFnZVkgfSA9IGV2ZW50XG4gIGFsZXJ0KHsgdHlwZSwgcGFnZVgsIHBhZ2VZIH0pXG59XG5cbmludGVyYWN0KHRhcmdldClcbiAgLm9uKCdkcmFnc3RhcnQnLCBsaXN0ZW5lcilcbiAgLm9uKCdkcmFnbW92ZSBkcmFnZW5kJywgbGlzdGVuZXIpXG4gIC5vbihbJ3Jlc2l6ZW1vdmUnLCAncmVzaXplZW5kJ10sIGxpc3RlbmVyKVxuICAub24oe1xuICAgIGdlc3R1cmVzdGFydDogbGlzdGVuZXIsXG4gICAgZ2VzdHVyZWVuZDogbGlzdGVuZXIsXG4gIH0pXG5cbmludGVyYWN0Lm9uKCdyZXNpemUnLCAoZXZlbnQ6IEludGVyYWN0LlJlc2l6ZUV2ZW50KSA9PiB7XG4gIGNvbnN0IHsgcmVjdCwgZGVsdGFSZWN0IH0gPSBldmVudFxuICBhbGVydChKU09OLnN0cmluZ2lmeSh7IHJlY3QsIGRlbHRhUmVjdCB9KSlcbn0pXG5cbmludGVyYWN0KHRhcmdldCkucmVzaXphYmxlKHtcbiAgbGlzdGVuZXJzOiBbXG4gICAgeyBzdGFydDogbGlzdGVuZXIsIG1vdmU6IGxpc3RlbmVyIH0sXG4gIF0sXG59KVxuXG5pbnRlcmFjdCh0YXJnZXQpLmRyYWdnYWJsZSh7XG4gIGxpc3RlbmVyczogeyBzdGFydDogbGlzdGVuZXIsIGVuZDogbGlzdGVuZXIgfSxcbn0pXG5cbmludGVyYWN0KHRhcmdldCkuZHJhZ2dhYmxlKHtcbiAgb25zdGFydDogbGlzdGVuZXIsXG4gIG9ubW92ZTogbGlzdGVuZXIsXG4gIG9uZW5kOiBsaXN0ZW5lcixcbn0pXG5cbmludGVyYWN0Lm9uKFsnZHJhZ21vdmUnLCAncmVzaXplc3RhcnQnXSwgbGlzdGVuZXIpXG5cbmNvbnN0IGRyb3BUYXJnZXQgPSAnZGl2J1xuLy8gRHJvcCBFdmVudHNcbmludGVyYWN0KGRyb3BUYXJnZXQpXG4gIC5kcm9wem9uZSh7XG4gICAgb25kcm9wIChldmVudCkge1xuICAgICAgYWxlcnQoZXZlbnQucmVsYXRlZFRhcmdldC5pZCArXG4gICAgICAgICAgICAnIHdhcyBkcm9wcGVkIGludG8gJyArXG4gICAgICAgICAgICBldmVudC50YXJnZXQuaWQpXG4gICAgfSxcbiAgfSlcbiAgLm9uKCdkcm9wYWN0aXZhdGUnLCAoZXZlbnQpID0+IHtcbiAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LmFkZCgnZHJvcC1hY3RpdmF0ZWQnKVxuICB9KVxuXG5pbnRlcmFjdCh0YXJnZXQpLm9uKCd1cCcsIChfZXZlbnQpID0+IHt9KVxuXG4vLyBmYXN0IGNsaWNrXG5pbnRlcmFjdCgnYVtocmVmXScpLm9uKCd0YXAnLCAoZXZlbnQpID0+IHtcbiAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBldmVudC5jdXJyZW50VGFyZ2V0LmhyZWZcblxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG59KVxuIl19