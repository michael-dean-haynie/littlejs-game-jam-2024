import { EngineObject, vec2 } from "littlejsengine";
import type { PathingAwareEngineObject } from "./pathing-aware-engine-object";
import { UnitEngineObject } from "./unit-engine-object";

export class ObstacleEngineObject
	extends EngineObject
	implements PathingAwareEngineObject
{
	constructor(
		roundable: boolean,
		...params: ConstructorParameters<typeof EngineObject>
	) {
		super(...params);
		this.setCollision(); // turn collision on
		this.mass = 0; // make static
		if (roundable) {
			this.size = this.size.subtract(vec2(0.2)); // this so that units don't get caught on sharp corners while pathing
		}
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
