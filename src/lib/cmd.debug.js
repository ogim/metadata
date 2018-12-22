import cmd from './cmd';
import plist from 'plist';


(async()=>{

	const data = await cmd('mdls',[
		'-plist','-',
		'/Users/amigo/Projects/XTrade.AI/testcopy.txt',
	]);

	console.log(data.toString());


	console.log(plist.parse(data.toString()));


	// const data = await cmd('xattr',[
	// 	'-lx',
	// 	'/Users/amigo/Projects/XTrade.AI/testcopy.txt',
	// ]);

	// // write
	// await cmd('xattr',[
	// 	'-w',
	// 	'/Users/amigo/Projects/XTrade.AI/testcopy.txt',
	// ]);

	//console.log('==>', data.toString());
})()

