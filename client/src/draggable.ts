
export function makeDraggable(gameObject: Phaser.GameObjects.Arc, enableLogs = false) {

    function log(message: string) {
        if (enableLogs)
            console.debug(message);
    }

    gameObject.setInteractive( { draggable: true });
    gameObject.on('drag', (pointer) => {
        gameObject.setPosition(pointer.x, pointer.y)
    });
}