class AudioContextMock {
	state: string;
	constructor() {
		this.state = "running";
	}
	suspend() {
		this.state = "suspended";
	}
	resume() {
		this.state = "running";
	}
	close() {
		this.state = "closed";
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
(global as any).AudioContext = AudioContextMock;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
(global as any).webkitAudioContext = AudioContextMock;
