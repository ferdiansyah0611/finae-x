import { ProgramType } from '@/types.d.ts';

function createPrompt(program: ProgramType.Type) {
	async function main() {
		const value = prompt('>');
		if (value === 'exit') return;
		if (value) await program.exec(value);
		main();
	}
	main();
}

export { createPrompt };
