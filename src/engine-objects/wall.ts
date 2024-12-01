import { EngineObject } from "littlejsengine";

export class Wall extends EngineObject {
	constructor(...args: ConstructorParameters<typeof EngineObject>) {
		super(...args);
		this.setCollision();
		this.mass = 0; // static
	}
}
