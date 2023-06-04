interface Params {
	source_keyfile?: string;
	dest_keyfile?: string;
	source_path: string;
	dest_path: string;
	concurrency?: number;
	filter?: string;
	verbose?: boolean;	
}

interface AnyProps {
	[key: string]: any;
}

interface Result {
	foo: string;
	bar: number;
	baz: boolean;
}

export type Config = Params & AnyProps;
export type Summary = Result & AnyProps;

/**
 * do stuff
 * @param  {Config} config
 */
export default function(config: Config): Promise<Summary>;