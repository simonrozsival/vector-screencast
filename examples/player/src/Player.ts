import Player from '../../../src/lib/Player';

// wait, until the DOM is loaded
window.onload = () => {
	const player = new Player("player-container", {
		Source: "/data/demo-video.svg"
	});
	
	console.log(player.Events);
};