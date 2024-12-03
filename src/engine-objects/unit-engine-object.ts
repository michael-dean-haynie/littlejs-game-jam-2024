import { EngineObject, vec2 } from "littlejsengine";
import type { UnitActor } from "../actors/unit-actor";
import type { MessageBroker } from "../message-broker";
import { ImpactUnitMessage } from "../messages/impact-unit-message";
import { UnitTypes } from "../units/unit";

export class UnitEngineObject extends EngineObject {
	constructor(
		private readonly _messageBroker: MessageBroker,
		public readonly unitActor: UnitActor,
		...params: ConstructorParameters<typeof EngineObject>
	) {
		super(...params);
		this.setCollision(); // turn collision on
	}

	collideWithObject(object: EngineObject): boolean {
		// make sure enemies impct eachother
		if (
			object instanceof UnitEngineObject &&
			object.unitActor.unitType !== UnitTypes.prey
		) {
			if (object.unitActor.currentMovementType === "impact") {
				this._messageBroker.publish(
					new ImpactUnitMessage({
						force: vec2().scale(0), // just need to flag as impacted
						impactedUnitId: this.unitActor.unitId,
					}),
				);
			}
		}

		return true;
	}
}
