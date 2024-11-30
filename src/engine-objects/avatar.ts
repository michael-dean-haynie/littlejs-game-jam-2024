import { EngineObject, vec2 } from "littlejsengine";
import { MovementHelper } from "../helpers/movement";

export class Avatar extends EngineObject {
	constructor(...args: ConstructorParameters<typeof EngineObject>) {
		super(...args);
		this.setCollision();

		this.movementHelper = new MovementHelper();
		this.moveSpeed = 0.2;
	}

	private movementHelper: MovementHelper;
	private moveSpeed: number;

	update(): void {
		this.movementHelper.update();
		if (this.movementHelper.currentDirection === "up") {
			this.velocity = vec2(0, this.moveSpeed);
		}
		if (this.movementHelper.currentDirection === "left") {
			this.velocity = vec2(this.moveSpeed * -1, 0);
		}
		if (this.movementHelper.currentDirection === "down") {
			this.velocity = vec2(0, this.moveSpeed * -1);
		}
		if (this.movementHelper.currentDirection === "right") {
			this.velocity = vec2(this.moveSpeed, 0);
		}
		if (this.movementHelper.currentDirection === "none") {
			this.velocity = vec2(0, 0);
		}

		super.update();
	}
}
