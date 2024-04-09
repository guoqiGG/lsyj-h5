
export default function randomString(len) {
// 　  const = len || 16
	const num=len || 16
　　const str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
　  const maxPos = str.length;
　  let value = ''
　　for (let i = 0; i < num; i++) {
　　　value += str.charAt(Math.floor(Math.random() * maxPos))
　　}
　　return value;
}