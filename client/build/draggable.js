export function makeDraggable(gameObject, enableLogs) {
    if (enableLogs === void 0) { enableLogs = false; }
    function log(message) {
        if (enableLogs)
            console.debug(message);
    }
    function startDrag() {
        log("[makeDraggable:startDrag] invoked for game object: ".concat(gameObject.name));
    }
    gameObject.setInteractive();
    gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag);
}
