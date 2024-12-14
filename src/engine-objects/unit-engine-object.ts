import {
	Color,
	EngineObject,
	type Vector2,
	drawRect,
	drawText,
	drawTile,
	rgb,
	vec2,
} from "littlejsengine";
import type { ActorDirectory } from "../actors/actor-directory";
import type { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import { ImpactUnitMessage } from "../messages/impact-unit-message";
import type { MessageBroker } from "../messages/message-broker";
import { UnitTypes } from "../units/unit";

export class UnitEngineObject extends EngineObject {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _messageBroker: MessageBroker,
		public readonly unitActor: UnitActor,
		...params: ConstructorParameters<typeof EngineObject>
	) {
		super(...params);
		this.setCollision(); // turn collision on
		this._barHeight = 0.125;
	}

	/** the height of unit bars (in world units) */
	private readonly _barHeight: number;

	collideWithObject(object: EngineObject): boolean {
		// make sure enemies impct eachother
		if (
			object instanceof UnitEngineObject &&
			object.unitActor.unitType !== UnitTypes.prey &&
			this.unitActor.unitType !== UnitTypes.prey
		) {
			if (object.unitActor.flags.impacted) {
				this._messageBroker.publishMessage(
					new ImpactUnitMessage(
						0, // just need to flag as impacted
						this.pos,
					),
					{ actorIds: [this.unitActor.actorId] },
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
		this.renderHealthBar();

		// weapon bars
		if (this.unitActor.unitType === UnitTypes.prey) {
			if (this.unitActor.equippedWeaponActorId) {
				const weaponActor = this._actorDirectory.getActor(
					this.unitActor.equippedWeaponActorId,
					WeaponActor,
				);
				if (
					weaponActor &&
					weaponActor.weaponType.clipSize !== Number.POSITIVE_INFINITY
				) {
					if (weaponActor.flags.reloading) {
						this.renderReloadingBar();
					} else {
						this.renderAmmoBar();
					}
				}
			}
		}
	}

	private renderHealthBar(): void {
		this.renderContinuousUnitBar({
			pos: this.getBarPosition(0),
			width: this.size.x,
			height: this._barHeight,
			segments: [
				{
					color: new Color().setHex("#cb4335"),
					value: this.unitActor.hitpoints, // remaining
				},
				{
					color: new Color().setHex("#424949"),
					value: this.unitActor.unitType.hitpoints - this.unitActor.hitpoints, // missing
				},
			],
		});
	}

	private renderAmmoBar(): void {
		if (this.unitActor.equippedWeaponActorId) {
			const weaponActor = this._actorDirectory.getActor(
				this.unitActor.equippedWeaponActorId,
				WeaponActor,
			);
			if (weaponActor) {
				this.renderDiscreteUnitBar({
					pos: this.getBarPosition(1),
					width: this.size.x,
					height: this._barHeight,
					segments: [
						{
							color: new Color().setHex("#e5e7e9"),
							value: weaponActor.loadedRounds, // remaining
						},
						{
							color: new Color().setHex("#424949"),
							value: weaponActor.weaponType.clipSize - weaponActor.loadedRounds, // missing
						},
					],
				});
			}
		}
	}

	private renderReloadingBar(): void {
		if (this.unitActor.equippedWeaponActorId) {
			const weaponActor = this._actorDirectory.getActor(
				this.unitActor.equippedWeaponActorId,
				WeaponActor,
			);
			if (weaponActor) {
				this.renderContinuousUnitBar({
					pos: this.getBarPosition(1),
					width: this.size.x,
					height: this._barHeight,
					segments: [
						{
							color: new Color().setHex("#e5e7e9"),
							value: weaponActor.reloadProgress, // time passed
						},
						{
							color: new Color().setHex("#424949"),
							value: weaponActor.reloadRemaining, // time remaining
						},
					],
				});
			}
		}
	}

	/** calculate the position of a bar based on the bar slot */
	private getBarPosition(slot: number) {
		const topOfUnitOffset = this.size.y / 2;
		const slotOffset = this._barHeight * 1.5 * slot;
		return vec2(this.unitActor.pos).add(
			vec2(0, topOfUnitOffset + this._barHeight + slotOffset),
		);
	}

	private renderContinuousUnitBar({
		pos,
		width,
		height,
		segments,
	}: UnitBarParams) {
		const totalValue = segments
			.map((seg) => seg.value)
			.reduce((a, b) => a + b, 0);
		const barStartPos = pos.subtract(vec2(width / 2, 0));

		let runningSegmentWidthSum = 0;
		for (const segment of segments) {
			const segmentWidth = (segment.value / totalValue) * width;
			const segmentStartPos = barStartPos.add(vec2(runningSegmentWidthSum, 0));
			const segmentPos = segmentStartPos.add(vec2(segmentWidth / 2, 0));
			const segmentSize = vec2(segmentWidth, height);

			// render
			drawRect(segmentPos, segmentSize, segment.color);

			// update for next loop iteration
			runningSegmentWidthSum += segmentWidth;
		}
	}

	private renderDiscreteUnitBar({
		pos,
		width,
		height,
		segments,
	}: UnitBarParams) {
		let totalValue = 0;
		for (const segment of segments) {
			if (segment.value % 1 > 0) {
				throw new Error("discrete unit bar expects whole number values");
			}
			totalValue += segment.value;
		}

		const barStartPos = pos.subtract(vec2(width / 2, 0));
		const gapWidth = 0.05; // gap between blocks (in world units)
		const gapCount = totalValue - 1; // number of gaps that will be used
		const blockCount = totalValue; // number of blocks that will be used
		const blockWidth = (width - gapCount * gapWidth) / blockCount; // the width of each block (in world units)
		const blockSize = vec2(blockWidth, height);

		let runningSegmentStartOffset = 0;
		for (const segment of segments) {
			const segmentWidth = (segment.value / totalValue) * width;
			const segmentStartPos = barStartPos.add(
				vec2(runningSegmentStartOffset, 0),
			);
			const segmentPos = segmentStartPos.add(vec2(segmentWidth / 2, 0));
			const segmentSize = vec2(segmentWidth, height);

			let runningBlockStartOffset = runningSegmentStartOffset;
			for (let block = 0; block < segment.value; block++) {
				if (runningBlockStartOffset > 0) {
					runningBlockStartOffset += gapWidth; // add gap
				}
				const blockStartPos = barStartPos.add(vec2(runningBlockStartOffset, 0));
				const blockPos = blockStartPos.add(vec2(blockWidth / 2, 0));

				// render
				drawRect(blockPos, blockSize, segment.color);

				// update for next bar iteration
				runningBlockStartOffset += blockWidth;
			}

			// update for next segment iteration
			runningSegmentStartOffset += segmentWidth;
		}
	}
}

export interface UnitBarParams {
	/** the position of the unit bar (in the world space) */
	pos: Vector2;
	/** the rendered width of the unit bar (in world units) */
	width: number;
	/** the rendered height of the unit bar (in world units) */
	height: number;
	/** the segments that together make up the whole bar */
	segments: UnitBarSegment[];
}

// export interface DiscreteUnitBarParams extends ContinuousUnitBarParams {
// 	// the rendered width of each gap between discrete block (in world units)
// 	gapWidth: number;
// }

export type UnitBarSegment = {
	/** the value displayed by this segment */
	value: number;
	/** the color this segment will be displayed as */
	color: Color;
};
