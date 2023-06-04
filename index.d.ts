interface Params {
	foo: string;
	bar: number;
	baz: boolean;
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