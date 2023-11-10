const BufferedImage = Java.type("java.awt.image.BufferedImage")

import RoomRenderer from "./RoomRenderer"
import DoorRenderer from "./DoorRenderer"
import renderLibs from "../../../guimanager/renderLibs"
import DungeonMap from "../../Components/DungeonMap"
import RenderContext from "./../RenderContext"
import MapTab from "../MapTab"

class DungeonRenderer extends MapTab {
    constructor(mapRenderer) {
        super("Dungeon", mapRenderer)

        this.roomRenderer = new RoomRenderer();
        this.doorRenderer = new DoorRenderer();
    }

    /**
     * 
     * @param {DungeonMap} dungeon 
     * @param {RenderContext} renderContext 
     * @returns 
     */
    createMapImage(dungeon, renderContext) {
        let image = new BufferedImage(renderContext.getImageSize(dungeon.floor), renderContext.getImageSize(dungeon.floor), BufferedImage.TYPE_INT_ARGB);

        let graphics = image.createGraphics();

        // Shift border + padding so less math involved
        graphics.translate(renderContext.paddingLeft + renderContext.borderWidth, renderContext.paddingTop + renderContext.borderWidth);


        // Render all doors
        // Rendering before rooms that way rooms cover it as there is 1 specific situation where early dungeon will put a room in the middle of an L shape
        for (let door of dungeon.doors.values()) {
            this.doorRenderer.drawDoor(renderContext, graphics, door);
        }
        // Render all rooms and draw checkmarks
        for (let room of dungeon.roomsArr) {
            this.roomRenderer.drawRoom(renderContext, graphics, room);
            this.roomRenderer.drawCheckmark(renderContext, graphics, room);
        }

        graphics.dispose();
        return image;
    }

    /**
     * @param {RenderContext} renderContext 
     * @param {DungeonMap} dungeonMap 
     * @param {Number} mouseX
     * @param {Number} mouseY
     */
    draw(renderContext, dungeonMap, mouseX, mouseY) {
        if (!renderContext) return

        if (renderContext.image) {
            let { x, y, size } = renderContext.getMapDimensions()

            renderLibs.scizzor(x + renderContext.borderWidth, y + renderContext.borderWidth, size - 2 * renderContext.borderWidth, size - renderContext.borderWidth)

            // Map image rotation

            if (renderContext.settings.spinnyMap) {
                if (renderContext.settings.centerSpin) {

                    let x1 = (Player.getX() + 200) / 32 - 3
                    let y1 = (Player.getZ() + 200) / 32 - 3
                    //ChatLib.chat(`${x1}`)

                    // Normalize to be out of 1
                    x1 = (renderContext.blockSize * x1) / renderContext.getImageSize(dungeonMap.floor)
                    y1 = (renderContext.blockSize * y1) / renderContext.getImageSize(dungeonMap.floor)

                    // Multiply by size 
                    x1 = x1 * renderContext.size
                    y1 = y1 * renderContext.size

                    x += -x1
                    y += -y1

                }
                Renderer.translate((renderContext.settings.posX + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2), (renderContext.settings.posY + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2));
                Renderer.scale(renderContext.settings.dungScale / 100, renderContext.settings.dungScale / 100)
                Renderer.rotate(-(Player.getYaw() + 180))
                Renderer.translate(-(renderContext.settings.posX + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2), -(renderContext.settings.posY + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2));
                //Renderer.scale(renderContext.settings.dungScale/100, renderContext.settings.dungScale/100)


                //renderContext.image.draw(x + renderContext.borderWidth, y + renderContext.borderWidth, size, size - renderContext.borderWidth)
            } else {
                Renderer.translate((renderContext.settings.posX + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2), (renderContext.settings.posY + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2));
                Renderer.scale(renderContext.settings.dungScale / 100, renderContext.settings.dungScale / 100)
                Renderer.translate(-(renderContext.settings.posX + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2), -(renderContext.settings.posY + renderContext.paddingLeft + renderContext.borderWidth + renderContext.settings.size / 2));
                
            }
            // Move sizzor to now inclue all the map
            //Renderer.scale(renderContext.settings.dungScale/100, renderContext.settings.dungScale/100)

            renderContext.image.draw(x + renderContext.borderWidth, y + renderContext.borderWidth, size, size - renderContext.borderWidth)

            for (let room of dungeonMap.roomsArr) {
                //those arent exclusive, each checks their own conditions
                this.roomRenderer.drawPuzzle(renderContext, room, dungeonMap)
                this.roomRenderer.drawExtras(renderContext, room, dungeonMap)
            }

            // Render heads
            //renderLibs.scizzor(x + renderContext.borderWidth, y + renderContext.borderWidth, size - 2 * renderContext.borderWidth, size - renderContext.borderWidth)
            for (let player of dungeonMap.players) {
                if (dungeonMap.deadPlayers.has(player.username.toLowerCase())) continue

                if (renderContext.settings.spinnyMap) {
                    let { x, y, size } = renderContext.getMapDimensions()
                    let [x2, y2] = player.getRenderLocation(renderContext, dungeonMap)
                    renderX = x2
                    renderY = y2
                    player.drawIcon(renderContext, dungeonMap)
                } else {
                    player.drawIcon(renderContext, dungeonMap)
                }
            }
            renderLibs.stopScizzor()
        }

        if (!renderContext.image
            || (renderContext.imageLastUpdate < dungeonMap.lastChanged)) {
            // Create image if not cached or cache outdated
            if (renderContext.image) renderContext.image.destroy()
            renderContext.image = new Image(this.createMapImage(dungeonMap, renderContext));

            renderContext.imageLastUpdate = Date.now()
        }

        dungeonMap.drawRoomTooltip(renderContext, mouseX, mouseY)
    }

}

export default DungeonRenderer