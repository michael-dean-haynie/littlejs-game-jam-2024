import { EngineObject } from "littlejsengine";
import type { PathingAwareEngineObject } from "./pathing-aware-engine-object";
import { UnitEngineObject } from "./unit-engine-object";

export class ObstacleEngineObject
	extends EngineObject
	implements PathingAwareEngineObject
{
	constructor(...params: ConstructorParameters<typeof EngineObject>) {
		super(...params);
		this.setCollision(); // turn collision on
		this.mass = 0; // make static
	}

	// nothing should be able to path through this
	isPathable(unit: UnitEngineObject): boolean {
		return false;
	}

	// do colide with all units
	collideWithObject(object: EngineObject): boolean {
		if (object instanceof UnitEngineObject) {
			return !this.isPathable(object);
		}
		return true;
	}
}
