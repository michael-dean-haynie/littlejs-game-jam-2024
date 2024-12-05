import { EngineObject } from "littlejsengine";
import type { UnitEngineObject } from "./unit-engine-object";

/** an engine object that might conditionally skip collisions */
export interface PathingAwareEngineObject extends EngineObject {
	isPathable(unit: UnitEngineObject): boolean;
}

export function IsPathingAwareEngineObject(
	obj: PathingAwareEngineObject,
): obj is PathingAwareEngineObject {
	if (obj instanceof EngineObject) {
		if (typeof obj.isPathable === "function") {
			return true;
		}
	}
	return false;
}
