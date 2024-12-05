import { EngineObject } from "littlejsengine";
import { UnitTypes } from "../units/unit";
import type { PathingAwareEngineObject } from "./pathing-aware-engine-object";
import { UnitEngineObject } from "./unit-engine-object";

export class PlayerObstacleEngineObject
	extends EngineObject
	implements PathingAwareEngineObject
{
	constructor(...params: ConstructorParameters<typeof EngineObject>) {
		super(...params);
		this.setCollision(); // turn collision on
		this.mass = 0; // make static
	}

	// only the "prey" unit can't path through this. all the enemies can so they can come on from outside the edge of the map
	isPathable(unit: UnitEngineObject): boolean {
		return unit.unitActor.unitType !== UnitTypes.prey;
	}

	// do not colide with anything enemies
	collideWithObject(object: EngineObject): boolean {
		if (object instanceof UnitEngineObject) {
			return !this.isPathable(object);
		}
		return true;
	}
}
