// @flow

export default (data: Array) => {
	const nrOfFilesProcessed = data.length,
		nrOfAttributesAdded = data
			.map(obj1 => obj1.data.filter(obj2 => obj2.action === 'ADD').length)
			.reduce((a, b) => a + b),
		nrOfAttributesChanged = data
			.map(obj1 => obj1.data.filter(obj2 => obj2.action === 'CHANGED').length)
			.reduce((a, b) => a + b);

	console.info(`Files processed: ${nrOfFilesProcessed}`);
	nrOfAttributesAdded &&
		console.info(`Added attributes: ${nrOfAttributesAdded}`);
	nrOfAttributesChanged &&
		console.info(`Changed attributes: ${nrOfAttributesChanged}`);

	if (nrOfFilesProcessed>0 && nrOfAttributesAdded ===0  && nrOfAttributesChanged ===0){
		console.info(`no extended attributes have changes since last time`);
	}
};
