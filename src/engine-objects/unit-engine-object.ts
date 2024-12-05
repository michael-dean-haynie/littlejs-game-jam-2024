import {
	EngineObject,
	drawRect,
	drawText,
	drawTile,
	randColor,
	rgb,
	tile,
	vec2,
} from "littlejsengine";
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

	render(): void {
		// unit
		drawTile(this.pos, this.size, undefined, this.color);
		// drawTile(this.pos, this.size, tile(1, vec2(32, 16)));

		// unit type name
		drawText(this.unitActor.unitType.name, this.pos, 0.3, rgb(0, 0, 0, 1));

		// health bar
		const hpDec = this.unitActor.hitpoints / this.unitActor.unitType.hitpoints; // 0-1 (decimal percentage)
		const verticalOffset = this.size.y / 2 + 0.5;
		const barHeight = 0.125;

		// remaining
		drawRect(
			this.pos.add(vec2(-0.5 + hpDec / 2, verticalOffset)),
			vec2(hpDec, barHeight),
			rgb(1, 0, 0, 1), // red
		);
		// missing
		drawRect(
			this.pos.add(vec2(0.5 - (1 - hpDec) / 2, verticalOffset)),
			vec2(1 - hpDec, barHeight),
			rgb(1, 1, 1, 1), // white
		);
	}
}
