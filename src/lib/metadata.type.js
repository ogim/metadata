// @flow

type metadataObjectType = {
	filename: string,
	isDirectory: boolean,
	data: {name:string, btoa:string, ascii:string},
};

export type metadataType = [metadataObjectType];

