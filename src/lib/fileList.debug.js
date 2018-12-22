// @flow
import fileList from './fileList';

(async ()=>{
	const files = await fileList('/Users/amigo/Projects/XTrade.AI/learn/');


	console.log(files);



})();

