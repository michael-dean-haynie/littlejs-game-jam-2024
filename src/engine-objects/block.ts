import { EngineObject, rgb } from "littlejsengine";

export class Block extends EngineObject {
	constructor(...args: ConstructorParameters<typeof EngineObject>) {
		super(...args);
		this.color = rgb();
		this.setCollision();
		this.damping = 0.95;
	}
}
