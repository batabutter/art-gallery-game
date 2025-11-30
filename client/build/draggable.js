export function makeDraggable(gameObject, enableLogs) {
    if (enableLogs === void 0) { enableLogs = false; }
    function log(message) {
        if (enableLogs)
            console.debug(message);
    }
    gameObject.setInteractive({ draggable: true });
    gameObject.on('drag', function (pointer) {
        gameObject.setPosition(pointer.x, pointer.y);
    });
}
