import { EngineObject, rgb } from "littlejsengine";

export class Target extends EngineObject {
	constructor(...args: ConstructorParameters<typeof EngineObject>) {
		super(...args);
		this.color = rgb(0.5, 1, 0.5, 1);
	}
}
