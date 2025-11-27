
export function makeDraggable(gameObject: Phaser.GameObjects.Arc, enableLogs = false) {

    function log(message) {
        if (enableLogs)
            console.debug(message);
    }

    function startDrag() {
        log(`[makeDraggable:startDrag] invoked for game object: ${gameObject.name}`);

    }

    gameObject.setInteractive();

    gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag);

}