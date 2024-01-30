function main() {
    var canvas = document.getElementById('black');
    if (!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;
    const maxBacteriaRadius = 20;
    const maxBacteriaCount = 10;
    const frameRate = 60;

    const bacteriaProps = generateBacteria();
    requestAnimationFrame(drawFrame);

    function generateBacteria() {
        const bacteria = [];
        for (let i = 0; i < Math.ceil(Math.random() * maxBacteriaCount); i++) {
            const radius = Math.ceil(Math.random() * maxBacteriaRadius);
            const color = getRandomColor(bacteria.map(b => b.color));
            const angle = Math.random() * 360;
            bacteria.push({ radius, color, angle });
        }
        return bacteria;
    }

    function drawFrame() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        bacteriaProps.forEach(bacteria => {
            const bacteriaX = centerX + radius * Math.cos(bacteria.angle * Math.PI / 180);
            const bacteriaY = centerY + radius * Math.sin(bacteria.angle * Math.PI / 180);

            ctx.fillStyle = bacteria.color;
            ctx.beginPath();
            ctx.arc(bacteriaX, bacteriaY, bacteria.radius, 0, 2 * Math.PI);
            ctx.fill();

            bacteria.radius += 0.7;

        });

        setTimeout(() => requestAnimationFrame(drawFrame), 1000 / frameRate);
    }

    function getRandomColor(previousColors) {
        const letters = '0123456789ABCDEF';
        let color;
        do {
            color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
        } while (previousColors.includes(color));
        return color;
    }
}
main();