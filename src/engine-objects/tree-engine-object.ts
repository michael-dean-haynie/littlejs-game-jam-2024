import { Color } from "littlejsengine";
import { ObstacleEngineObject } from "./obstacle-engine-object";

export class TreeEngineObject extends ObstacleEngineObject {
	constructor(...params: ConstructorParameters<typeof ObstacleEngineObject>) {
		super(...params);
		this.color = new Color().setHex("#008000"); // green
	}
}
